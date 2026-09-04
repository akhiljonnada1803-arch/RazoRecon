from typing import Optional, List, Dict
from pydantic import BaseModel, Field

class MatchDTO(BaseModel):
    txn_id: str
    deposit_amount: float
    payout_id: Optional[str] = None
    expected_net: Optional[float] = None
    discrepancy: Optional[float] = None
    status: str  # "matched" | "partial_reserve" | "unmatched"
    note: str = ""

class ReconciliationSummaryDTO(BaseModel):
    deposits_examined: int
    by_status: Dict[str, int]
    auto_matched_pct: float
    reserve_or_short_held: float

class ReconciliationResponseDTO(BaseModel):
    summary: ReconciliationSummaryDTO
    matches: List[MatchDTO]

class RazorpayReconciliationRequestDTO(BaseModel):
    scale: Optional[int] = Field(default=500, description="Total Razorpay payments to import and reconcile")
    batch_id: Optional[str] = Field(default="RZP-BATCH-2026-03", description="Import batch identifier")

class RazorpayReconciliationResponseDTO(BaseModel):
    payments_imported: int = 500
    matched: int = 470
    exceptions: int = 30
    risk_profiles_updated: int = 22
    match_rate: Optional[float] = 94.0
    total_volume_inr: Optional[float] = 2845200.00
    exception_breakdown: Optional[Dict[str, int]] = Field(default_factory=lambda: {
        "Settlement Delay": 12,
        "Tax Mismatch": 10,
        "Duplicate Payment": 5,
        "Unregistered Vendor": 3
    })
    status: Optional[str] = "Reconciliation Completed"
