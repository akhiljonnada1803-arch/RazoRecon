from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class CarrierPerformanceDTO(BaseModel):
    name: str
    code: str
    on_time_pct: float
    avg_delivery_days: float
    rto_rate_pct: float
    ndr_recovery_pct: float
    customer_rating: float
    cost_per_kg: float
    badge: str
    fleet_type: str = "Dedicated Air & Surface"

class PincodeRoutingRecommendationDTO(BaseModel):
    pincode: str
    city: str
    state: str
    zone: str
    recommended_carrier: str
    carrier_code: str
    backup_carrier: str
    estimated_delivery_days: int
    on_time_probability_pct: float
    rto_risk_pct: float
    recommendation_reasons: List[str]
    confidence_score: float

class ShipmentMilestoneDTO(BaseModel):
    timestamp: str
    location: str
    status: str
    description: str
    is_completed: bool

class ShipmentTrackingDetailDTO(BaseModel):
    tracking_number: str
    order_id: str
    carrier_name: str
    carrier_code: str
    status: str
    origin: str
    destination: str
    pincode: str
    dispatched_at: str
    estimated_delivery: str
    delay_risk_pct: float
    delay_risk_level: str = Field("LOW", description="LOW, MODERATE, HIGH")
    delay_risk_factors: List[str] = []
    ai_reassurance_note: str
    milestones: List[ShipmentMilestoneDTO] = []

class LogisticsDailyTrendDTO(BaseModel):
    date: str
    delhivery: float
    bluedart: float
    ekart: float
    xpressbees: float
    shadowfax: float

class LogisticsFleetOverviewDTO(BaseModel):
    total_shipments_month: int
    on_time_delivery_rate: float
    avg_transit_hours: float
    rto_avoidance_rate: float
    total_rto_saved_inr: float
    active_dispatches: int
    carrier_performance: List[CarrierPerformanceDTO]
    daily_sla_trends: List[LogisticsDailyTrendDTO]
    hub_backlog_alerts: List[Dict[str, Any]] = []

class AutonomousDispatchAssignRequest(BaseModel):
    order_id: str
    destination_pincode: str
    package_weight_kg: float = 1.2
    priority: str = "EXPRESS"
    assigned_by: Optional[str] = "AI Autonomous Dispatcher"
