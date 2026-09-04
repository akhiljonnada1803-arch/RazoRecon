from __future__ import annotations
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ReasoningTraceDTO(BaseModel):
    goal: str
    thought: str
    observation: str
    action_taken: str
    decision_rationale: str
    json_payload: Optional[Dict[str, Any]] = None

class HeroAuditLogDTO(BaseModel):
    id: str
    step_number: int
    actor: str  # Merchant, AI Embeddings Engine, Customer, Commerce Agent, Razorpay Gateway, Reconciliation Engine
    event_type: str
    description: str
    timestamp: str
    metadata: Dict[str, Any] = {}

class HeroRiskCheckDTO(BaseModel):
    risk_level: str  # LOW, MEDIUM, HIGH
    risk_score: int  # 0-100 (0 is best)
    fraud_flags: List[str] = []
    credit_limit_inr: float = 500000.0
    settlement_variance_inr: float = 0.0
    gst_compliance_status: str = "COMPLIANT"
    reconciliation_verified: bool = True

class HeroTransactionDTO(BaseModel):
    transaction_id: str
    order_id: str
    payment_id: Optional[str] = None
    gross_amount: float
    tax_amount: float
    discount_amount: float
    net_deposit: float
    gateway_fee: float
    gst_on_fee: float
    payment_method: str = "upi"
    status: str  # created, captured, reconciled
    journal_vouchers: List[Dict[str, Any]] = []
    timestamp: str

class HeroProductItemDTO(BaseModel):
    id: str
    sku: str
    name: str
    brand: str
    category: str
    price: float
    original_price: Optional[float] = None
    rating: float = 4.9
    image_url: str
    key_features: List[str] = []
    gst_rate_pct: float = 18.0
    active_offer: Optional[str] = None
    match_score_pct: int = 98

class HeroCartItemDTO(BaseModel):
    product_id: str
    sku: str
    name: str
    price: float
    quantity: int
    subtotal: float
    gst_rate_pct: float = 18.0
    image_url: str

class HeroMemoryProfileDTO(BaseModel):
    customer_id: str
    customer_name: str
    tier: str  # Enterprise Platinum, Growth Gold, Starter
    total_spend_inr: float
    orders_count: int
    aov_inr: float
    affinity_categories: List[str] = []
    risk_profile: str = "LOW RISK (Score: 4/100)"
    last_purchased_sku: str
    last_purchase_date: str
    loyalty_points: int

class HeroStepDataDTO(BaseModel):
    step_number: int
    step_key: str
    title: str
    subtitle: str
    actor: str
    status: str  # pending, in_progress, completed
    timestamp: str
    data: Dict[str, Any] = {}
    reasoning: ReasoningTraceDTO
    audit_log: HeroAuditLogDTO
    risk_check: HeroRiskCheckDTO
    transaction: Optional[HeroTransactionDTO] = None

class HeroScenarioDTO(BaseModel):
    id: str
    title: str
    business_type: str
    customer_name: str
    customer_email: str
    initial_prompt: str
    budget_inr: float
    target_category: str
    recommended_skus: List[str]
    upsell_sku: str
    future_skus: List[str]

class HeroDemoStateDTO(BaseModel):
    session_id: str
    scenario: HeroScenarioDTO
    current_step: int  # 1 to 10
    is_completed: bool = False
    steps: List[HeroStepDataDTO] = []
    active_cart_items: List[HeroCartItemDTO] = []
    cart_subtotal: float = 0.0
    cart_tax: float = 0.0
    cart_discount: float = 0.0
    cart_final: float = 0.0
    applied_coupon: Optional[str] = None
    order_id: Optional[str] = None
    payment_id: Optional[str] = None
    payment_link: Optional[str] = None
    reconciled: bool = False
    memory_profile: Optional[HeroMemoryProfileDTO] = None
    future_recommendations: List[HeroProductItemDTO] = []
    audit_logs: List[HeroAuditLogDTO] = []
    transactions: List[HeroTransactionDTO] = []

class StepExecutionRequestDTO(BaseModel):
    session_id: Optional[str] = None
    scenario_id: Optional[str] = "mumbai_retail_expansion"
    step_number: int = 1

class RunAllRequestDTO(BaseModel):
    session_id: Optional[str] = None
    scenario_id: Optional[str] = "mumbai_retail_expansion"
    delay_ms: int = 0
