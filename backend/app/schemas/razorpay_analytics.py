from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SettlementDTO(BaseModel):
    id: str
    amount: float
    fee: float
    tax: float
    net_amount: float
    status: str
    utr: Optional[str] = None
    settlement_time_hours: float
    bank_account: str
    payments_count: int
    created_at: str
    settled_at: Optional[str] = None

class RefundDTO(BaseModel):
    id: str
    payment_id: str
    order_id: Optional[str] = None
    amount: float
    currency: str = "INR"
    status: str
    speed: str = "normal"
    reason: Optional[str] = None
    notes: Optional[Dict[str, Any]] = None
    created_at: str
    processed_at: Optional[str] = None

class TriggerSettlementRequestDTO(BaseModel):
    amount: Optional[float] = None
    bank_account: Optional[str] = "HDFC Bank (Primary Payout) •••• 4892"

class CreateRefundRequestDTO(BaseModel):
    payment_id: str
    amount: float
    reason: Optional[str] = "Customer return request"
    speed: Optional[str] = "instant"
    notes: Optional[Dict[str, Any]] = None

class RevenueTrendPoint(BaseModel):
    date: str
    gross_volume: float
    net_revenue: float
    mdr_charges: float
    payments_count: int

class SettlementVelocityPoint(BaseModel):
    date: str
    settlement_hours: float
    settled_amount: float
    benchmark_sla: float = 24.0

class CategorySharePoint(BaseModel):
    name: str
    value: float
    count: int
    percentage: float
    color: str

class PaymentStatusSharePoint(BaseModel):
    status: str
    count: int
    amount: float
    percentage: float
    color: str

class RazorpayAnalyticsOverviewDTO(BaseModel):
    timeframe: str
    # Dashboard Metrics
    total_payments: int
    successful_payments: int
    failed_payments: int
    refunded_payments: int
    success_rate_pct: float
    
    # Settlement Metrics
    pending_settlement_inr: float
    pending_batches_count: int
    completed_settlement_inr: float
    completed_batches_count: int
    avg_settlement_time_hours: float
    next_payout_time: str
    primary_payout_bank: str

    # Financial Metrics
    gross_revenue_inr: float
    mdr_charges_inr: float
    gst_on_mdr_inr: float
    refunds_total_inr: float
    net_revenue_inr: float
    fee_efficiency_ratio_pct: float
    growth_yoy_pct: float

    # Visualizations
    revenue_trend: List[RevenueTrendPoint]
    settlement_velocity: List[SettlementVelocityPoint]
    payment_status_distribution: List[PaymentStatusSharePoint]
    payment_method_distribution: List[CategorySharePoint]
    mdr_cost_distribution: List[CategorySharePoint]

    # Recent Records
    recent_settlements: List[SettlementDTO]
    recent_refunds: List[RefundDTO]
