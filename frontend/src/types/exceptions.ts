export type ExceptionType =
  | 'Missing Invoice'
  | 'Duplicate Payment'
  | 'Partial Settlement'
  | 'Tax Mismatch'
  | 'Delayed Settlement';

export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface InvestigatedExceptionDTO {
  exception_id: string;
  txn_id: string;
  payout_id?: string | null;
  date: string;
  amount: number;
  type: ExceptionType;
  root_cause: string;
  impact: string;
  action: string;
  confidence: number;
  severity: SeverityLevel;
  status: 'Open' | 'In Investigation' | 'Resolved';
  channel?: string | null;
  discrepancy_amount?: number;
  evidence: string[];
}

export interface ExceptionSummaryMetricsDTO {
  total_exceptions: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  total_exposure_amount: number;
  auto_investigated_pct: number;
  by_type: Record<string, number>;
}

export interface ExceptionIntelligenceResponseDTO {
  summary: ExceptionSummaryMetricsDTO;
  exceptions: InvestigatedExceptionDTO[];
}
