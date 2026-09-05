import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.review_return_agent_service import review_return_agent_service

client = TestClient(app)

def test_customer_prepurchase_intelligence():
    """
    Verify customer pre-purchase intelligence provides:
    1. review_summary
    2. common_positives
    3. common_concerns
    4. return_risk_score
    5. explainable_recommendation
    """
    # Test for POS terminal
    res = review_return_agent_service.get_prepurchase_intelligence("prod_pos_terminal_01")
    assert res.product_id == "prod_pos_terminal_01"
    assert len(res.review_summary) > 20
    assert len(res.common_positives) >= 2
    assert len(res.common_concerns) >= 1
    assert 0.0 <= res.return_risk_score <= 100.0
    assert len(res.explainable_recommendation) > 20
    assert res.return_risk_tier in ["LOW", "MODERATE", "ELEVATED", "HIGH"]
    assert res.mitigation_action is not None

    # Test for Paper Rolls
    res_paper = review_return_agent_service.get_prepurchase_intelligence("prod_paper_rolls_01")
    assert "paper" in res_paper.review_summary.lower() or "thermal" in res_paper.review_summary.lower()
    assert len(res_paper.common_positives) >= 2
    assert len(res_paper.common_concerns) >= 1
    assert res_paper.return_risk_score > 0

def test_merchant_review_return_overview():
    """
    Verify merchant intelligence provides:
    - Complaint categories
    - Return trends
    - Product sentiment scores
    - Suggested improvements
    - Predicted return reduction impact
    """
    overview = review_return_agent_service.get_merchant_overview()
    assert overview.overall_return_rate_pct < overview.baseline_return_rate_pct
    assert overview.predicted_return_reduction_pct >= 50.0
    assert overview.overall_sentiment_score_pct >= 80.0
    assert overview.total_saved_revenue_inr > 100000.0

    # Complaint categories
    assert len(overview.complaint_categories) >= 4
    for cat in overview.complaint_categories:
        assert cat.id
        assert cat.category_name
        assert cat.complaint_count > 0
        assert cat.share_pct > 0
        assert cat.primary_return_reason

    # Return trends
    assert len(overview.return_trends) >= 5
    for tr in overview.return_trends:
        assert tr.period_label
        assert tr.baseline_return_rate_pct > 0
        assert tr.actual_return_rate_pct > 0

    # Sentiment aspects
    assert len(overview.sentiment_aspects) >= 4
    for asp in overview.sentiment_aspects:
        assert asp.aspect
        assert asp.positive_pct > 0
        assert -1.0 <= asp.sentiment_score <= 1.0

    # Suggested improvements with predicted reduction impact
    assert len(overview.suggested_improvements) >= 3
    for imp in overview.suggested_improvements:
        assert imp.id
        assert imp.title
        assert imp.issue_addressed
        assert imp.recommended_action
        assert imp.predicted_return_reduction_pct > 0
        assert imp.expected_saved_revenue_inr > 0
        assert 0.0 <= imp.confidence_score <= 1.0

def test_apply_return_mitigation_action():
    """
    Verify 1-click execution of a return reduction strategy with audit logging.
    """
    imp = review_return_agent_service.apply_mitigation("imp_pos_setup", actor_id="merchant_tester")
    assert imp is not None
    assert imp.status == "APPLIED"
    assert imp.applied_at is not None

def test_review_return_agent_api_endpoints():
    """
    Verify HTTP API endpoints for both customer pre-purchase and merchant console.
    """
    # 1. Customer Pre-Purchase Shield API
    res_cust = client.get("/api/v1/review-return/pre-purchase/prod_pos_terminal_01")
    assert res_cust.status_code == 200
    data_cust = res_cust.json()
    assert "review_summary" in data_cust
    assert "common_positives" in data_cust
    assert "common_concerns" in data_cust
    assert "return_risk_score" in data_cust
    assert "explainable_recommendation" in data_cust

    # 2. Merchant Overview API
    res_merch = client.get("/api/v1/review-return/merchant/overview")
    assert res_merch.status_code == 200
    data_merch = res_merch.json()
    assert "complaint_categories" in data_merch
    assert "return_trends" in data_merch
    assert "sentiment_aspects" in data_merch
    assert "suggested_improvements" in data_merch

    # 3. Apply Mitigation API
    res_act = client.post("/api/v1/review-return/merchant/mitigate/imp_cable_adapter")
    assert res_act.status_code == 200
    assert res_act.json()["status"] == "APPLIED"
