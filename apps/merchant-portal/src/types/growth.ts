export interface GrowthBasketItem {
  product_id: string;
  sku?: string;
  name: string;
  brand?: string;
  category: string;
  price: number;
  cost_price?: number;
  quantity: number;
  image_url?: string;
}

export interface RecommendationCard {
  id?: string;
  sku?: string;
  name?: string;
  price?: number;
  category?: string;
  type?: 'upsell' | 'cross_sell' | 'UPGRADE' | 'CROSS_SELL' | 'FREQUENTLY_BOUGHT_TOGETHER';
  recommendation_type?: 'UPGRADE' | 'CROSS_SELL' | 'FREQUENTLY_BOUGHT_TOGETHER';
  badge_label?: string;
  original_product_id?: string;
  target_product_id?: string;
  target_product_name?: string;
  target_brand?: string;
  target_category?: string;
  target_price?: number;
  target_cost_price?: number;
  target_image_url?: string;
  confidence_score_pct?: number;
  confidence_score?: number;
  price_delta_inr?: number;
  margin_delta_pct?: number;
  revenue_uplift_pct?: number;
  expected_uplift_pct?: number;
  expected_uplift_inr?: number;
  strategy_rationale?: string;
  reasoning?: string;
  key_advantages?: string[];
}

export interface AffinityRule {
  rule_id?: string;
  antecedent_product_name?: string;
  consequent_product_name?: string;
  synergy_type?: string;
  support_pct: number;
  confidence_pct: number;
  lift_multiplier?: number;
  lift_score?: number;
  historical_co_purchases?: number;
  historical_basket_count?: number;
  antecedent_skus?: string[];
  consequent_sku?: string;
  consequent_name?: string;
  consequent_category?: string;
  consequent_price?: number;
}

export interface GrowthAnalysisResponse {
  current_cart_value: number;
  current_cart_value_inr?: number;
  total_active_items?: number;
  predicted_cart_value: number;
  predicted_cart_value_inr?: number;
  expected_uplift_inr: number;
  expected_uplift_pct: number;
  current_gross_margin_pct?: number;
  projected_gross_margin_pct?: number;
  margin_expansion_pct: number;
  growth_health_score?: number;
  ai_strategy_rationale?: string;
  recommendations?: RecommendationCard[];
  upsell_recommendations?: RecommendationCard[];
  cross_sell_recommendations?: RecommendationCard[];
  affinity_rules?: AffinityRule[];
  basket_affinity_rules?: AffinityRule[];
  analysis_timestamp?: string;
}

export interface SampleBasket {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  items: GrowthBasketItem[];
}

export interface UpsellAddon {
  name: string;
  sku: string;
  category: string;
  price: number;
  benefit: string;
  affinity_score: number;
  type: 'CROSS_SELL' | 'UPGRADE';
}

export interface UpsellRule {
  id: string;
  trigger_category: string;
  trigger_product: string;
  trigger_price: number;
  recommendations: UpsellAddon[];
  current_cart_value: number;
  predicted_cart_value: number;
  expected_uplift_pct: number;
}

export interface CustomerSegment {
  id: string;
  name: string;
  reach_merchants: number;
  average_order_value: number;
  monthly_gmv: number;
  churn_risk_pct: number;
  affinity: string;
  recommended_action: string;
}

export interface GrowthCampaign {
  id: string;
  name: string;
  target_segment: string;
  channels: string[];
  discount_code: string;
  discount_pct: number;
  projected_orders: number;
  expected_revenue_lift_inr: number;
  conversion_lift_pct: number;
  status: 'ACTIVE' | 'SCHEDULED' | 'COMPLETED';
}

export interface GrowthOverview {
  current_cart_value_avg: number;
  predicted_cart_value_avg: number;
  expected_uplift_pct: number;
  margin_expansion_pct: number;
  top_upsell_conversion_pct: number;
  active_campaigns_count: number;
  total_segments_count: number;
  monthly_projected_growth_inr: number;
  recent_growth_recommendations: Array<{
    base_product: string;
    recommended_addon: string;
    addon_price: number;
    conversion_rate: string;
    margin_contribution: string;
  }>;
}
