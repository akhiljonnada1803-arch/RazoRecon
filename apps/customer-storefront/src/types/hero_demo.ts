export interface ReasoningTrace {
  goal: string;
  thought: string;
  observation: string;
  action_taken: string;
  decision_rationale: string;
  json_payload?: Record<string, any>;
}

export interface HeroAuditLog {
  id: string;
  step_number: number;
  actor: string;
  event_type: string;
  description: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface HeroRiskCheck {
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  risk_score: number;
  fraud_flags: string[];
  credit_limit_inr: number;
  settlement_variance_inr: number;
  gst_compliance_status: string;
  reconciliation_verified: boolean;
}

export interface HeroJournalEntry {
  account: string;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  description: string;
}

export interface HeroTransaction {
  transaction_id: string;
  order_id: string;
  payment_id?: string;
  gross_amount: number;
  tax_amount: number;
  discount_amount: number;
  net_deposit: number;
  gateway_fee: number;
  gst_on_fee: number;
  payment_method: string;
  status: string;
  journal_vouchers: HeroJournalEntry[];
  timestamp: string;
}

export interface HeroProductItem {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  original_price?: number;
  rating: number;
  image_url: string;
  key_features: string[];
  gst_rate_pct: number;
  active_offer?: string;
  match_score_pct?: number;
}

export interface HeroCartItem {
  product_id: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  gst_rate_pct: number;
  image_url: string;
}

export interface HeroMemoryProfile {
  customer_id: string;
  customer_name: string;
  tier: string;
  total_spend_inr: number;
  orders_count: number;
  aov_inr: number;
  affinity_categories: string[];
  risk_profile: string;
  last_purchased_sku: string;
  last_purchase_date: string;
  loyalty_points: number;
}

export interface HeroStepData {
  step_number: number;
  step_key: string;
  title: string;
  subtitle: string;
  actor: string;
  status: 'pending' | 'in_progress' | 'completed';
  timestamp: string;
  data: Record<string, any>;
  reasoning: ReasoningTrace;
  audit_log: HeroAuditLog;
  risk_check: HeroRiskCheck;
  transaction?: HeroTransaction;
}

export interface HeroScenario {
  id: string;
  title: string;
  business_type: string;
  customer_name: string;
  customer_email: string;
  initial_prompt: string;
  budget_inr: number;
  target_category: string;
  recommended_skus: string[];
  upsell_sku: string;
  future_skus: string[];
}

export interface HeroDemoState {
  session_id: string;
  scenario: HeroScenario;
  current_step: number;
  is_completed: boolean;
  steps: HeroStepData[];
  active_cart_items: HeroCartItem[];
  cart_subtotal: number;
  cart_tax: number;
  cart_discount: number;
  cart_final: number;
  applied_coupon?: string;
  order_id?: string;
  payment_id?: string;
  payment_link?: string;
  reconciled: boolean;
  memory_profile?: HeroMemoryProfile;
  future_recommendations: HeroProductItem[];
  audit_logs: HeroAuditLog[];
  transactions: HeroTransaction[];
}
