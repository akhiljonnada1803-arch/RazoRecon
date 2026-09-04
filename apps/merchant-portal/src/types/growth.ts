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

// ============================================
// Demand Intelligence & Scoring Engine Types
// ============================================

export interface TrendPoint {
  date: string;
  score: number;
}

export interface StatusTier {
  key: 'TRENDING' | 'GROWING' | 'STABLE' | 'DECLINING' | 'DEAD_INVENTORY';
  label: string;
  badge: string;
  color: string;
}

export interface DiscountRecommendation {
  type: 'DYNAMIC_DISCOUNT' | 'LIQUIDATION_BUNDLE';
  title: string;
  discount_pct: number;
  target_price?: number;
  bundle_with?: string;
  expected_uplift_pct: number;
  expected_revenue_lift_inr: number;
  confidence_pct: number;
  reasoning: string;
}

export interface RestockAlert {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  days_left: number;
  recommended_units: number;
  expected_stockout_date: string;
  message: string;
}

export interface ProductDemandItem {
  id: string;
  name: string;
  category: string;
  price: number;
  cost_price: number;
  stock: number;
  views: number;
  searches: number;
  cart_adds: number;
  purchases: number;
  conversion_rate: number;
  inventory_velocity: number;
  supplier_lead_time_days: number;
  demand_score: number;
  status_tier: StatusTier;
  days_to_stockout: number;
  trend_history: {
    '7d': TrendPoint[];
    '30d': TrendPoint[];
    '90d': TrendPoint[];
  };
  ai_recommendation?: DiscountRecommendation;
  restock_alert?: RestockAlert;
  tied_capital_inr?: number;
  discount_applied?: number;
  discounted_price?: number;
}

export interface AutonomousCampaignProposal {
  id: string;
  name: string;
  target_audience: string;
  recommended_discount_pct: number;
  duration_days: number;
  featured_products: string[];
  expected_revenue_lift_inr: number;
  projected_orders: number;
  status: string;
  strategy_type: string;
  confidence_score: number;
}

export interface GrowthInsightAlert {
  id: string;
  icon: string;
  type: string;
  title: string;
  description: string;
  badge: string;
  color: string;
  action_route: string;
}

export interface CategoryHeatmapItem {
  category: string;
  avg_score: number;
  trend: string;
  active_skus: number;
  status: string;
}

export interface DemandIntelligenceOverview {
  summary: {
    average_demand_score: number;
    total_products_tracked: number;
    trending_count: number;
    growing_count: number;
    stable_count: number;
    declining_count: number;
    dead_inventory_count: number;
    dead_inventory_tied_capital_inr: number;
    projected_revenue_lift_inr: number;
    active_campaign_recommendations_count: number;
  };
  products: ProductDemandItem[];
  trending_products: ProductDemandItem[];
  growing_products: ProductDemandItem[];
  declining_products: ProductDemandItem[];
  dead_inventory: ProductDemandItem[];
  autonomous_campaigns: AutonomousCampaignProposal[];
  growth_insights: GrowthInsightAlert[];
  category_heatmap: CategoryHeatmapItem[];
}

export interface RestockQueueItem {
  product_id: string;
  product_name: string;
  category: string;
  current_stock: number;
  daily_velocity: number;
  days_to_stockout: number;
  recommended_restock_units: number;
  estimated_reorder_cost_inr: number;
  supplier_lead_time_days: number;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface InventoryOptimizationResponse {
  overview: {
    fast_movers_count: number;
    slow_movers_count: number;
    understocked_count: number;
    overstocked_count: number;
    tied_up_overstock_capital_inr: number;
    total_skus: number;
  };
  fast_movers: ProductDemandItem[];
  slow_movers: ProductDemandItem[];
  understocked: ProductDemandItem[];
  overstocked: ProductDemandItem[];
  restock_queue: RestockQueueItem[];
}
