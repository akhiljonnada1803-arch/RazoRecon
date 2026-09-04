export interface GrowthBasketItem {
  product_id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  cost_price: number;
  quantity: number;
  image_url: string;
}

export interface RecommendationCard {
  id: string;
  type: 'upsell' | 'cross_sell';
  title: string;
  badge_label: string;
  target_product_id: string;
  target_product_name: string;
  target_brand: string;
  target_category: string;
  target_image_url: string;
  target_price: number;
  target_cost_price: number;
  original_product_id?: string;
  original_product_name?: string;
  price_delta: number;
  margin_delta_pct: number;
  confidence_score_pct: number;
  conversion_probability: number;
  expected_uplift_inr: number;
  strategy_rationale: string;
  key_advantages: string[];
}

export interface AffinityRule {
  rule_id: string;
  antecedent_product_name: string;
  consequent_product_name: string;
  consequent_product_id: string;
  consequent_price: number;
  support_pct: number;
  confidence_pct: number;
  lift_score: number;
  historical_co_purchases: number;
  synergy_type: string;
}

export interface SampleBasket {
  id: string;
  name: string;
  description: string;
  industry: string;
  items: GrowthBasketItem[];
}

export interface GrowthAnalysisResponse {
  current_cart_value: number;
  predicted_cart_value: number;
  expected_uplift_pct: number;
  expected_uplift_inr: number;
  current_gross_margin_pct: number;
  projected_gross_margin_pct: number;
  margin_expansion_pct: number;
  total_active_items: number;
  upsell_recommendations: RecommendationCard[];
  cross_sell_recommendations: RecommendationCard[];
  affinity_rules: AffinityRule[];
  ai_strategy_rationale: string;
  growth_health_score: number;
}
