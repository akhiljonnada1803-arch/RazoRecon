export type ExceptionType =
  | 'Payment Failure'
  | 'Order Creation Failure'
  | 'Shipping Delay'
  | 'Inventory Shortage'
  | 'Refund Issue'
  | 'Courier API Failure'
  | 'Missing Invoice'
  | 'Duplicate Payment'
  | 'Partial Settlement'
  | 'Tax Mismatch'
  | 'Delayed Settlement';

export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface InvestigatedExceptionDTO {
  exception_id: string;
  category: ExceptionType | string;
  order_id?: string | null;
  sku_id?: string | null;
  customer_name?: string | null;
  txn_id?: string;
  payout_id?: string | null;
  date: string;
  amount: number;
  type?: string;
  root_cause: string;
  impact: string;
  action: string;
  available_workflows?: string[];
  confidence: number;
  severity: SeverityLevel;
  status: 'Open' | 'In Resolution' | 'Resolved';
  channel?: string | null;
  discrepancy_amount?: number;
  evidence: string[];
  resolved_action?: string | null;
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
  by_category?: Record<string, number>;
  resolved_count?: number;
}

export interface ExceptionIntelligenceResponseDTO {
  summary: ExceptionSummaryMetricsDTO;
  exceptions: InvestigatedExceptionDTO[];
  status?: string;
}
