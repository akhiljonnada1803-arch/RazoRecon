from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ReturnRiskFactorDTO(BaseModel):
    name: str
    impact_pts: float
    description: str
    is_favorable: bool

class ReturnRiskMitigationActionDTO(BaseModel):
    action_type: str = Field(..., description="SUGGEST_INSTALLATION, SWITCH_TO_AUTOPAY, VERIFY_SPECS, OFFER_ALTERNATIVE")
    title: str
    description: str
    estimated_risk_reduction_pct: float
    cta_label: str
    service_id: Optional[str] = None

class ReturnRiskEvaluationDTO(BaseModel):
    product_id: str
    product_name: str
    order_value: float
    payment_method: str
    return_probability_pct: float
    return_risk_tier: str = Field("LOW", description="LOW, MEDIUM, HIGH, CRITICAL")
    primary_risk_driver: str
    confidence_score: float
    explainability_factors: List[ReturnRiskFactorDTO]
    recommended_mitigations: List[ReturnRiskMitigationActionDTO]
    ai_advisor_verdict: str

class ReturnRiskEvaluationRequest(BaseModel):
    product_id: str
    price: float
    payment_method: str = "razorpay_autopay"  # cod, razorpay_autopay, razorpay_card, razorpay_upi
    customer_id: Optional[str] = "usr_customer_demo"
    pincode: Optional[str] = "560100"
    has_installation_service: bool = False

class ReturnRiskCategoryStatDTO(BaseModel):
    category: str
    return_rate_pct: float
    industry_benchmark_pct: float
    top_reason: str

class ReturnRiskTierDistributionDTO(BaseModel):
    tier: str
    order_share_pct: float
    avg_return_rate_pct: float
    color: str

class ReturnRiskAnalyticsDTO(BaseModel):
    overall_return_rate_pct: float
    rto_reduction_achieved_pct: float
    total_saved_revenue_inr: float
    interventions_triggered_count: int
    category_breakdown: List[ReturnRiskCategoryStatDTO]
    tier_distribution: List[ReturnRiskTierDistributionDTO]
    recent_prevented_returns: List[Dict[str, Any]]
