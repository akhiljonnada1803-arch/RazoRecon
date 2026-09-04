export interface ExecutiveKPIsDTO {
  health_score: number;
  health_status: string;
  health_delta: number;
  cash_position: number;
  cash_delta_pct: number;
  match_rate: number;
  match_rate_verified: number;
  open_exceptions: number;
  open_exceptions_value: number;
  fraud_alerts: number;
  anomalies_detected: number;
}

export interface CashTrendPointDTO {
  month: string;
  inflow: number;
  outflow: number;
  net_cash: number;
  cumulative_cash: number;
}

export interface ReconciliationAccuracyPointDTO {
  channel: string;
  accuracy_pct: number;
  total_volume: number;
  matched_volume: number;
}

export interface ExceptionDistributionItemDTO {
  category: string;
  count: number;
  value: number;
  percentage: number;
}

export interface RiskTrendPointDTO {
  date: string;
  high_risk: number;
  medium_risk: number;
  mitigated: number;
}

export interface CFOInsightDTO {
  id: string;
  title: string;
  impact: 'high' | 'medium' | 'low';
  type: 'opportunity' | 'risk' | 'operational';
  summary: string;
  action: string;
}

export interface ForecastSummaryDTO {
  period_days: number;
  projected_inflow: number;
  projected_outflow: number;
  projected_net_burn: number;
  runway_months: number;
  confidence_interval_pct: number;
}

export interface TopRiskDTO {
  id: string;
  risk_title: string;
  severity: 'critical' | 'warning' | 'low';
  monetary_exposure: number;
  source: string;
  mitigation_strategy: string;
}

export interface ExecutiveDashboardResponseDTO {
  kpis: ExecutiveKPIsDTO;
  cash_trend: CashTrendPointDTO[];
  reconciliation_accuracy: ReconciliationAccuracyPointDTO[];
  exception_distribution: ExceptionDistributionItemDTO[];
  risk_trend: RiskTrendPointDTO[];
  cfo_insights: CFOInsightDTO[];
  forecast_summary: ForecastSummaryDTO;
  top_risks: TopRiskDTO[];
}
