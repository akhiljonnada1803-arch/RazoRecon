from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SalesCategoryTrendDTO(BaseModel):
    category: str
    historical_revenue: float
    order_volume: int
    yoy_growth_pct: float
    avg_margin_pct: float
    sales_velocity: str  # "HIGH", "MODERATE", "ACCELERATING", "DECLINING"
    top_selling_sku: str

class CampaignOpportunityDTO(BaseModel):
    id: str
    title: str
    category: str
    target_segment: str
    rationale: str
    recommended_discount_pct: float
    estimated_revenue_potential: float
    confidence_score: float
    target_skus: List[str]

class DailyTrajectoryPointDTO(BaseModel):
    day: int
    date_label: str
    baseline_revenue: float
    campaign_revenue: float
    incremental_lift: float
    conversion_rate_pct: float
    orders_count: int

class ChannelPerformanceDTO(BaseModel):
    channel: str  # "WhatsApp Business", "Email", "In-App Banner", "SMS Gateway"
    sent_count: int
    open_rate_pct: float
    click_through_rate_pct: float
    conversion_rate_pct: float
    revenue_generated: float
    roas: float

class CampaignImprovementDTO(BaseModel):
    id: str
    campaign_id: str
    campaign_name: str
    recommendation_type: str  # "CHANNEL_REALLOCATION", "DISCOUNT_OPTIMIZATION", "MIN_ORDER_TWEAK", "BUNDLE_ATTACHMENT", "PACING_ACCELERATION"
    insight: str
    recommended_improvement: str
    expected_additional_lift: str
    expected_lift_inr: float
    confidence_score: float
    status: str = "PENDING"  # "PENDING" | "APPLIED"
    applied_at: Optional[str] = None

class OptimizedCampaignDTO(BaseModel):
    id: str
    name: str
    # Required by User Specification:
    target_products: List[str] = Field(..., description="List of target product names or SKUs")
    campaign_objective: str = Field(..., description="Strategic campaign objective")
    predicted_roi: float = Field(..., description="Predicted Return on Investment percentage e.g. 340.0")
    predicted_roi_display: str
    estimated_revenue_increase: float = Field(..., description="Estimated net revenue increase in INR")
    estimated_revenue_increase_display: str
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0")
    
    # Suggested discount & optimization details:
    suggested_discount_pct: float = Field(..., description="AI suggested optimal discount percentage")
    discount_code: str
    target_segment: str
    target_segment_id: str
    status: str = "active"  # "active" | "scheduled" | "completed" | "draft"
    channels: List[str] = ["WhatsApp Business", "Email"]
    
    # Financial metrics:
    campaign_spend_budget: float
    baseline_revenue: float
    projected_total_gmv: float
    projected_orders: int
    conversion_lift_pct: float
    price_elasticity: float
    net_margin_impact_pct: float
    
    # Creative & Timing:
    ai_copy_subject: str
    ai_copy_body: str
    start_date: str
    end_date: str
    duration_days: int
    created_at: str
    
    # Tracking & Telemetry:
    trajectory: List[DailyTrajectoryPointDTO] = []
    channel_performance: List[ChannelPerformanceDTO] = []

class GenerateOptimizedCampaignRequestDTO(BaseModel):
    opportunity_id: Optional[str] = None
    target_segment_id: str
    campaign_objective: str
    target_products: List[str]
    suggested_discount_pct: Optional[float] = 15.0
    min_order_value: Optional[float] = 5000.0
    duration_days: Optional[int] = 14
    channels: Optional[List[str]] = ["WhatsApp Business", "Email"]

class CampaignOptimizerOverviewDTO(BaseModel):
    total_campaigns: int
    active_campaigns: int
    total_projected_revenue_increase: float
    avg_predicted_roi: float
    avg_confidence_score: float
    top_performing_channel: str
    historical_sales_trends: List[SalesCategoryTrendDTO]
    identified_opportunities: List[CampaignOpportunityDTO]
    campaigns: List[OptimizedCampaignDTO]
    active_improvements: List[CampaignImprovementDTO]
    channel_attribution_summary: List[ChannelPerformanceDTO]
