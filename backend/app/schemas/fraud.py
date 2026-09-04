from typing import List, Dict, Optional
from pydantic import BaseModel, Field

class FraudAlertDTO(BaseModel):
    alert_id: str
    txn_id: str
    date: str
    entity_name: str
    amount: float
    detection_type: str  # "Duplicate Payment" | "Amount Anomaly" | "Vendor Anomaly" | "Repeated Settlement Issue"
    triggered_rule: str  # e.g., "Amount > 3x historical average" | "Duplicate settlement ID" | "Unusual frequency"
    risk_score: int      # 0 to 100
    risk_level: str      # "Critical" | "High" | "Medium" | "Low"
    reason: str
    recommendation: str
    status: str          # "Active" | "Under Review" | "Blocked" | "Cleared"
    channel: Optional[str] = "Bank Feed"
    monetary_exposure: float
    evidence_trail: List[str] = Field(default_factory=list)

class FraudTimelineEventDTO(BaseModel):
    id: str
    timestamp: str
    event_title: str
    detection_type: str
    risk_level: str
    description: str
    monetary_impact: float
    action_taken: str

class FraudSummaryMetricsDTO(BaseModel):
    total_transactions_scanned: int
    active_alerts_count: int
    critical_alerts_count: int
    high_alerts_count: int
    medium_alerts_count: int
    low_alerts_count: int
    total_exposure_at_risk: float
    prevented_loss_amount: float
    anomaly_detection_rate_pct: float
    by_detection_type: Dict[str, int]

class FraudCenterResponseDTO(BaseModel):
    summary: FraudSummaryMetricsDTO
    alerts: List[FraudAlertDTO]
    timeline: List[FraudTimelineEventDTO]

class UpdateFraudAlertStatusRequestDTO(BaseModel):
    alert_id: str
    new_status: str  # "Blocked" | "Cleared" | "Under Review"
    operator_notes: Optional[str] = None
