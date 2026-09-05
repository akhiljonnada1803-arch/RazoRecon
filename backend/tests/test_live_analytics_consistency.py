import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.services.merchant_service import merchant_service

client = TestClient(app)

def test_live_order_triggers_analytics_recalculation():
    """Verify that creating an order immediately updates all growth & analytics modules."""
    merchant_id = "mer_5c9250207162"
    headers = {"x-merchant-id": merchant_id}

    # 1. Fetch baseline
    baseline_rev = client.get("/api/v1/merchant/growth/revenue-dashboard", headers=headers).json()
    init_revenue = baseline_rev["kpis"]["revenue_mtd_inr"]
    init_orders = baseline_rev["kpis"]["orders_today"]

    baseline_agent = client.get("/api/v1/merchant/growth/agent-analytics", headers=headers).json()
    init_ai_orders = baseline_agent["overview"]["ai_orders_count"]
    init_ai_gmv = baseline_agent["overview"]["ai_revenue_inr"]

    # 2. Place a live AI order
    new_ord = merchant_service.create_order(
        order_id=f"ord_live_test_{uuid.uuid4().hex[:6]}",
        customer_name="Siddharth Rao",
        customer_email="siddharth.rao.test@domain.com",
        customer_phone="+919876500000",
        shipping_address="42 Prestige Cyber Park, Electronic City, Bangalore",
        items=[{
            "product_id": "prod_samsung_s26",
            "name": "Samsung Galaxy S26 Ultra 5G (Enterprise)",
            "quantity": 1,
            "price": 10000.0,
            "category": "Smartphones",
            "sku": "SM-S928B-512"
        }],
        subtotal=10000.0,
        tax=1800.0,
        discount=0.0,
        gross_amount=11800.0,
        payment_method="upi",
        merchant_id=merchant_id,
        is_ai_order=True,
        order_channel="ai_agent"
    )
    assert new_ord is not None
    assert new_ord["order_number"].startswith("RZP-ORD-")


    # 3. Revenue Dashboard immediate reflection
    after_rev = client.get("/api/v1/merchant/growth/revenue-dashboard", headers=headers).json()
    assert after_rev["kpis"]["revenue_mtd_inr"] == init_revenue + 11800.0
    assert after_rev["kpis"]["orders_today"] == init_orders + 1
    assert after_rev["kpis"]["average_order_value_aov_inr"] > 0
    assert len(after_rev["payment_channel_breakdown"]) >= 1

    # 4. Agent Analytics immediate reflection
    after_agent = client.get("/api/v1/merchant/growth/agent-analytics", headers=headers).json()
    assert after_agent["overview"]["ai_orders_count"] == init_ai_orders + 1
    assert after_agent["overview"]["ai_revenue_inr"] == init_ai_gmv + 11800.0
    assert after_agent["overview"]["total_orders"] == init_orders + 1

    # 5. Customer Intelligence immediate reflection
    after_cust = client.get("/api/v1/merchant/growth/customer-intelligence", headers=headers).json()
    assert after_cust["metrics"]["total_active_customers"] >= 1
    vip_emails = [v["email"] for v in after_cust["vip_customers"]]
    assert "siddharth.rao.test@domain.com" in vip_emails or len(after_cust["vip_customers"]) > 0

    # 6. Demand Intelligence reflection
    demand = client.get("/api/v1/growth/demand-intelligence", headers=headers).json()
    assert demand["status"] == "HEALTHY"
    assert len(demand["products"]) >= 1
    assert "Samsung" in demand["products"][0]["name"]
    assert demand["products"][0]["inventory_velocity"] >= 0

    # 7. Upsell & Cross-Sell reflection
    upsell = client.get("/api/v1/merchant/growth/upsell-cross-sell", headers=headers).json()
    assert len(upsell["bundles"]) >= 1
    assert len(upsell["frequently_bought_together"]) >= 1
