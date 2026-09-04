export interface VendorRiskScoreDTO {
  vendor_id: string;
  vendor: string;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  main_risk: string;
  total_transactions: number;
  total_exceptions: number;
  duplicate_payment_count: number;
  tax_mismatch_count: number;
  settlement_delay_count: number;
  avg_transaction_value: number;
  factors_breakdown: Record<string, number>;
  status: string;
}

export interface RiskDistributionPointDTO {
  level: string;
  count: number;
  percentage: number;
  color: string;
}

export interface RiskTrendPointDTO {
  date: string;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  avg_risk_score: number;
}

export interface HighRiskAlertDTO {
  alert_id: string;
  vendor_id: string;
  vendor: string;
  risk_score: number;
  main_risk: string;
  severity: string;
  exposure_amount: number;
  recommended_action: string;
}

export interface VendorRiskDashboardDTO {
  total_vendors: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  average_risk_score: number;
  vendors: VendorRiskScoreDTO[];
  distribution: RiskDistributionPointDTO[];
  trend: RiskTrendPointDTO[];
  alerts: HighRiskAlertDTO[];
}
