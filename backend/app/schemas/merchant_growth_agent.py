from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class GrowthRecommendationDTO(BaseModel):
    id: str
    category: str = Field(
        ..., 
        description="DECLINING_PRODUCT, REVENUE_OPPORTUNITY, DISCOUNT_RECOMMENDATION, BUNDLE_RECOMMENDATION, UPSELL_CROSS_SELL"
    )
    category_label: str
    title: str
    insight: str
    reason: str
    recommended_action: str
    expected_revenue_impact: str
    expected_revenue_lift_inr: float
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    target_product_id: Optional[str] = None
    target_product_name: Optional[str] = None
    target_product_image: Optional[str] = None
    current_metrics: Optional[Dict[str, Any]] = None
    tags: List[str] = []
    status: str = Field("PENDING", description="PENDING, APPLIED, DISMISSED")
    created_at: str
    action_type: str = Field("APPLY_STRATEGY", description="APPLY_STRATEGY, CREATE_BUNDLE, LAUNCH_CAMPAIGN, UPDATE_DISCOUNT")

class GrowthChatRequestDTO(BaseModel):
    message: str
    conversation_id: Optional[str] = "growth_chat_default"
    merchant_id: Optional[str] = "merch_acme_retail"

class GrowthChatResponseDTO(BaseModel):
    response: str
    recommendations: List[GrowthRecommendationDTO] = []
    suggested_queries: List[str] = []
    intent_detected: str
    conversation_id: str
    timestamp: str

class GrowthDashboardOverviewDTO(BaseModel):
    total_projected_lift_inr: float
    declining_skus_count: int
    open_opportunities_count: int
    active_campaigns_count: int
    avg_confidence_score: float
    recommendations: List[GrowthRecommendationDTO]
    recent_applied_actions: List[Dict[str, Any]] = []
    revenue_growth_waterfall: List[Dict[str, Any]] = []
