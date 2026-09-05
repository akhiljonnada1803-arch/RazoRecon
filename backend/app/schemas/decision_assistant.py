from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class RatingAnalysisDTO(BaseModel):
    average_rating: float
    total_reviews: int
    rating_breakdown: Dict[str, float]  # e.g. {"5_star": 64.0, "4_star": 22.0, "3_star": 9.0, "2_star": 3.0, "1_star": 2.0}
    verified_purchases_pct: float
    recommendation_pct: float
    verdict: str

class ReviewAnalysisDTO(BaseModel):
    sentiment_breakdown: Dict[str, float]  # e.g. {"positive": 88.5, "neutral": 8.0, "negative": 3.5}
    satisfaction_score: float  # e.g. 91.5
    pros_summary: str
    cons_summary: str
    customer_verdict: str
    pre_purchase_warning: str

class EMISuggestionDTO(BaseModel):
    tenure_months: int
    monthly_installment_inr: float
    plan_type: str  # "NO_COST", "STANDARD", "BANK"
    interest_rate_pct: float
    total_interest_inr: float
    total_payable_inr: float
    processing_fee_inr: float
    is_recommended: bool
    affordability_badge: str

class AlternativeProductDTO(BaseModel):
    id: str
    sku: str
    name: str
    category: str
    price: float
    original_price: Optional[float] = None
    rating: float
    reviews_count: int
    image_url: str
    price_difference_inr: float
    key_advantage: str
    # 3 REQUIRED REASONS
    high_rating_reason: str
    low_refund_reason: str
    positive_sentiment_reason: str
    refund_rate_pct: float
    sentiment_score_pct: float

class PrePurchaseDecisionDTO(BaseModel):
    product_id: str
    product_name: str
    category: str
    price: float
    # 1. Product Summary
    product_summary: str
    target_audience: str
    core_use_case: str
    
    # 2. Pros
    pros: List[str]
    
    # 3. Cons
    cons: List[str]
    
    # 4. Rating Analysis
    rating_analysis: RatingAnalysisDTO
    
    # 5. Review Analysis
    review_analysis: ReviewAnalysisDTO
    
    # 6. EMI Suggestions
    emi_suggestions: List[EMISuggestionDTO]
    best_emi_plan: EMISuggestionDTO
    
    # 7. Similar Alternatives
    similar_alternatives: List[AlternativeProductDTO]
    
    ai_confidence_score: float = 95.8
    generated_at: str
