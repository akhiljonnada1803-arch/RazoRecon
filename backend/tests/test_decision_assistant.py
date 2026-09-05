import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.decision_assistant_service import decision_assistant_service

client = TestClient(app)

def test_decision_assistant_service_all_7_dimensions():
    """Verify service generates all 7 dimensions when customer selects a product."""
    res = decision_assistant_service.get_pre_purchase_decision("prod_pos_smart_v3")

    # 1. Product Summary
    assert res.product_summary is not None
    assert len(res.product_summary) > 20
    assert res.target_audience is not None
    assert res.core_use_case is not None

    # 2. Pros
    assert len(res.pros) >= 2
    assert any("✓" in p for p in res.pros)

    # 3. Cons
    assert len(res.cons) >= 1
    assert any("✗" in c for c in res.cons)

    # 4. Rating Analysis
    assert 1.0 <= res.rating_analysis.average_rating <= 5.0
    assert res.rating_analysis.total_reviews > 0
    assert "5_star" in res.rating_analysis.rating_breakdown
    assert res.rating_analysis.verified_purchases_pct > 0

    # 5. Review Analysis
    assert res.review_analysis.satisfaction_score > 0
    assert "positive" in res.review_analysis.sentiment_breakdown
    assert res.review_analysis.pre_purchase_warning is not None

    # 6. EMI Suggestions
    assert len(res.emi_suggestions) >= 2
    assert res.best_emi_plan is not None
    assert res.best_emi_plan.monthly_installment_inr > 0

    # 7. Similar Alternatives (Must verify the 3 mandatory criteria)
    assert len(res.similar_alternatives) >= 1
    for alt in res.similar_alternatives:
        # Reason 1: High ratings
        assert "★" in alt.high_rating_reason or "Rating" in alt.high_rating_reason
        # Reason 2: Low refund history
        assert "Refund" in alt.low_refund_reason or "return" in alt.low_refund_reason.lower()
        # Reason 3: Positive review sentiment
        assert "Sentiment" in alt.positive_sentiment_reason or "satisfaction" in alt.positive_sentiment_reason.lower()
        assert alt.refund_rate_pct < 5.0  # Must be low refund
        assert alt.sentiment_score_pct >= 85.0  # Must be positive sentiment

def test_decision_assistant_api_endpoint():
    """Verify HTTP GET /api/v1/commerce/decision-assistant/{product_id}."""
    response = client.get("/api/v1/commerce/decision-assistant/prod_pos_smart_v3")
    assert response.status_code == 200
    data = response.json()
    
    assert data["product_id"] == "prod_pos_smart_v3"
    assert "product_summary" in data
    assert "pros" in data
    assert "cons" in data
    assert "rating_analysis" in data
    assert "review_analysis" in data
    assert "emi_suggestions" in data
    assert "similar_alternatives" in data
    assert len(data["similar_alternatives"]) >= 1
    
    alt0 = data["similar_alternatives"][0]
    assert "high_rating_reason" in alt0
    assert "low_refund_reason" in alt0
    assert "positive_sentiment_reason" in alt0
