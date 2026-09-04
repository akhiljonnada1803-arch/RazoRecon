export interface PolicyBasisDTO {
  doc_id: string;
  title: string;
  score?: number;
}

export interface CategorizedTransactionDTO {
  txn_id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  confidence: number;
  section: string;
  auto_post: boolean;
  cited_rule?: string;
  rationale: string;
  policy_basis?: PolicyBasisDTO | null;
}

export interface CategorizationResponseDTO {
  total_count: number;
  auto_post_count: number;
  auto_post_rate: number;
  review_count: number;
  items: CategorizedTransactionDTO[];
}
