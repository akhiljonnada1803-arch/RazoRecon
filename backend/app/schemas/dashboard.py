from typing import List, Dict, Optional, Any
from pydantic import BaseModel

class ExecutiveKPIsDTO(BaseModel):
    health_score: int
    health_status: str
    health_delta: float
    cash_position: float
    cash_delta_pct: float
    match_rate: float
    match_rate_verified: float
    open_exceptions: int
    open_exceptions_value: float
    fraud_alerts: int
    anomalies_detected: int

class CashTrendPointDTO(BaseModel):
    month: str
    inflow: float
    outflow: float
    net_cash: float
    cumulative_cash: float

class ReconciliationAccuracyPointDTO(BaseModel):
    channel: str
    accuracy_pct: float
    total_volume: float
    matched_volume: float

class ExceptionDistributionItemDTO(BaseModel):
    category: str
    count: int
    value: float
    percentage: float

class RiskTrendPointDTO(BaseModel):
    date: str
    high_risk: int
    medium_risk: int
    mitigated: int

class CFOInsightDTO(BaseModel):
    id: str
    title: str
    impact: str  # "high" | "medium" | "low"
    type: str    # "opportunity" | "risk" | "operational"
    summary: str
    action: str

class ForecastSummaryDTO(BaseModel):
    period_days: int
    projected_inflow: float
    projected_outflow: float
    projected_net_burn: float
    runway_months: float
    confidence_interval_pct: float

class TopRiskDTO(BaseModel):
    id: str
    risk_title: str
    severity: str  # "critical" | "warning" | "low"
    monetary_exposure: float
    source: str
    mitigation_strategy: str

class ExecutiveDashboardResponseDTO(BaseModel):
    has_data: bool = True
    kpis: ExecutiveKPIsDTO
    cash_trend: List[CashTrendPointDTO]
    reconciliation_accuracy: List[ReconciliationAccuracyPointDTO]
    exception_distribution: List[ExceptionDistributionItemDTO]
    risk_trend: List[RiskTrendPointDTO]
    cfo_insights: List[CFOInsightDTO]
    forecast_summary: ForecastSummaryDTO
    top_risks: List[TopRiskDTO]
