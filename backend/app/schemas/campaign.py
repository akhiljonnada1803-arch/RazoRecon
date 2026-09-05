from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class CustomerSegmentDTO(BaseModel):
    id: str
    name: str
    description: str
    merchant_count: int
    avg_order_value: float
    total_gmv: float
    churn_risk_pct: float
    avg_margin_pct: float
    tags: List[str] = []
    recommended_discount_range: str
    optimal_channel: str

class DailyForecastPointDTO(BaseModel):
    day: int
    date_label: str
    baseline_revenue: float
    projected_campaign_revenue: float
    incremental_lift: float
    projected_orders: int

class CampaignDTO(BaseModel):
    id: str
    name: str
    target_segment: str
    target_segment_id: str
    status: str # "active" | "scheduled" | "draft" | "completed"
    discount_type: str # "percentage" | "flat_inr"
    discount_value: float
    min_order_value: float
    expected_revenue_lift: float # In INR
    expected_revenue_lift_pct: float # In %
    projected_orders: int
    projected_gmv: float
    net_margin_impact_pct: float
    roi_percentage: float
    ai_copy_subject: str
    ai_copy_body: str
    channels: List[str] = ["WhatsApp Business", "Email"]
    forecast_days: List[DailyForecastPointDTO] = []
    merchant_id: Optional[str] = "rzp_live_acme_8842"
    created_at: str
    start_date: str
    end_date: str

class CampaignGenerateRequestDTO(BaseModel):
    goal: str # "revenue_surge" | "winback" | "new_launch" | "inventory_clearance"
    target_segment_id: str
    discount_type: Optional[str] = "percentage"
    discount_value: Optional[float] = 15.0
    min_order_value: Optional[float] = 5000.0
    duration_days: Optional[int] = 14
    channels: Optional[List[str]] = ["WhatsApp Business", "Email"]

class CampaignSimulationRequestDTO(BaseModel):
    target_segment_id: str
    discount_type: str = "percentage" # "percentage" | "flat_inr"
    discount_value: float = 15.0
    min_order_value: float = 5000.0
    duration_days: int = 14
    estimated_reach_merchants: Optional[int] = None

class CampaignSimulationResponseDTO(BaseModel):
    target_segment_name: str
    target_merchant_reach: int
    discount_type: str
    discount_value: float
    price_elasticity_factor: float
    conversion_rate_lift_pct: float
    projected_orders: int
    baseline_orders: int
    incremental_orders: int
    baseline_revenue: float
    gross_campaign_revenue: float
    discount_cost: float
    net_revenue_lift: float # Expected Revenue Lift in INR
    expected_revenue_lift_pct: float # Expected Revenue Lift in %
    baseline_margin_pct: float
    projected_margin_pct: float
    net_margin_impact_pct: float
    roi_percentage: float
    ai_strategy_verdict: str
    daily_payoff: List[DailyForecastPointDTO] = []

class CampaignListResponseDTO(BaseModel):
    total_campaigns: int
    active_campaigns: int
    aggregate_expected_revenue_lift: float
    total_projected_orders: int
    avg_expected_lift_pct: float
    campaigns: List[CampaignDTO] = []
    segments: List[CustomerSegmentDTO] = []
