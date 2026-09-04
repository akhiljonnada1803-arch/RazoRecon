export interface WorkflowStepResultDTO {
  step_number: number;
  step_name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  duration_ms: number;
  details: Record<string, any>;
  log_messages: string[];
}

export interface MonthCloseResultDTO {
  records_processed: number;
  match_rate: number;
  exceptions: number;
  fraud_alerts: number;
  finance_health: number;
  forecast: string;
  status: 'Closed' | 'Ready to Close' | 'In Progress';
  closed_at: string;
  cfo_signoff: string;
  steps: WorkflowStepResultDTO[];
  audit_pack_id: string;
}
