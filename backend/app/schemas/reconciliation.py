from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class OrderLifecycleDTO(BaseModel):
    stage: str # "Pending Payment" | "Paid" | "Merchant Approved" | "Packed" | "Shipped" | "Delivered" | "Returned/Refunded"
    timestamp: str
    description: str
    completed: bool = True

class CommerceTransactionDTO(BaseModel):
    id: str
    order_id: str
    customer_name: str
    customer_email: str
    product_title: str
    quantity: int = 1
    amount: float
    currency: str = "INR"
    payment_method: str # "Razorpay UPI", "Razorpay Cards", "Razorpay NetBanking", "COD"
    payment_status: str # "Captured", "Authorized", "Refunded", "Failed"
    lifecycle_stage: str # "Pending Payment", "Paid", "Merchant Approved", "Packed", "Shipped", "Delivered", "Returned/Refunded"
    carrier: Optional[str] = "Delhivery Express"
    tracking_number: Optional[str] = None
    is_agent_purchase: bool = False
    agent_name: Optional[str] = None
    created_at: str
    updated_at: str
    timeline: List[OrderLifecycleDTO] = Field(default_factory=list)

class CommerceTransactionSummaryDTO(BaseModel):
    total_orders: int
    total_gmv_inr: float
    payments_captured_count: int
    refunds_processed_count: int
    refunds_total_inr: float
    active_shipments_count: int
    delivered_count: int
    agent_purchases_count: int
    agent_gmv_inr: float
    lifecycle_breakdown: Dict[str, int]
    carrier_breakdown: Dict[str, int]

class CommerceTransactionResponseDTO(BaseModel):
    summary: CommerceTransactionSummaryDTO
    transactions: List[CommerceTransactionDTO]
    status: str = "Success"

# Backward compatibility DTOs
class MatchDTO(BaseModel):
    txn_id: str
    deposit_amount: float
    payout_id: Optional[str] = None
    expected_net: Optional[float] = None
    discrepancy: Optional[float] = None
    status: str
    note: str = ""
    # Augmented commerce metadata
    order_id: Optional[str] = None
    lifecycle_stage: Optional[str] = None
    is_agent_purchase: Optional[bool] = False

class ReconciliationSummaryDTO(BaseModel):
    deposits_examined: int
    by_status: Dict[str, int]
    auto_matched_pct: float
    reserve_or_short_held: float
    total_gmv_inr: Optional[float] = 485290.00
    agent_purchases_pct: Optional[float] = 38.5
    lifecycle_breakdown: Optional[Dict[str, int]] = Field(default_factory=dict)

class ReconciliationResponseDTO(BaseModel):
    summary: ReconciliationSummaryDTO
    matches: List[MatchDTO]
    commerce_transactions: Optional[List[CommerceTransactionDTO]] = Field(default_factory=list)

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
        "Payment Failure": 12,
        "Shipping Delay": 8,
        "Inventory Shortage": 5,
        "Courier API Failure": 3,
        "Refund Issue": 2
    })
    status: Optional[str] = "Transaction Engine Synchronized"
