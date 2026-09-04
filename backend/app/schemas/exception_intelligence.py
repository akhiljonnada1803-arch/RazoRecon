from typing import Optional, List, Dict
from pydantic import BaseModel, Field

class InvestigatedExceptionDTO(BaseModel):
    exception_id: str
    txn_id: str
    payout_id: Optional[str] = None
    date: str
    amount: float
    type: str  # "Missing Invoice" | "Duplicate Payment" | "Partial Settlement" | "Tax Mismatch" | "Delayed Settlement"
    root_cause: str
    impact: str
    action: str
    confidence: int  # 0 to 100
    severity: str    # "Critical" | "High" | "Medium" | "Low"
    status: str      # "Open" | "In Investigation" | "Resolved"
    channel: Optional[str] = None
    discrepancy_amount: Optional[float] = 0.0
    evidence: List[str] = Field(default_factory=list)

class ExceptionSummaryMetricsDTO(BaseModel):
    total_exceptions: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    total_exposure_amount: float
    auto_investigated_pct: float
    by_type: Dict[str, int]

class ExceptionIntelligenceResponseDTO(BaseModel):
    summary: ExceptionSummaryMetricsDTO
    exceptions: List[InvestigatedExceptionDTO]

class ResolveExceptionRequestDTO(BaseModel):
    exception_id: str
    resolution_action: str
    notes: Optional[str] = None
