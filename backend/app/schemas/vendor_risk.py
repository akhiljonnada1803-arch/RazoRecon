from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

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
