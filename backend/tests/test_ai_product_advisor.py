import pytest
from app.services.ai_search_service import ai_search_service
from app.services.commerce_service import commerce_service, SAMPLE_PRODUCTS
from app.schemas.commerce import ProductDTO, ProductSpecDTO, AdvisorRecommendRequestDTO
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_intent_parsing_budget():
    """Test extracting budget in multiple natural language formats."""
    q1 = "Best laptop under ₹60,000"
    intent1 = ai_search_service.parse_user_intent(q1)
    assert intent1.budget == 60000.0

    q2 = "Smart TV under ₹40,000 with 4.5+ rating"
    intent2 = ai_search_service.parse_user_intent(q2)
    assert intent2.budget == 40000.0
    assert intent2.rating_min == 4.5

    q3 = "POS terminal below 15k"
    intent3 = ai_search_service.parse_user_intent(q3)
    assert intent3.budget == 15000.0


def test_intent_parsing_specs_and_brands():
    """Test extracting desired specs, category domains, and preferred brands."""
    q1 = "Printer with low maintenance cost"
    intent1 = ai_search_service.parse_user_intent(q1)
    assert "low maintenance" in intent1.desired_specs or "low maintenance cost" in intent1.desired_specs
    assert intent1.category == "printers"

    q2 = "POS machine for small retail shop"
    intent2 = ai_search_service.parse_user_intent(q2)
    assert any("small retail" in s or "retail shop" in s for s in intent2.desired_specs)
    assert intent2.category == "pos_machines"

    q3 = "Sony 4K TV under 50000"
    intent3 = ai_search_service.parse_user_intent(q3)
    assert "Sony" in intent3.preferred_brands
    assert "4k" in intent3.desired_specs
    assert intent3.budget == 50000.0


def test_ranking_formula_exact_weights():
    """
    Verify the exact 5-factor mathematical weighting:
    - Budget Match = 30% (0.30)
    - Specs Match = 30% (0.30)
    - Rating Score = 20% (0.20)
    - Review Sentiment = 10% (0.10)
    - Popularity Score = 10% (0.10)
    """
    prod = ProductDTO(
        id="prod_test_exact",
        name="Test Laptop Pro 16",
        brand="Lenovo",
        category="Workstations & Laptops",
        price=50000.0,
        currency="INR",
        rating=5.0,
        reviews_count=200,
        image_url="https://example.com/test.jpg",
        tagline="Test high performance laptop",
        description="Core i5 16GB SSD",
        features=["16GB RAM", "512GB SSD"],
        specs=[ProductSpecDTO(key="Processor", value="Core i5")],
        review_sentiment_score=1.0,
        popularity_score=1.0
    )

    intent = ai_search_service.parse_user_intent("Best laptop under 50000 with 16GB")
    score, breakdown = ai_search_service.calculate_product_ranking(prod, intent)

    # Verify formula breakdown fields exist
    assert "budget_match" in breakdown
    assert "specs_match" in breakdown
    assert "rating_score" in breakdown
    assert "review_sentiment" in breakdown
    assert "popularity_score" in breakdown
    assert "total_score" in breakdown

    # Verify mathematical sum: 0.30 * B + 0.30 * S + 0.20 * R + 0.10 * Sent + 0.10 * Pop
    computed_sum = (
        0.30 * breakdown["budget_match"] +
        0.30 * breakdown["specs_match"] +
        0.20 * breakdown["rating_score"] +
        0.10 * breakdown["review_sentiment"] +
        0.10 * breakdown["popularity_score"]
    )
    assert round(computed_sum, 3) == round(breakdown["total_score"], 3)


def test_example_query_1_laptop_under_60k():
    """Query: 'Best laptop under ₹60,000'"""
    res = ai_search_service.recommend("Best laptop under ₹60,000", SAMPLE_PRODUCTS, limit=3)
    
    # Verify return schema
    assert hasattr(res, "recommended_products")
    assert hasattr(res, "recommendation_reason")
    assert hasattr(res, "confidence_score")
    assert len(res.recommended_products) > 0

    top = res.recommended_products[0]
    # Should recommend Lenovo ThinkPad L14 or ASUS / HP laptop under ₹60,000
    assert top.price <= 60000.0
    assert "laptop" in top.name.lower() or "thinkpad" in top.name.lower() or "expertbook" in top.name.lower() or "probook" in top.name.lower()
    assert res.confidence_score > 0.80
    assert "60,000" in res.recommendation_reason or "budget" in res.recommendation_reason.lower()


def test_example_query_2_smart_tv_under_40k_4_5_plus():
    """Query: 'Smart TV under ₹40,000 with 4.5+ rating'"""
    res = ai_search_service.recommend("Smart TV under ₹40,000 with 4.5+ rating", SAMPLE_PRODUCTS, limit=3)
    
    assert len(res.recommended_products) > 0
    top = res.recommended_products[0]
    assert top.price <= 40000.0
    assert top.rating >= 4.5
    assert "Sony Bravia" in top.name or "TV" in top.name
    assert res.confidence_score >= 0.85
    assert "4.5" in res.recommendation_reason or "rating" in res.recommendation_reason.lower()


def test_example_query_3_pos_small_retail():
    """Query: 'POS machine for small retail shop'"""
    res = ai_search_service.recommend("POS machine for small retail shop", SAMPLE_PRODUCTS, limit=3)
    
    assert len(res.recommended_products) > 0
    top = res.recommended_products[0]
    assert top.category == "Payment Terminals"
    assert "pos" in top.name.lower()
    assert res.confidence_score > 0.70
    assert len(res.recommendation_reason) > 20


def test_example_query_4_printer_low_maintenance():
    """Query: 'Printer with low maintenance cost'"""
    res = ai_search_service.recommend("Printer with low maintenance cost", SAMPLE_PRODUCTS, limit=3)
    
    assert len(res.recommended_products) > 0
    top = res.recommended_products[0]
    assert top.category == "Receipt & Billing Printers"
    # Epson TM-T82X is a thermal printer with ultra low maintenance cost
    assert "epson" in top.name.lower() or "thermal" in top.name.lower() or "printer" in top.name.lower()
    assert res.confidence_score > 0.70
    assert "maintenance" in res.recommendation_reason.lower() or "thermal" in res.recommendation_reason.lower()


def test_explain_why_product_recommended():
    """Verify that every recommended product includes 'why_recommended' and detailed reasoning."""
    res = ai_search_service.recommend("Best laptop under ₹60,000", SAMPLE_PRODUCTS, limit=3)
    for p in res.recommended_products:
        assert p.why_recommended is not None
        assert len(p.why_recommended) > 10
        assert p.match_score is not None
        assert p.ranking_breakdown is not None


def test_api_advisor_recommend_endpoint():
    """Test dedicated POST /api/v1/commerce/advisor/recommend endpoint."""
    response = client.post(
        "/api/v1/commerce/advisor/recommend",
        json={"query": "Smart TV under ₹40,000 with 4.5+ rating", "limit": 3}
    )
    assert response.status_code == 200
    data = response.json()
    assert "recommended_products" in data
    assert "recommendation_reason" in data
    assert "confidence_score" in data
    assert data["confidence_score"] > 0.0
    assert len(data["recommended_products"]) > 0
    top_tv = data["recommended_products"][0]
    assert top_tv["price"] <= 40000.0
    assert top_tv["rating"] >= 4.5


def test_api_commerce_chat_advisor_integration():
    """Test that existing POST /api/v1/commerce/chat integrates advisor recommendations."""
    response = client.post(
        "/api/v1/commerce/chat",
        json={"query": "Printer with low maintenance cost"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "recommended_products" in data
    assert len(data["recommended_products"]) > 0
    assert "recommendation_reason" in data
    assert "confidence_score" in data
    assert data["confidence_score"] > 0.0
    # Response message should indicate advisor match confidence
    assert "Match Confidence" in data["message"]
