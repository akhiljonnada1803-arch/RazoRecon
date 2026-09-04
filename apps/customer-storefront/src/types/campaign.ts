export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  merchant_count: number;
  avg_order_value: number;
  total_gmv: number;
  churn_risk_pct: number;
  avg_margin_pct: number;
  tags: string[];
  recommended_discount_range: string;
  optimal_channel: string;
}

export interface DailyForecastPoint {
  day: number;
  date_label: string;
  baseline_revenue: number;
  projected_campaign_revenue: number;
  incremental_lift: number;
  projected_orders: number;
}

export interface Campaign {
  id: string;
  name: string;
  target_segment: string;
  target_segment_id: string;
  status: 'active' | 'scheduled' | 'draft' | 'completed';
  discount_type: 'percentage' | 'flat_inr';
  discount_value: number;
  min_order_value: number;
  expected_revenue_lift: number;
  expected_revenue_lift_pct: number;
  projected_orders: number;
  projected_gmv: number;
  net_margin_impact_pct: number;
  roi_percentage: number;
  ai_copy_subject: string;
  ai_copy_body: string;
  channels: string[];
  forecast_days: DailyForecastPoint[];
  created_at: string;
  start_date: string;
  end_date: string;
}

export interface CampaignGenerateRequest {
  goal: 'revenue_surge' | 'winback' | 'new_launch' | 'inventory_clearance';
  target_segment_id: string;
  discount_type?: 'percentage' | 'flat_inr';
  discount_value?: number;
  min_order_value?: number;
  duration_days?: number;
  channels?: string[];
}

export interface CampaignSimulationRequest {
  target_segment_id: string;
  discount_type: 'percentage' | 'flat_inr';
  discount_value: number;
  min_order_value: number;
  duration_days: number;
  estimated_reach_merchants?: number;
}

export interface CampaignSimulationResponse {
  target_segment_name: string;
  target_merchant_reach: number;
  discount_type: 'percentage' | 'flat_inr';
  discount_value: number;
  price_elasticity_factor: number;
  conversion_rate_lift_pct: number;
  projected_orders: number;
  baseline_orders: number;
  incremental_orders: number;
  baseline_revenue: number;
  gross_campaign_revenue: number;
  discount_cost: number;
  net_revenue_lift: number;
  expected_revenue_lift_pct: number;
  baseline_margin_pct: number;
  projected_margin_pct: number;
  net_margin_impact_pct: number;
  roi_percentage: number;
  ai_strategy_verdict: string;
  daily_payoff: DailyForecastPoint[];
}

export interface CampaignListResponse {
  total_campaigns: number;
  active_campaigns: number;
  aggregate_expected_revenue_lift: number;
  total_projected_orders: number;
  avg_expected_lift_pct: number;
  campaigns: Campaign[];
  segments: CustomerSegment[];
}
