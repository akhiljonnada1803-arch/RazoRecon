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
  stock?: number;
  stock_quantity?: number;
  stock_status?: string;
  inventory_status?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'PRE_ORDER' | 'DISCONTINUED';
  in_stock?: boolean;
  offer?: string;
  active_offer?: string;
  offer_discount_pct?: number;
  offer_badge?: string;
  delivery_time?: string;
  match_score?: number;
  ranking_breakdown?: {
    budget_match: number;
    specs_match: number;
    rating_score: number;
    review_sentiment: number;
    popularity_score: number;
    total_score: number;
  };
  why_recommended?: string;
  review_sentiment_score?: number;
  popularity_score?: number;
  review_intelligence?: ReviewIntelligence;
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

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  action_type?: string;
  checkout_link?: string;
  recommended_products?: Product[];
  comparison_data?: ComparisonData | null;
  suggested_prompts?: string[];
  recommendation_reason?: string;
  confidence_score?: number;
  parsed_intent?: any;
  review_intelligence?: ReviewIntelligence;
  before_checkout_summary?: string;
}

export interface CommerceChatResponse {
  message: string;
  action_triggered?: string;
  action_type?: string;
  checkout_link?: string;
  cart?: any;
  recommended_products?: Product[];
  comparison?: ComparisonData | null;
  comparison_data?: ComparisonData | null;
  suggested_prompts?: string[];
  recommendation_reason?: string;
  confidence_score?: number;
  parsed_intent?: any;
  review_intelligence?: ReviewIntelligence;
  before_checkout_summary?: string;
}

export interface ReviewIntelligence {
  product_id: string;
  pros: string[];
  cons: string[];
  customer_sentiment: string;
  satisfaction_score: number;
  recommendation_score: number;
  before_checkout_summary: string;
  total_reviews_analyzed?: number;
}


export interface AdvisorRecommendationResponse {
  recommended_products: Product[];
  recommendation_reason: string;
  confidence_score: number;
  parsed_intent?: any;
  query?: string;
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

export interface ProductReview {
  id: string;
  product_id: string;
  customer_id: string;
  customer_name: string;
  rating: number; // 1-5
  review_title: string;
  review_text: string;
  verified_purchase: boolean;
  helpful_votes: number;
  images: string[];
  created_at: string;
  updated_at: string;
  has_voted?: boolean;
}

export interface StarBreakdown {
  star: number;
  count: number;
  percentage: number;
}

export interface ProductRatingSummary {
  product_id: string;
  average_rating: number;
  total_reviews: number;
  rating_breakdown: Record<string, StarBreakdown>;
  verified_purchases_count: number;
}

export interface ReviewListResponse {
  items: ProductReview[];
  total: number;
  limit: number;
  offset: number;
  summary: ProductRatingSummary;
}

export interface ReviewCreatePayload {
  product_id: string;
  rating: number;
  review_title: string;
  review_text: string;
  customer_id?: string;
  customer_name?: string;
  images?: string[];
  verified_purchase?: boolean;
}

export interface ReviewUpdatePayload {
  rating?: number;
  review_title?: string;
  review_text?: string;
  images?: string[];
}

export interface EMIOption {
  tenure: number;
  tenure_label: string;
  emi_amount: number;
  interest_rate: number;
  total_interest: number;
  total_payable: number;
  processing_fee: number;
  emi_type: 'no_cost' | 'standard' | 'bank';
  bank_name?: string;
  is_recommended?: boolean;
  recommendation_score?: number;
  recommendation_badge?: string;
  monthly_burden_pct?: number;
}

export interface EMISpendingProfile {
  user_id?: string;
  monthly_budget: number;
  avg_monthly_spend: number;
  discretionary_cashflow: number;
  affordability_tier: 'HIGH' | 'BALANCED' | 'STRETCHED';
  historical_orders_count: number;
}

export interface EMIRecommendationResponse {
  price: number;
  recommended_plan: EMIOption;
  recommendation_reason: string;
  all_options: EMIOption[];
  plans_by_type: {
    no_cost: EMIOption[];
    standard: EMIOption[];
    bank: EMIOption[];
  };
  spending_profile: EMISpendingProfile;
}

