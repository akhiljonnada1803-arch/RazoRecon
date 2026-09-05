import pytest
from app.services.ai_search_service import ai_search_service
from app.services.review_service import review_service
from app.services.review_intelligence_service import review_intelligence_service
from app.services.emi_service import emi_service
from app.services.installation_service import installation_service
from app.services.merchant_analytics_service import merchant_analytics_service
from app.services.razorpay_analytics_service import razorpay_analytics_service
from app.services.logistics_intelligence_service import logistics_intelligence_service
from app.services.return_risk_service import return_risk_service
from app.services.decision_assistant_service import decision_assistant_service
from app.schemas.return_risk import ReturnRiskEvaluationRequest

def test_all_10_pillars_cohesive_execution():
    # Pillar 1: AI Product Advisor (Natural language query)
    advisor_res = ai_search_service.search_products(query="Smart POS machine under 20000 with 4.5+ rating")
    assert len(advisor_res.recommended_products) > 0
    top_product = advisor_res.recommended_products[0]
    prod_id = top_product.id

    # Pillar 2: Ratings & Reviews
    rating_summary = review_service.get_product_rating_summary(prod_id)
    assert rating_summary.average_rating >= 4.0

    # Pillar 3: Review Intelligence
    review_intel = review_intelligence_service.get_review_intelligence(prod_id)
    assert len(review_intel.pros) > 0
    assert review_intel.satisfaction_score > 0.8

    # Pillar 4: EMI Engine
    emi_options = emi_service.generate_all_emi_options(top_product.price)
    assert len(emi_options) >= 6
    best_emi = emi_service.recommend_best_emi(top_product.price)
    assert best_emi.recommended_plan.tenure in [3, 6, 9, 12, 18, 24]

    # Pillar 5: Installation Services
    install_services = installation_service.get_services_catalog()
    assert len(install_services) >= 4

    # Pillar 6: Merchant Analytics (7 visual charts)
    analytics_data = merchant_analytics_service.get_advanced_analytics(merchant_id="all", date_range="30d")
    charts = analytics_data["charts"]
    assert len(charts["revenue_trend"]) > 0
    assert len(charts["daily_orders"]) > 0

    # Pillar 7: Razorpay Analytics (Payments, Settlements, Refunds, MDR)
    razorpay_analytics = razorpay_analytics_service.get_analytics(timeframe="30d")
    assert razorpay_analytics.gross_revenue_inr > 0
    assert razorpay_analytics.net_revenue_inr > 0
    assert razorpay_analytics.mdr_charges_inr > 0

    # Pillar 8: Logistics Intelligence (SLA, Delay prediction, Pincode routing)
    logistics_routing = logistics_intelligence_service.recommend_carrier_for_pincode("560001")
    assert logistics_routing.on_time_probability_pct > 95.0

    # Pillar 9: Return Risk Prediction (Auto-mitigation suggestions)
    risk_res = return_risk_service.evaluate_return_risk(
        ReturnRiskEvaluationRequest(
            product_id=prod_id,
            price=top_product.price,
            payment_method="razorpay_autopay",
            has_installation_service=True
        )
    )
    assert risk_res.return_risk_tier == "LOW"

    # Pillar 10: Customer Decision Assistant (7 dimensions)
    decision_summary = decision_assistant_service.get_pre_purchase_decision(prod_id)
    assert len(decision_summary.pros) > 0
    assert len(decision_summary.cons) > 0
    assert len(decision_summary.similar_alternatives) > 0
    for alt in decision_summary.similar_alternatives:
        assert alt.high_rating_reason is not None
        assert alt.low_refund_reason is not None
        assert alt.positive_sentiment_reason is not None
