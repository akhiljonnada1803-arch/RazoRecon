import { CategorizedTransactionDTO } from './categorization';
import { MatchDTO } from './reconciliation';

export interface OverrideCategoryRequestDTO {
  txn_id: string;
  approved_category: string;
  notes?: string;
}

export interface ReviewQueueResponseDTO {
  low_confidence_categorizations: CategorizedTransactionDTO[];
  unmatched_deposits: MatchDTO[];
  total_pending_review: number;
}
