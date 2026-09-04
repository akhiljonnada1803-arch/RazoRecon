export type FraudDetectionType =
  | 'Duplicate Payment'
  | 'Amount Anomaly'
  | 'Vendor Anomaly'
  | 'Repeated Settlement Issue';

export type FraudRiskLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface FraudAlertDTO {
  alert_id: string;
  txn_id: string;
  date: string;
  entity_name: string;
  amount: number;
  detection_type: FraudDetectionType;
  triggered_rule: string;
  risk_score: number;
  risk_level: FraudRiskLevel;
  reason: string;
  recommendation: string;
  status: 'Active' | 'Under Review' | 'Blocked' | 'Cleared';
  channel?: string;
  monetary_exposure: number;
  evidence_trail: string[];
}

export interface FraudTimelineEventDTO {
  id: string;
  timestamp: string;
  event_title: string;
  detection_type: FraudDetectionType;
  risk_level: FraudRiskLevel;
  description: string;
  monetary_impact: number;
  action_taken: string;
}

export interface FraudSummaryMetricsDTO {
  total_transactions_scanned: number;
  active_alerts_count: number;
  critical_alerts_count: number;
  high_alerts_count: number;
  medium_alerts_count: number;
  low_alerts_count: number;
  total_exposure_at_risk: number;
  prevented_loss_amount: number;
  anomaly_detection_rate_pct: number;
  by_detection_type: Record<string, number>;
}

export interface FraudCenterResponseDTO {
  summary: FraudSummaryMetricsDTO;
  alerts: FraudAlertDTO[];
  timeline: FraudTimelineEventDTO[];
}
