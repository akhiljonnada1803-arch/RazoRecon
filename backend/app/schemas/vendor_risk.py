from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

# Merchant Analytics Models
class TopProductPerformanceDTO(BaseModel):
    id: str
    title: str
    category: str
    sales_count: int
    gmv_inr: float
    stock_status: str
    conversion_rate_pct: float

class ConversionMetricsDTO(BaseModel):
    cart_to_checkout_pct: float
    agent_conversion_pct: float
    repeat_buyer_rate_pct: float
    abandonment_recovery_pct: float

class MerchantAnalyticsDTO(BaseModel):
    revenue_runrate_inr: float
    gmv_growth_pct: float
    fulfillment_score: float # e.g. 98.4%
    inventory_health_pct: float # e.g. 94.2%
    in_stock_skus_count: int
    low_stock_skus_count: int
    top_products: List[TopProductPerformanceDTO]
    conversion_metrics: ConversionMetricsDTO

# Buyer Analytics Models
class BuyerCohortItemDTO(BaseModel):
    id: str
    name: str
    email: str
    ltv_inr: float
    orders_count: int
    avg_order_value_inr: float
    last_order_date: str
    churn_risk: str # "Low", "Medium", "High"
    preferred_category: str
    agent_buyer_user: bool
    recommended_product: str

class BuyingPatternDTO(BaseModel):
    channel: str # "Autonomous AI Agent", "Direct Storefront", "Social Campaign", "Affiliate Feed"
    orders_count: int
    share_pct: float
    avg_order_value_inr: float

class BuyerAnalyticsDTO(BaseModel):
    total_buyers_count: int
    avg_ltv_inr: float
    repeat_purchase_rate_pct: float
    ai_recommendations_influence_pct: float
    churn_risk_distribution: Dict[str, int] # {"Low": 64, "Medium": 24, "High": 12}
    buying_patterns: List[BuyingPatternDTO]
    top_buyers: List[BuyerCohortItemDTO]

# Backward compatibility Vendor Risk DTOs
class VendorRiskScoreDTO(BaseModel):
    vendor_id: str
    vendor: str
    risk_score: int
    risk_level: str  # "LOW", "MEDIUM", "HIGH"
    main_risk: str   # "Settlement Delays", "Duplicate Payments", "Tax Mismatches", "None"
    total_transactions: int
    total_exceptions: int
    duplicate_payment_count: int
    tax_mismatch_count: int
    settlement_delay_count: int
    avg_transaction_value: float
    factors_breakdown: Dict[str, float]
    status: str

class RiskDistributionPointDTO(BaseModel):
    level: str  # "Low", "Medium", "High"
    count: int
    percentage: float
    color: str

class RiskTrendPointDTO(BaseModel):
    date: str
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    avg_risk_score: float

class HighRiskAlertDTO(BaseModel):
    alert_id: str
    vendor_id: str
    vendor: str
    risk_score: int
    main_risk: str
    severity: str
    exposure_amount: float
    recommended_action: str

class VendorRiskDashboardDTO(BaseModel):
    total_vendors: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    average_risk_score: float
    vendors: List[VendorRiskScoreDTO]
    distribution: List[RiskDistributionPointDTO]
    trend: List[RiskTrendPointDTO]
    alerts: List[HighRiskAlertDTO]
    # Augmented Merchant & Buyer Intelligence suites
    merchant_intelligence: Optional[MerchantAnalyticsDTO] = None
    buyer_intelligence: Optional[BuyerAnalyticsDTO] = None
