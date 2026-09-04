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
  price: number;
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
  stock?: number;
  stock_quantity?: number;
  in_stock?: boolean;
  offer?: string;
  active_offer?: string;
  delivery_time?: string;
  gst_rate_pct?: number;
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
  subtotal: number;
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

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  recommended_products?: Product[];
  comparison_data?: ComparisonData | null;
  suggested_prompts?: string[];
  action_type?: string;
  checkout_link?: string;
}

export interface CommerceChatResponse {
  message: string;
  recommended_products: Product[];
  comparison_data?: ComparisonData | null;
  suggested_prompts: string[];
  cart?: CartState;
  action_triggered?: string;
  checkout_link?: string;
}

export interface CheckoutResult {
  payment_link_id: string;
  payment_url: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  qr_code_mock: string;
  expires_at: string;
  summary_items: CartItem[];
}
