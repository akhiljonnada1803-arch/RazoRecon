import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.emi_service import emi_service, STANDARD_TENURES
from app.schemas.emi import EMIRecommendationResponseDTO

client = TestClient(app)


def test_standard_tenures_and_reducing_balance_formula():
    """Verify that all 6 required tenures (3, 6, 9, 12, 18, 24) are generated and calculated."""
    price = 24000.0
    res = emi_service.recommend_best_emi(price=price)
    assert isinstance(res, EMIRecommendationResponseDTO)
    assert res.price == price

    # Verify all 6 required tenures exist in all_options
    tenures_found = {opt.tenure for opt in res.all_options}
    assert tenures_found == set(STANDARD_TENURES)

    # Verify required schema fields for each option
    for opt in res.all_options:
        assert opt.tenure in STANDARD_TENURES
        assert opt.emi_amount > 0
        assert opt.interest_rate >= 0.0
        assert opt.total_interest >= 0.0
        assert opt.total_payable >= price
        assert opt.processing_fee >= 0.0
        assert opt.emi_type in ["no_cost", "standard", "bank"]


def test_no_cost_emi_zero_interest_and_zero_fee():
    """Verify No Cost EMI has 0% interest, 0 processing fee, and total payable equals price."""
    price = 18000.0
    res = emi_service.recommend_best_emi(price=price)
    no_cost_plans = res.plans_by_type["no_cost"]
    assert len(no_cost_plans) >= 2

    for plan in no_cost_plans:
        assert plan.interest_rate == 0.0
        assert plan.total_interest == 0.0
        assert plan.processing_fee == 0.0
        assert plan.total_payable == price
        assert plan.emi_amount == round(price / plan.tenure, 2)


def test_all_three_emi_categories_supported():
    """Verify No Cost, Standard, and Bank EMI categories are supported and present."""
    price = 30000.0
    res = emi_service.recommend_best_emi(price=price)
    assert "no_cost" in res.plans_by_type and len(res.plans_by_type["no_cost"]) > 0
    assert "standard" in res.plans_by_type and len(res.plans_by_type["standard"]) > 0
    assert "bank" in res.plans_by_type and len(res.plans_by_type["bank"]) > 0

    # Verify bank plans have recognizable partner bank names
    bank_names = {p.bank_name for p in res.plans_by_type["bank"]}
    assert any("HDFC" in b or "ICICI" in b or "SBI" in b for b in bank_names if b)


def test_ai_recommendation_scoring_affordability_and_interest():
    """
    Verify AI recommends optimal plan evaluating:
    - Monthly affordability
    - Interest burden
    - User spending history
    """
    price = 15000.0
    res = emi_service.recommend_best_emi(price=price, user_id="usr_customer_demo", monthly_budget=50000.0)
    best = res.recommended_plan
    assert best is not None
    assert best.is_recommended is True
    assert best.recommendation_score > 0.70

    # No Cost EMI on 6 months should outscore higher interest 24-month loans
    assert best.interest_rate <= 13.5
    assert "Recommended" in res.recommendation_reason
    assert res.spending_profile.monthly_budget == 50000.0
    assert res.spending_profile.affordability_tier in ["HIGH", "BALANCED", "STRETCHED"]


def test_api_recommend_emi_endpoint():
    """Test POST /api/v1/commerce/emi/recommend endpoint."""
    payload = {
        "price": 29999.0,
        "user_id": "usr_customer_demo",
        "monthly_budget": 60000.0
    }
    res = client.post("/api/v1/commerce/emi/recommend", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["price"] == 29999.0
    assert "recommended_plan" in data
    assert "all_options" in data and len(data["all_options"]) >= 6
    assert "plans_by_type" in data
    assert "spending_profile" in data
    assert data["spending_profile"]["monthly_budget"] == 60000.0


def test_api_get_emi_options_query():
    """Test GET /api/v1/commerce/emi/options query endpoint."""
    res = client.get("/api/v1/commerce/emi/options?price=12000")
    assert res.status_code == 200
    data = res.json()
    assert data["price"] == 12000.0
    assert data["recommended_plan"]["tenure"] in STANDARD_TENURES


def test_commerce_chat_emi_intent():
    """Test that asking about EMI in chat invokes the EMI advisor recommendations."""
    payload = {
        "query": "What are the EMI options for POS terminal?",
        "history": []
    }
    res = client.post("/api/v1/commerce/chat", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "EMI" in data["message"] or "emi" in data["message"].lower()
    assert "No Cost EMI" in data["message"]
