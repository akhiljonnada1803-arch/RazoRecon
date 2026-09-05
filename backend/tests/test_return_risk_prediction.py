import pytest
from app.services.return_risk_service import return_risk_service
from app.schemas.return_risk import ReturnRiskEvaluationRequest

def test_return_risk_evaluation_cod_vs_autopay():
    # COD request on hardware
    req_cod = ReturnRiskEvaluationRequest(
        product_id="prod_rzp_pos_v3_pro",
        price=18999.0,
        payment_method="cod",
        has_installation_service=False
    )
    res_cod = return_risk_service.evaluate_return_risk(req_cod)

    # AutoPay with Installation Service
    req_autopay = ReturnRiskEvaluationRequest(
        product_id="prod_rzp_pos_v3_pro",
        price=18999.0,
        payment_method="razorpay_autopay",
        has_installation_service=True
    )
    res_autopay = return_risk_service.evaluate_return_risk(req_autopay)

    # AutoPay + Installation should have drastically lower return risk
    assert res_autopay.return_probability_pct < res_cod.return_probability_pct
    assert res_autopay.return_risk_tier == "LOW"
    assert res_cod.return_risk_tier in ["HIGH", "CRITICAL"]

    # COD should trigger switch to AutoPay mitigation
    mitigation_types = [m.action_type for m in res_cod.recommended_mitigations]
    assert "SWITCH_TO_AUTOPAY" in mitigation_types
    assert "SUGGEST_INSTALLATION" in mitigation_types

def test_return_risk_analytics():
    analytics = return_risk_service.get_return_risk_analytics()
    assert analytics.overall_return_rate_pct < 5.0
    assert analytics.rto_reduction_achieved_pct > 70.0
    assert len(analytics.category_breakdown) >= 3
    assert len(analytics.tier_distribution) == 4
    assert len(analytics.recent_prevented_returns) >= 2
