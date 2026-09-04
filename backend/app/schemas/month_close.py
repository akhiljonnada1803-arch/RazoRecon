from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class WorkflowStepResultDTO(BaseModel):
    step_number: int
    step_name: str
    description: str
    status: str  # "pending" | "in_progress" | "completed" | "failed"
    duration_ms: int
    details: Dict[str, Any]
    log_messages: List[str]

class MonthCloseResultDTO(BaseModel):
    records_processed: int
    match_rate: int
    exceptions: int
    fraud_alerts: int
    finance_health: int
    forecast: str
    status: str  # "Closed" | "Ready to Close" | "In Progress"
    closed_at: str
    cfo_signoff: str
    steps: List[WorkflowStepResultDTO]
    audit_pack_id: str

class ExecuteMonthCloseRequestDTO(BaseModel):
    period: Optional[str] = "March 2026"
    auto_approve_threshold: Optional[float] = 0.75
    enforce_policy_citations: Optional[bool] = True
