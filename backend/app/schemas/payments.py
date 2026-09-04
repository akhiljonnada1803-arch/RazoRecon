from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class OrderItemDTO(BaseModel):
    product_id: Optional[str] = None
    name: str
    price: float
    quantity: int = 1

class CreateOrderRequestDTO(BaseModel):
    amount: float = Field(..., description="Amount in INR")
    currency: Optional[str] = "INR"
    receipt: Optional[str] = None
    customer_email: Optional[str] = "merchant@acme.com"
    customer_phone: Optional[str] = "+919876543210"
    items: Optional[List[OrderItemDTO]] = []
    notes: Optional[Dict[str, Any]] = {}

class CreateOrderResponseDTO(BaseModel):
    order_id: str
    amount: float
    amount_paise: int
    currency: str
    receipt: Optional[str] = None
    status: str
    key_id: str
    checkout_session_url: str
    created_at: str

class VerifyPaymentRequestDTO(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    method: Optional[str] = "upi"
    email: Optional[str] = "merchant@acme.com"
    contact: Optional[str] = "+919876543210"
    vpa: Optional[str] = None
    bank: Optional[str] = None
    wallet: Optional[str] = None

class PaymentReconciliationResultDTO(BaseModel):
    transaction_id: str
    gross_amount: float
    gateway_fee: float # 2.0% MDR
    tax: float # 18% GST on fee
    expected_net_deposit: float
    status: str # "matched"
    vendor_account: str
    reconciled_at: str

class VerifyPaymentResponseDTO(BaseModel):
    success: bool
    message: str
    payment_id: str
    order_id: str
    status: str
    amount: float
    currency: str
    method: str
    fee: float
    tax: float
    net_amount: float
    reconciliation: PaymentReconciliationResultDTO

class RazorpayWebhookPayloadDTO(BaseModel):
    event: str # "payment.captured" | "order.paid" | "payment.failed"
    account_id: Optional[str] = "acc_rzp_live_2026"
    contains: Optional[List[str]] = ["payment", "order"]
    payload: Dict[str, Any]
    created_at: Optional[int] = None

class OrderDTO(BaseModel):
    id: str
    amount: float
    amount_paise: int
    currency: str
    receipt: Optional[str] = None
    status: str
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    items: List[Dict[str, Any]] = []
    notes: Dict[str, Any] = {}
    checkout_session_url: Optional[str] = None
    created_at: str
    updated_at: str

class PaymentDTO(BaseModel):
    id: str
    order_id: str
    amount: float
    currency: str
    status: str
    method: str
    razorpay_signature: Optional[str] = None
    fee: float
    tax: float
    net_amount: float
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    reconciled: bool
    reconciliation_id: Optional[str] = None
    created_at: str
    updated_at: str
