export interface CartItem {
  product_id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  quantity: number;
  subtotal: number;

  image_url: string;
  gst_rate_pct: number;
  hsn_sac_code?: string;
  active_offer?: string;
}

export interface CartSummary {
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  discount_code?: string;
  discount_pct?: number;
  final_amount: number;
  items_count: number;
  total_quantity: number;
  currency: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  summary: CartSummary;
  customer_email?: string;
  customer_phone?: string;
  customer_name?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CheckoutOrderRequest {
  cart_id: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  shipping_address?: string;
  notes?: Record<string, string>;
}

export interface CheckoutOrderResponse {
  order_id: string;
  cart_id: string;
  receipt: string;
  currency: string;
  order_amount: number;
  taxes: number;
  discounts: number;
  final_amount: number;
  status: string;
  checkout_session_url: string;
  payment_link: string;
  qr_code_data: string;
  items_count: number;
  customer_email: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  actor: string;
  event_type: string;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface TransactionStatus {
  transaction_id: string;
  order_id: string;
  payment_id?: string;
  cart_id?: string;
  amount: number;
  currency: string;
  status: string;
  payment_method?: string;
  customer_email?: string;
  reconciled: boolean;
  reconciliation_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AgentCommandResponse {
  cart: Cart;
  agent_message: string;
  suggested_actions: string[];
  applied_action?: string;
}
