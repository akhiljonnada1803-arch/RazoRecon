from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class CommerceExceptionDTO(BaseModel):
    exception_id: str
    category: str  # "Payment Failure" | "Order Creation Failure" | "Shipping Delay" | "Inventory Shortage" | "Refund Issue" | "Courier API Failure"
    order_id: Optional[str] = None
    sku_id: Optional[str] = None
    customer_name: Optional[str] = None
    date: str
    amount: float
    severity: str    # "Critical" | "High" | "Medium" | "Low"
    status: str      # "Open" | "In Resolution" | "Resolved"
    root_cause: str
    impact: str
    action: str
    available_workflows: List[str] = Field(default_factory=list)
    confidence: int = 95
    channel: Optional[str] = "RazorCommerce Unified API"
    discrepancy_amount: Optional[float] = 0.0
    evidence: List[str] = Field(default_factory=list)
    resolved_action: Optional[str] = None

# Backward compatibility alias
class InvestigatedExceptionDTO(CommerceExceptionDTO):
    txn_id: Optional[str] = "TXN-2026-01"
    payout_id: Optional[str] = None
    type: Optional[str] = None

class ExceptionSummaryMetricsDTO(BaseModel):
    total_exceptions: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    total_exposure_amount: float
    auto_investigated_pct: float
    by_type: Dict[str, int]
    by_category: Optional[Dict[str, int]] = Field(default_factory=dict)
    resolved_count: int = 0

class ExceptionIntelligenceResponseDTO(BaseModel):
    summary: ExceptionSummaryMetricsDTO
    exceptions: List[CommerceExceptionDTO]
    status: str = "Success"

class ResolveExceptionRequestDTO(BaseModel):
    exception_id: str
    resolution_action: str
    notes: Optional[str] = None
