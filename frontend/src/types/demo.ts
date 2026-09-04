export interface InjectedAnomalyDTO {
  category: 'Tax Mismatch' | 'Duplicate Payment' | 'Missing Invoice' | 'Settlement Delay';
  count: number;
  description: string;
  impact: string;
  target_entities: string[];
}

export interface DemoGenerationResultDTO {
  status: string;
  message: string;
  generated_at: string;
  invoices_generated: number;
  settlements_generated: number;
  transactions_generated: number;
  anomalies_injected: InjectedAnomalyDTO[];
  summary_stats: {
    invoices_count: number;
    settlements_count: number;
    bank_transactions_count: number;
    amazon_reserve_holds_injected: number;
    total_anomalies_injected: number;
    ready_for_demo: boolean;
  };
}

export interface TopRiskVendorDTO {
  vendor: string;
  vendor_id: string;
  risk_score: number;
  risk_level: string;
  main_risk: string;
  total_exceptions: number;
  exposure_amount: number;
}

export interface FraudAlertDTO {
  alert_id: string;
  entity: string;
  type: string;
  amount: number;
  risk_level: string;
  action: string;
}

export interface CashForecastDTO {
  current_balance: number;
  projected_30d_closing: number;
  net_improvement_pct: number;
  expected_inflows: number;
  expected_outflows: number;
  runway_days: number;
  narrative: string;
}

export interface OneClickDemoFlowResultDTO {
  status: string;
  message: string;
  payments_imported: number;
  matched: number;
  match_rate: number;
  exceptions_count: number;
  risk_profiles_updated: number;
  top_risk_vendors: TopRiskVendorDTO[];
  fraud_alerts: FraudAlertDTO[];
  cash_forecast: CashForecastDTO;
  cfo_summary: string;
  execution_trace: string[];
}
