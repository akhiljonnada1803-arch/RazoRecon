from __future__ import annotations
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class CartItemDTO(BaseModel):
    product_id: str
    sku: str
    name: str
    brand: str
    category: str
    price: float
    quantity: int
    subtotal: float
    image_url: str
    gst_rate_pct: float = 18.0
    hsn_sac_code: Optional[str] = "8470"
    active_offer: Optional[str] = None

class CartSummaryDTO(BaseModel):
    items_total: float = 0.0  # Total of GST-inclusive customer prices
    subtotal: float = 0.0  # Alias for items_total
    delivery_fee: float = 0.0
    platform_fee: float = 0.0
    gst_included_amount: float = 0.0  # GST embedded in items_total
    tax_amount: float = 0.0  # Alias for gst_included_amount
    discount_amount: float = 0.0
    discount_code: Optional[str] = None
    discount_pct: Optional[float] = 0.0
    final_amount: float = 0.0  # items_total + delivery_fee + platform_fee - discount_amount
    items_count: int = 0
    total_quantity: int = 0
    currency: str = "INR"

class CartDTO(BaseModel):
    id: str
    items: List[CartItemDTO] = []
    summary: CartSummaryDTO = Field(default_factory=CartSummaryDTO)
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_name: Optional[str] = None
    status: str = "active"  # active, converted, abandoned
    created_at: str
    updated_at: str

class AddToCartRequestDTO(BaseModel):
    product_id: str
    quantity: int = Field(default=1, ge=1, le=100)

class UpdateQuantityRequestDTO(BaseModel):
    quantity: int = Field(..., ge=0, le=100)

class ApplyCouponRequestDTO(BaseModel):
    code: str

class CheckoutOrderRequestDTO(BaseModel):
    cart_id: str
    customer_name: Optional[str] = "Acme Retail Enterprise"
    customer_email: Optional[str] = "procurement@acme.com"
    customer_phone: Optional[str] = "+91 98765 43210"
    shipping_address: Optional[str] = "Tower 4, Electronic City Phase 1, Bangalore 560100"
    notes: Optional[Dict[str, str]] = None

class CheckoutOrderResponseDTO(BaseModel):
    order_id: str
    cart_id: str
    receipt: str
    currency: str = "INR"
    items_total: float = 0.0
    order_amount: float
    delivery_fee: float = 0.0
    platform_fee: float = 0.0
    gst_included: float = 0.0
    taxes: float = 0.0
    discounts: float = 0.0
    final_amount: float
    status: str
    checkout_session_url: str
    payment_link: str
    qr_code_data: str
    items_count: int
    customer_email: str
    created_at: str

class AuditLogDTO(BaseModel):
    id: str
    entity_type: str  # cart, order, payment, agent
    entity_id: str
    actor: str  # Agent, User, Razorpay System, Reconciliation Engine
    event_type: str  # CART_CREATED, ITEM_ADDED, ITEM_REMOVED, QUANTITY_UPDATED, COUPON_APPLIED, ORDER_CREATED, PAYMENT_INITIATED, PAYMENT_VERIFIED, RECONCILED
    description: str
    metadata: Dict[str, Any] = {}
    created_at: str

class TransactionStatusDTO(BaseModel):
    transaction_id: str
    order_id: str
    payment_id: Optional[str] = None
    cart_id: Optional[str] = None
    amount: float
    currency: str = "INR"
    status: str  # created, processing, captured, failed, reconciled
    payment_method: Optional[str] = "upi"
    customer_email: Optional[str] = None
    reconciled: bool = False
    reconciliation_id: Optional[str] = None
    created_at: str
    updated_at: str

class AgentCommandRequestDTO(BaseModel):
    cart_id: Optional[str] = None
    prompt: str

class AgentCommandResponseDTO(BaseModel):
    cart: CartDTO
    agent_message: str
    suggested_actions: List[str] = []
    applied_action: Optional[str] = None
