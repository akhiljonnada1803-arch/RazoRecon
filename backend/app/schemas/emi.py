from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class EMIOptionDTO(BaseModel):
    tenure: int = Field(..., description="Tenure in months (3, 6, 9, 12, 18, 24)")
    tenure_label: str = Field(..., description="E.g. '6 Months'")
    emi_amount: float = Field(..., description="Monthly EMI installment amount")
    interest_rate: float = Field(..., description="Annual interest rate percentage (0.0 for No Cost)")
    total_interest: float = Field(..., description="Total cumulative interest over tenure")
    total_payable: float = Field(..., description="Total amount paid including principal & interest")
    processing_fee: float = Field(default=0.0, description="One-time bank/platform processing fee")
    emi_type: str = Field(..., description="no_cost | standard | bank")
    bank_name: Optional[str] = None
    is_recommended: bool = False
    recommendation_score: float = 0.0
    recommendation_badge: Optional[str] = None
    monthly_burden_pct: Optional[float] = None


class EMISpendingProfileDTO(BaseModel):
    user_id: Optional[str] = "usr_customer_demo"
    monthly_budget: float = 50000.0
    avg_monthly_spend: float = 14999.0
    discretionary_cashflow: float = 35001.0
    affordability_tier: str = "HIGH" # HIGH | BALANCED | STRETCHED
    historical_orders_count: int = 5


class EMIRecommendationRequestDTO(BaseModel):
    price: float = Field(..., gt=0, description="Product price in INR")
    user_id: Optional[str] = None
    monthly_budget: Optional[float] = None


class EMIRecommendationResponseDTO(BaseModel):
    price: float
    recommended_plan: EMIOptionDTO
    recommendation_reason: str
    all_options: List[EMIOptionDTO]
    plans_by_type: Dict[str, List[EMIOptionDTO]]
    spending_profile: EMISpendingProfileDTO
