import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.review_intelligence_service import review_intelligence_service
from app.services.commerce_service import commerce_service
from app.schemas.reviews import ReviewIntelligenceDTO

client = TestClient(app)


def test_review_intelligence_generation():
    """Verify that ReviewIntelligenceService extracts pros, cons, sentiment, and scores."""
    intel = review_intelligence_service.analyze_reviews("prod_laptop_thinkpad")
    assert isinstance(intel, ReviewIntelligenceDTO)
    assert intel.product_id == "prod_laptop_thinkpad"
    assert len(intel.pros) > 0
    assert len(intel.cons) > 0
    assert all(p.startswith("✓") for p in intel.pros)
    assert all(c.startswith("✗") for c in intel.cons)
    assert intel.customer_sentiment in ["Overwhelmingly Positive", "Positive", "Mixed"]
    assert 85.0 <= intel.satisfaction_score <= 100.0
    assert 80.0 <= intel.recommendation_score <= 100.0
    assert "Customers love this product for" in intel.before_checkout_summary
    assert "dislike" in intel.before_checkout_summary or "note" in intel.before_checkout_summary


def test_pros_and_cons_aspect_matching():
    """Verify aspect-level detection for battery, performance, and weight."""
    intel = review_intelligence_service.analyze_reviews("prod_pos_smart_v3")
    pros_text = " ".join(intel.pros).lower()
    cons_text = " ".join(intel.cons).lower()

    # POS terminal reviews emphasize battery / performance / receipt printing
    assert any(term in pros_text for term in ["battery", "performance", "printing", "audio", "build"])
    # POS terminal reviews note weight or dock requirement
    assert any(term in cons_text for term in ["weight", "dock", "camera", "adapter"])


def test_api_get_review_intelligence():
    """Test GET /api/v1/reviews/intelligence/{product_id} API endpoint."""
    res = client.get("/api/v1/reviews/intelligence/prod_laptop_thinkpad")
    assert res.status_code == 200
    data = res.json()
    assert data["product_id"] == "prod_laptop_thinkpad"
    assert "pros" in data and len(data["pros"]) >= 2
    assert "cons" in data and len(data["cons"]) >= 1
    assert "satisfaction_score" in data and data["satisfaction_score"] > 80.0
    assert "recommendation_score" in data
    assert "customer_sentiment" in data
    assert "before_checkout_summary" in data
    assert len(data["before_checkout_summary"]) > 10


def test_commerce_chat_review_intelligence_integration():
    """Test that POST /api/v1/commerce/chat integrates review intelligence for pros/cons queries."""
    payload = {
        "query": "What are the pros and cons of Lenovo ThinkPad?",
        "history": []
    }
    res = client.post("/api/v1/commerce/chat", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "review_intelligence" in data
    assert data["review_intelligence"] is not None
    assert "before_checkout_summary" in data
    assert data["before_checkout_summary"] is not None
    assert "Pros" in data["message"] or "pros" in data["message"].lower()
    assert "Cons" in data["message"] or "cons" in data["message"].lower()


def test_commerce_product_detail_review_intelligence():
    """Test that commerce_service.get_product_by_id enriches product with review_intelligence."""
    prod = commerce_service.get_product_by_id("prod_laptop_thinkpad")
    assert prod is not None
    assert prod.review_intelligence is not None
    assert len(prod.review_intelligence.pros) > 0
    assert len(prod.review_intelligence.cons) > 0
