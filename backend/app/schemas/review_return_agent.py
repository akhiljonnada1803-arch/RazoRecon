from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class CustomerPrePurchaseIntelligenceDTO(BaseModel):
    product_id: str
    product_name: str
    # Required Before Purchase dimensions:
    review_summary: str = Field(..., description="Summarized AI synthesis of customer reviews")
    common_positives: List[str] = Field(..., description="Highlighted common pros with sentiment weight")
    common_concerns: List[str] = Field(..., description="Highlighted common concerns and recurring return friction")
    return_risk_score: float = Field(..., description="Predicted return probability percentage, e.g. 1.8")
    return_risk_tier: str = Field("LOW", description="LOW, MODERATE, ELEVATED, HIGH")
    explainable_recommendation: str = Field(..., description="Transparent AI reasoning on recommendation and risk mitigation")
    
    satisfaction_score: float
    recommendation_score: float
    total_reviews_analyzed: int
    verified_buyer_ratio_pct: float
    mitigation_action: Optional[Dict[str, Any]] = None

class MerchantComplaintCategoryDTO(BaseModel):
    id: str
    category_name: str
    complaint_count: int
    share_pct: float
    primary_return_reason: str
    return_rate_correlation_pct: float
    sample_quote: str

class MerchantReturnTrendPointDTO(BaseModel):
    period_label: str  # e.g. "Oct 2025", "Nov 2025"
    baseline_return_rate_pct: float
    actual_return_rate_pct: float
    prevented_returns_count: int
    saved_revenue_inr: float

class ProductSentimentAspectDTO(BaseModel):
    aspect: str  # "Battery Life", "Build Durability", "Operating Speed", "Usability & Setup", "Thermal Printing"
    positive_pct: float
    neutral_pct: float
    negative_pct: float
    sentiment_score: float  # -1.0 to +1.0
    sentiment_label: str  # "Strongly Positive", "Positive", "Mixed", "Negative"

class SuggestedImprovementDTO(BaseModel):
    id: str
    title: str
    issue_addressed: str
    recommended_action: str
    predicted_return_reduction_pct: float  # e.g. 72.0%
    expected_saved_revenue_inr: float
    confidence_score: float
    status: str = "PENDING"  # "PENDING" | "APPLIED"
    applied_at: Optional[str] = None

class ProductReturnSummaryDTO(BaseModel):
    product_id: str
    product_name: str
    category: str
    total_orders: int
    return_count: int
    return_rate_pct: float
    sentiment_score: float
    top_complaint: str
    return_risk_tier: str

class MerchantReviewReturnOverviewDTO(BaseModel):
    overall_return_rate_pct: float
    baseline_return_rate_pct: float
    predicted_return_reduction_pct: float
    overall_sentiment_score_pct: float
    total_saved_revenue_inr: float
    total_complaints_analyzed: int
    complaint_categories: List[MerchantComplaintCategoryDTO]
    return_trends: List[MerchantReturnTrendPointDTO]
    sentiment_aspects: List[ProductSentimentAspectDTO]
    suggested_improvements: List[SuggestedImprovementDTO]
    product_summaries: List[ProductReturnSummaryDTO]
