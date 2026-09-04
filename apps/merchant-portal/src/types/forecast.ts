export interface HorizonForecastDTO {
  horizon_days: number;
  horizon_label: string;
  expected_inflow: number;
  expected_outflow: number;
  net_cash_flow: number;
  projected_closing_balance: number;
  confidence_score: number;
  burn_rate_daily: number;
  runway_days: number;
}

export interface DailyForecastPointDTO {
  date: string;
  is_projected: boolean;
  actual_cash?: number | null;
  projected_cash?: number | null;
  projected_inflow: number;
  projected_outflow: number;
  upper_bound?: number | null;
  lower_bound?: number | null;
}

export interface LiquidityRiskIndicatorDTO {
  id: string;
  risk_title: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  threshold_metric: string;
  current_status: string;
  impact: string;
  recommendation: string;
}

export interface ForecastInsightDTO {
  id: string;
  category: string;
  title: string;
  detail: string;
  impact_amount: number;
  actionable_step: string;
}

export interface CashForecastResponseDTO {
  executive_summary: string;
  current_cash_balance: number;
  forecast_7d: HorizonForecastDTO;
  forecast_30d: HorizonForecastDTO;
  forecast_90d: HorizonForecastDTO;
  daily_timeline: DailyForecastPointDTO[];
  risk_indicators: LiquidityRiskIndicatorDTO[];
  insights: ForecastInsightDTO[];
}
