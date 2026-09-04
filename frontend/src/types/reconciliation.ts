export interface MatchDTO {
  txn_id: string;
  deposit_amount: number;
  payout_id?: string | null;
  expected_net?: number | null;
  discrepancy?: number | null;
  status: 'matched' | 'partial_reserve' | 'unmatched';
  note: string;
}

export interface ReconciliationSummaryDTO {
  deposits_examined: number;
  by_status: Record<string, number>;
  auto_matched_pct: number;
  reserve_or_short_held: number;
}

export interface ReconciliationResponseDTO {
  summary: ReconciliationSummaryDTO;
  matches: MatchDTO[];
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
