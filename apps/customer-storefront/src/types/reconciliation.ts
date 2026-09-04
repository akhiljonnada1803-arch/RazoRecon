export interface OrderLifecycleDTO {
  stage: string;
  timestamp: string;
  description: string;
  completed: boolean;
}

export interface CommerceTransactionDTO {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  product_title: string;
  quantity: number;
  amount: number;
  currency: string;
  payment_method: string;
  payment_status: string;
  lifecycle_stage: string;
  carrier?: string;
  tracking_number?: string | null;
  is_agent_purchase: boolean;
  agent_name?: string | null;
  created_at: string;
  updated_at: string;
  timeline: OrderLifecycleDTO[];
}

export interface CommerceTransactionSummaryDTO {
  total_orders: number;
  total_gmv_inr: number;
  payments_captured_count: number;
  refunds_processed_count: number;
  refunds_total_inr: number;
  active_shipments_count: number;
  delivered_count: number;
  agent_purchases_count: number;
  agent_gmv_inr: number;
  lifecycle_breakdown: Record<string, number>;
  carrier_breakdown: Record<string, number>;
}

export interface CommerceTransactionResponseDTO {
  summary: CommerceTransactionSummaryDTO;
  transactions: CommerceTransactionDTO[];
  status: string;
}

export interface MatchDTO {
  txn_id: string;
  deposit_amount: number;
  payout_id?: string | null;
  expected_net?: number | null;
  discrepancy?: number | null;
  status: 'matched' | 'partial_reserve' | 'unmatched';
  note: string;
  order_id?: string;
  lifecycle_stage?: string;
  is_agent_purchase?: boolean;
}

export interface ReconciliationSummaryDTO {
  deposits_examined: number;
  by_status: Record<string, number>;
  auto_matched_pct: number;
  reserve_or_short_held: number;
  total_gmv_inr?: number;
  agent_purchases_pct?: number;
  lifecycle_breakdown?: Record<string, number>;
}

export interface ReconciliationResponseDTO {
  summary: ReconciliationSummaryDTO;
  matches: MatchDTO[];
  commerce_transactions?: CommerceTransactionDTO[];
}

export interface RazorpayReconciliationResponseDTO {
  payments_imported: number;
  matched: number;
  exceptions: number;
  risk_profiles_updated: number;
  match_rate?: number;
  total_volume_inr?: number;
  exception_breakdown?: Record<string, number>;
  status?: string;
}
