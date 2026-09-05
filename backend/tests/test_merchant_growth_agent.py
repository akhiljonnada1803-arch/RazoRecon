import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.merchant_growth_agent_service import merchant_growth_agent_service
from app.schemas.merchant_growth_agent import GrowthChatRequestDTO

client = TestClient(app)

def test_growth_agent_overview_and_schema_conformance():
    """Verify growth agent recommendations contain all 5 mandatory fields and valid categories."""
    overview = merchant_growth_agent_service.get_dashboard_overview()
    
    assert overview.total_projected_lift_inr > 500000.0
    assert overview.declining_skus_count >= 1
    assert overview.open_opportunities_count >= 1
    assert len(overview.recommendations) >= 5

    categories_seen = set()
    for rec in overview.recommendations:
        # Check all 5 mandatory fields required by user
        assert rec.insight is not None and len(rec.insight) > 10
        assert rec.reason is not None and len(rec.reason) > 10
        assert rec.recommended_action is not None and len(rec.recommended_action) > 10
        assert rec.expected_revenue_impact is not None and len(rec.expected_revenue_impact) > 5
        assert 0.0 <= rec.confidence_score <= 1.0
        assert rec.expected_revenue_lift_inr > 0
        categories_seen.add(rec.category)

    # Must cover: declining, opportunities, discounts, bundles, upsell/cross-sell
    assert "DECLINING_PRODUCT" in categories_seen
    assert "REVENUE_OPPORTUNITY" in categories_seen
    assert "DISCOUNT_RECOMMENDATION" in categories_seen
    assert "BUNDLE_RECOMMENDATION" in categories_seen
    assert "UPSELL_CROSS_SELL" in categories_seen

def test_conversational_chat_agent():
    """Verify chat engine parses intent, returns advice, and attaches actionable recommendation cards."""
    # 1. Declining products prompt
    res_dec = merchant_growth_agent_service.chat_with_growth_agent(
        GrowthChatRequestDTO(message="Which products are declining or losing sales?")
    )
    assert res_dec.intent_detected == "DETECT_DECLINING_PRODUCTS"
    assert len(res_dec.recommendations) >= 1
    assert res_dec.recommendations[0].category == "DECLINING_PRODUCT"
    assert len(res_dec.suggested_queries) >= 2

    # 2. Bundles prompt
    res_bnd = merchant_growth_agent_service.chat_with_growth_agent(
        GrowthChatRequestDTO(message="What bundles should I create to increase AOV?")
    )
    assert res_bnd.intent_detected == "RECOMMEND_BUNDLES"
    assert any(r.category == "BUNDLE_RECOMMENDATION" for r in res_bnd.recommendations)

    # 3. Revenue opportunities prompt
    res_opp = merchant_growth_agent_service.chat_with_growth_agent(
        GrowthChatRequestDTO(message="What revenue opportunities are available right now?")
    )
    assert res_opp.intent_detected == "DETECT_REVENUE_OPPORTUNITIES"
    assert any(r.category == "REVENUE_OPPORTUNITY" for r in res_opp.recommendations)

def test_apply_growth_strategy_and_audit():
    """Verify 1-click strategy application updates status and registers in activity log."""
    overview = merchant_growth_agent_service.get_dashboard_overview()
    target_rec = overview.recommendations[0]
    rec_id = target_rec.id

    applied = merchant_growth_agent_service.apply_recommendation(rec_id, applied_by="Lead Growth Strategist")
    assert applied is not None
    assert applied.status == "APPLIED"

    # Verify reflected in dashboard
    updated_overview = merchant_growth_agent_service.get_dashboard_overview()
    assert len(updated_overview.recent_applied_actions) > 0
    assert updated_overview.recent_applied_actions[0]["title"] == target_rec.title

def test_growth_agent_api_endpoints():
    """Verify REST API endpoints for overview, recommendations filtering, chat, and apply."""
    # GET Overview
    resp = client.get("/api/v1/merchant/growth-agent/overview")
    assert resp.status_code == 200
    data = resp.json()
    assert "total_projected_lift_inr" in data
    assert len(data["recommendations"]) >= 5

    # GET Filtered Recommendations
    resp_filter = client.get("/api/v1/merchant/growth-agent/recommendations?category=DECLINING_PRODUCT")
    assert resp_filter.status_code == 200
    filter_data = resp_filter.json()
    assert len(filter_data) >= 1
    assert filter_data[0]["category"] == "DECLINING_PRODUCT"

    # POST Chat
    resp_chat = client.post("/api/v1/merchant/growth-agent/chat", json={"message": "Suggest discounts for slow inventory"})
    assert resp_chat.status_code == 200
    chat_data = resp_chat.json()
    assert "response" in chat_data
    assert len(chat_data["recommendations"]) >= 1
