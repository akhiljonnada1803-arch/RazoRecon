from typing import List, Dict, Optional
from pydantic import BaseModel

class HorizonForecastDTO(BaseModel):
    horizon_days: int
    horizon_label: str  # "7-Day Projection" | "30-Day Projection" | "90-Day Projection"
    expected_inflow: float
    expected_outflow: float
    net_cash_flow: float
    projected_closing_balance: float
    confidence_score: int  # 0 to 100
    burn_rate_daily: float
    runway_days: int

class DailyForecastPointDTO(BaseModel):
    date: str
    is_projected: bool
    actual_cash: Optional[float] = None
    projected_cash: Optional[float] = None
    projected_inflow: float = 0.0
    projected_outflow: float = 0.0
    upper_bound: Optional[float] = None
    lower_bound: Optional[float] = None

class LiquidityRiskIndicatorDTO(BaseModel):
    id: str
    risk_title: str
    severity: str  # "Low" | "Medium" | "High" | "Critical"
    threshold_metric: str
    current_status: str
    impact: str
    recommendation: str

class ForecastInsightDTO(BaseModel):
    id: str
    category: str  # "Inflow Surge" | "Working Capital" | "Payroll Timing" | "Reserve Release"
    title: str
    detail: str
    impact_amount: float
    actionable_step: str

class CashForecastResponseDTO(BaseModel):
    executive_summary: str
    current_cash_balance: float
    forecast_7d: HorizonForecastDTO
    forecast_30d: HorizonForecastDTO
    forecast_90d: HorizonForecastDTO
    daily_timeline: List[DailyForecastPointDTO]
    risk_indicators: List[LiquidityRiskIndicatorDTO]
    insights: List[ForecastInsightDTO]
