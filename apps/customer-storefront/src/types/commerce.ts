export interface ProductSpec {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  sku?: string;
  name: string;
  brand?: string;
  category: string;
  price: number; // Customer-facing GST-inclusive price
  customer_price?: number;
  base_price?: number; // Net price excluding GST
  gst_rate?: number; // e.g. 0.18
  gst_rate_pct?: number; // e.g. 18.0
  gst_amount?: number;
  price_display?: string;
  cost_price?: number;
  original_price?: number;
  currency?: string;
  rating?: number;
  reviews_count?: number;
  image_url: string;
  tagline?: string;
  description: string;
  features?: string[];
  key_features?: string[];
  specs?: ProductSpec[];
  pros?: string[];
  cons?: string[];
  stock?: number;
  stock_quantity?: number;
  stock_status?: string;
  delivery_eta?: string;
  merchant_trust_score?: number;
  inventory_status?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'PRE_ORDER' | 'DISCONTINUED';
  in_stock?: boolean;
  offer?: string;
  active_offer?: string;
  delivery_time?: string;
}

export interface ProductCategoryStats {
  name: string;
  count: number;
}

export interface ProductStats {
  total_products: number;
  total_valuation_inr?: number;
  total_inventory_value?: number;
  in_stock_rate_pct?: number;
  in_stock_count?: number;
  out_of_stock_count?: number;
  active_offers_count: number;
  total_categories?: number;
  categories?: ProductCategoryStats[];
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  limit: number;
  offset: number;
}

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  category?: string;
  product?: Product;
}

export interface CartState {
  items: CartItem[];
  items_total?: number;
  subtotal: number;
  delivery_fee?: number;
  platform_fee?: number;
  gst_included?: number;
  tax_gst: number;
  shipping: number;
  discount: number;
  coupon_applied?: string | null;
  total: number;
  currency: string;
}

export interface ComparisonAttribute {
  attribute: string;
  values: Record<string, string>;
}

export interface ComparisonData {
  product_ids?: string[];
  products: Product[];
  attributes?: ComparisonAttribute[];
  features?: any[];
  title?: string;
  verdict: string;
}

export interface DeliveryAddress {
  id: string;
  label: string;
  recipient_name: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  is_default?: boolean;
}

export interface AIRecommendationReason {
  recommended_product_id: string;
  product_name: string;
  headline: string;
  why_bullets: string[];
}

export interface AdvisorOrderSummary {
  product_id: string;
  product_name: string;
  product_image: string;
  brand: string;
  quantity: number;
  unit_price: number;
  base_subtotal: number;
  gst_amount: number;
  delivery_fee: number;
  total_amount: number;
  delivery_address: DeliveryAddress;
  expected_delivery: string;
  within_limit: boolean;
  within_budget: boolean;
  payment_method: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  action_type?: string;
  checkout_link?: string;
  flow_step?: string;
  recommended_products?: Product[];
  comparison_data?: ComparisonData | null;
  ai_recommendation_reason?: AIRecommendationReason | null;
  selected_product?: Product | null;
  selected_address?: DeliveryAddress | null;
  order_summary?: AdvisorOrderSummary | null;
  saved_addresses?: DeliveryAddress[] | null;
  suggested_prompts?: string[];
  autonomous_order?: any;
  requires_approval?: boolean;
}

export interface CommerceChatResponse {
  message: string;
  action_triggered?: string;
  action_type?: string;
  flow_step?: string;
  checkout_link?: string;
  cart?: any;
  recommended_products?: Product[];
  comparison?: ComparisonData | null;
  comparison_data?: ComparisonData | null;
  ai_recommendation_reason?: AIRecommendationReason | null;
  selected_product?: Product | null;
  selected_address?: DeliveryAddress | null;
  order_summary?: AdvisorOrderSummary | null;
  saved_addresses?: DeliveryAddress[] | null;
  suggested_prompts?: string[];
  autonomous_order?: any;
  requires_approval?: boolean;
  autopay_guardrail_info?: any;
}

export interface CheckoutResult {
  order_id: string;
  payment_link?: string;
  payment_link_id?: string;
  payment_url?: string;
  qr_code_data?: string;
  qr_code_mock?: string;
  amount: number;
  currency: string;
  status: string;
  receipt?: string;
}
