export interface ExceptionMemoryDTO {
  exception_id: string;
  vendor_id: string;
  exception_type: string;
  root_cause: string;
  resolution: string;
  timestamp: string;
}

export interface MemoryEventLogDTO {
  event_id: string;
  vendor_id: string;
  vendor: string;
  trigger_event: string;
  previous_risk: number;
  updated_risk: number;
  delta: number;
  trend: string;
  exception_type: string;
  timestamp: string;
  log_message: string;
}

export interface VendorBehavioralProfileDTO {
  vendor_id: string;
  vendor: string;
  transactions: number;
  exceptions: number;
  top_issue: string;
  risk_score: number;
  trend: 'Increasing' | 'Decreasing' | 'Stable' | string;
  avg_transaction_value: number;
  duplicate_payment_count: number;
  tax_mismatch_count: number;
  settlement_delay_count: number;
  last_updated: string;
  recent_exceptions: ExceptionMemoryDTO[];
  recent_events: MemoryEventLogDTO[];
}

export interface VendorListResponseDTO {
  total_vendors_tracked: number;
  high_risk_vendors: number;
  profiles: VendorBehavioralProfileDTO[];
  latest_events: MemoryEventLogDTO[];
}

export interface RecordExceptionRequestDTO {
  vendor_id: string;
  vendor_name: string;
  exception_type: string;
  transaction_amount: number;
  root_cause?: string;
  resolution?: string;
}
