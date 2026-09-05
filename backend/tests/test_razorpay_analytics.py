import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.razorpay_analytics_service import razorpay_analytics_service
from app.schemas.razorpay_analytics import TriggerSettlementRequestDTO, CreateRefundRequestDTO

client = TestClient(app)

def test_razorpay_analytics_overview_metrics():
    """Verify service returns complete Dashboard, Settlement, and Financial metrics."""
    overview = razorpay_analytics_service.get_analytics(timeframe="30d")
    
    # 1. Dashboard Metrics
    assert overview.total_payments > 0
    assert overview.successful_payments > 0
    assert overview.failed_payments >= 0
    assert overview.refunded_payments >= 0
    assert 0.0 <= overview.success_rate_pct <= 100.0

    # 2. Settlement Metrics
    assert overview.pending_settlement_inr >= 0.0
    assert overview.completed_settlement_inr > 0.0
    assert overview.avg_settlement_time_hours > 0.0
    assert "HDFC" in overview.primary_payout_bank

    # 3. Financial Metrics
    assert overview.gross_revenue_inr > 0.0
    assert overview.mdr_charges_inr > 0.0
    assert overview.net_revenue_inr > 0.0
    # Net revenue must equal gross minus MDR minus refunds
    expected_net = round(overview.gross_revenue_inr - (overview.mdr_charges_inr + overview.gst_on_mdr_inr) - overview.refunds_total_inr, 2)
    assert abs(overview.net_revenue_inr - expected_net) <= 1.0

    # 4. Visualizations: Line Charts
    assert len(overview.revenue_trend) > 0
    assert overview.revenue_trend[0].gross_volume > 0
    assert len(overview.settlement_velocity) > 0
    assert overview.settlement_velocity[0].settlement_hours > 0

    # 5. Visualizations: Pie Charts
    assert len(overview.payment_status_distribution) >= 2
    assert len(overview.payment_method_distribution) >= 3
    assert len(overview.mdr_cost_distribution) >= 2

def test_trigger_settlement_payout():
    """Verify triggering manual or scheduled settlement payout via Settlements API."""
    req = TriggerSettlementRequestDTO(amount=75000.0, bank_account="HDFC Bank (Primary Payout) •••• 4892")
    settlement = razorpay_analytics_service.trigger_settlement_payout(req)
    
    assert settlement.id.startswith("setl_rzp_")
    assert settlement.amount == 75000.0
    assert settlement.status == "settled"
    assert settlement.utr is not None
    assert settlement.net_amount < settlement.amount  # MDR deducted

    # Verify settlement appears in list
    settlements = razorpay_analytics_service.list_settlements(limit=10)
    assert any(s.id == settlement.id for s in settlements)

def test_create_and_list_refund():
    """Verify processing a refund via Refund API."""
    # Find or use a payment
    req = CreateRefundRequestDTO(
        payment_id="pay_seed_001",
        amount=1499.0,
        reason="Customer cancellation within 24 hours",
        speed="instant"
    )
    refund = razorpay_analytics_service.create_refund(req)
    
    assert refund.id.startswith("rfnd_rzp_")
    assert refund.amount == 1499.0
    assert refund.status == "processed"
    assert refund.speed == "instant"

    # Verify refund in list
    refunds = razorpay_analytics_service.list_refunds(limit=10)
    assert any(r.id == refund.id for r in refunds)

def test_api_endpoints():
    """Verify HTTP API endpoints for overview, settlements, and refunds."""
    # 1. Overview API
    res1 = client.get("/api/v1/razorpay/analytics/overview?timeframe=30d")
    assert res1.status_code == 200
    data1 = res1.json()
    assert "gross_revenue_inr" in data1
    assert "revenue_trend" in data1
    assert "settlement_velocity" in data1

    # 2. Settlements API
    res2 = client.get("/api/v1/razorpay/analytics/settlements")
    assert res2.status_code == 200
    assert isinstance(res2.json(), list)

    # 3. Trigger Settlement API
    res3 = client.post("/api/v1/razorpay/analytics/settlements/trigger", json={"amount": 50000.0})
    assert res3.status_code == 200
    assert res3.json()["status"] == "settled"

    # 4. Refunds API
    res4 = client.get("/api/v1/razorpay/analytics/refunds")
    assert res4.status_code == 200
    assert isinstance(res4.json(), list)
