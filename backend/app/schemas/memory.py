from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ExceptionMemoryDTO(BaseModel):
    exception_id: str
    vendor_id: str
    exception_type: str
    root_cause: str
    resolution: str
    timestamp: str

class MemoryEventLogDTO(BaseModel):
    event_id: str
    vendor_id: str
    vendor: str
    trigger_event: str
    previous_risk: int
    updated_risk: int
    delta: int
    trend: str
    exception_type: str
    timestamp: str
    log_message: str

class VendorBehavioralProfileDTO(BaseModel):
    vendor_id: str
    vendor: str
    transactions: int
    exceptions: int
    top_issue: str
    risk_score: int
    trend: str  # "Increasing", "Decreasing", "Stable"
    avg_transaction_value: float
    duplicate_payment_count: int
    tax_mismatch_count: int
    settlement_delay_count: int
    last_updated: str
    recent_exceptions: List[ExceptionMemoryDTO] = Field(default_factory=list)
    recent_events: List[MemoryEventLogDTO] = Field(default_factory=list)

class VendorListResponseDTO(BaseModel):
    total_vendors_tracked: int
    high_risk_vendors: int
    profiles: List[VendorBehavioralProfileDTO]
    latest_events: List[MemoryEventLogDTO] = Field(default_factory=list)

class MemoryUpdateRequestDTO(BaseModel):
    vendor_id: str
    vendor_name: str
    transaction_amount: float
    has_exception: bool
    exception_type: Optional[str] = None
    root_cause: Optional[str] = None
    resolution: Optional[str] = None

class RecordExceptionRequestDTO(BaseModel):
    vendor_id: str
    vendor_name: str
    exception_type: str  # "Tax Mismatch", "Settlement Delay", "Duplicate Payment", "Unregistered Vendor"
    transaction_amount: float
    root_cause: Optional[str] = None
    resolution: Optional[str] = None
