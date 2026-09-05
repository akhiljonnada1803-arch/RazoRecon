import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.campaign_optimizer_service import campaign_optimizer_service
from app.schemas.campaign_optimizer import GenerateOptimizedCampaignRequestDTO

client = TestClient(app)

def test_campaign_optimizer_overview_and_mandatory_fields():
    """
    Verify overview returns historical sales trends, opportunities,
    and every campaign strictly contains all 5 mandatory fields:
    1. target_products
    2. campaign_objective
    3. predicted_roi
    4. estimated_revenue_increase
    5. confidence_score
    plus suggested_discount_pct.
    """
    overview = campaign_optimizer_service.get_overview()
    assert overview.total_campaigns >= 4
    assert overview.active_campaigns >= 2
    assert overview.total_projected_revenue_increase > 1000000.0
    assert overview.avg_predicted_roi > 200.0
    assert 0.0 <= overview.avg_confidence_score <= 1.0

    # Historical sales trends
    assert len(overview.historical_sales_trends) >= 4
    for trend in overview.historical_sales_trends:
        assert trend.category
        assert trend.historical_revenue > 0
        assert trend.order_volume > 0

    # Identified opportunities
    assert len(overview.identified_opportunities) >= 3
    for opp in overview.identified_opportunities:
        assert opp.id
        assert opp.title
        assert len(opp.target_skus) >= 1
        assert opp.recommended_discount_pct > 0

    # Campaigns - strict verification of mandatory fields
    for cmp in overview.campaigns:
        # Mandatory 1: target_products
        assert isinstance(cmp.target_products, list)
        assert len(cmp.target_products) >= 1
        # Mandatory 2: campaign_objective
        assert isinstance(cmp.campaign_objective, str)
        assert len(cmp.campaign_objective.strip()) > 5
        # Mandatory 3: predicted_roi
        assert isinstance(cmp.predicted_roi, (int, float))
        assert cmp.predicted_roi > 0
        assert "% ROI" in cmp.predicted_roi_display
        # Mandatory 4: estimated_revenue_increase
        assert isinstance(cmp.estimated_revenue_increase, (int, float))
        assert cmp.estimated_revenue_increase > 0
        assert "₹" in cmp.estimated_revenue_increase_display
        # Mandatory 5: confidence_score
        assert isinstance(cmp.confidence_score, float)
        assert 0.0 <= cmp.confidence_score <= 1.0
        
        # Suggested discount & financial fields
        assert cmp.suggested_discount_pct > 0
        assert len(cmp.trajectory) > 0
        assert len(cmp.channel_performance) > 0

def test_generate_ai_campaign():
    """
    Verify AI generation creates a complete campaign with all mandatory dimensions.
    """
    req = GenerateOptimizedCampaignRequestDTO(
        target_segment_id="seg_enterprise",
        campaign_objective="Expand Android POS Penetration Across Retail Outlets",
        target_products=["Razorpay Android Smart POS", "Thermal Paper Rolls 50-Pack"],
        suggested_discount_pct=15.0,
        min_order_value=10000.0,
        duration_days=14,
        channels=["WhatsApp Business", "Email Direct"]
    )
    new_cmp = campaign_optimizer_service.generate_optimized_campaign(req)

    assert new_cmp.id.startswith("camp_opt_")
    assert new_cmp.target_products == ["Razorpay Android Smart POS", "Thermal Paper Rolls 50-Pack"]
    assert new_cmp.campaign_objective == "Expand Android POS Penetration Across Retail Outlets"
    assert new_cmp.predicted_roi > 100.0
    assert new_cmp.estimated_revenue_increase > 0
    assert 0.0 <= new_cmp.confidence_score <= 1.0
    assert new_cmp.suggested_discount_pct == 15.0
    assert len(new_cmp.trajectory) == 14

def test_apply_campaign_improvement():
    """
    Verify 1-click execution of a recommended campaign improvement.
    """
    imp = campaign_optimizer_service.apply_improvement("rec_imp_01", actor_id="merchant_test")
    assert imp is not None
    assert imp.status == "APPLIED"
    assert imp.applied_at is not None

    # Check updated campaign
    overview = campaign_optimizer_service.get_overview()
    soundbox_camp = next((c for c in overview.campaigns if c.id == "camp_soundbox_blitz"), None)
    assert soundbox_camp is not None
    assert "Optimized" in soundbox_camp.estimated_revenue_increase_display

def test_campaign_optimizer_api_endpoints():
    """
    Verify REST endpoints return correct status codes and JSON payloads.
    """
    # 1. Overview
    res = client.get("/api/v1/campaigns/optimizer/overview")
    assert res.status_code == 200
    data = res.json()
    assert "total_campaigns" in data
    assert "historical_sales_trends" in data
    assert "identified_opportunities" in data
    assert len(data["campaigns"]) >= 4

    # 2. Opportunities
    res_opp = client.get("/api/v1/campaigns/optimizer/opportunities")
    assert res_opp.status_code == 200
    assert len(res_opp.json()) >= 3

    # 3. Generate Campaign
    payload = {
        "target_segment_id": "seg_d2c_growth",
        "campaign_objective": "Q2 Soundbox Volume Flash Rush",
        "target_products": ["Razorpay Soundbox 4G"],
        "suggested_discount_pct": 18.0,
        "min_order_value": 5000.0,
        "duration_days": 10,
        "channels": ["WhatsApp Business"]
    }
    res_gen = client.post("/api/v1/campaigns/optimizer/generate", json=payload)
    assert res_gen.status_code == 200
    gen_data = res_gen.json()
    assert gen_data["target_products"] == ["Razorpay Soundbox 4G"]
    assert gen_data["predicted_roi"] > 0
    assert gen_data["estimated_revenue_increase"] > 0
    assert 0.0 <= gen_data["confidence_score"] <= 1.0

    # 4. Apply Improvement
    res_apply = client.post("/api/v1/campaigns/optimizer/improvements/rec_imp_02/apply")
    assert res_apply.status_code == 200
    assert res_apply.json()["status"] == "APPLIED"
