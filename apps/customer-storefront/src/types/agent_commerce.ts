export interface A2ADialogueMessage {
  id: string;
  sender: 'buyer_agent' | 'seller_agent';
  sender_name: string;
  sender_role: string;
  timestamp: string;
  message: string;
  thought_process?: string;
  structured_payload?: Record<string, any>;
}

export interface A2ALedgerEntry {
  account_code: string;
  account_name: string;
  debit: number;
  credit: number;
  description: string;
}

export interface A2ASimulationStep {
  step_number: number;
  step_id: 'search_product' | 'negotiate' | 'generate_cart' | 'create_payment' | 'verify_payment' | 'update_ledger';
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  duration_ms: number;
  dialogue: A2ADialogueMessage[];
  output_summary?: string;
  state_snapshot?: Record<string, any>;
}

export interface A2APresetScenario {
  id: string;
  title: string;
  industry: string;
  buyer_persona: string;
  seller_persona: string;
  requirement_prompt: string;
  initial_budget: number;
  target_items_count: number;
}

export interface A2ASimulationRequest {
  scenario_id?: string;
  custom_prompt?: string;
  buyer_budget?: number;
}

export interface A2ASimulationResponse {
  simulation_id: string;
  scenario_title: string;
  buyer_name: string;
  buyer_persona: string;
  seller_name: string;
  seller_persona: string;
  total_duration_ms: number;
  steps: A2ASimulationStep[];
  final_cart: {
    items: Array<{
      name: string;
      qty: number;
      list_price: number;
      discounted_price: number;
    }>;
    subtotal: number;
    discount_amount: number;
    gst_amount: number;
    total: number;
  };
  final_payment: {
    order_id: string;
    payment_id: string;
    method: string;
    gross_amount: number;
    mdr_fee: number;
    mdr_tax: number;
    net_deposit: number;
    signature: string;
  };
  final_ledger: A2ALedgerEntry[];
  reconciliation_status: string;
  created_at: string;
}
