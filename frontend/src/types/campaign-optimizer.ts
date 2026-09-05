export interface SalesCategoryTrend {
  category: string;
  historical_revenue: number;
  order_volume: number;
  yoy_growth_pct: number;
  avg_margin_pct: number;
  sales_velocity: 'HIGH' | 'MODERATE' | 'ACCELERATING' | 'DECLINING';
  top_selling_sku: string;
}

export interface CampaignOpportunity {
  id: string;
  title: string;
  category: string;
  target_segment: string;
  rationale: string;
  recommended_discount_pct: number;
  estimated_revenue_potential: number;
  confidence_score: number;
  target_skus: string[];
}

export interface DailyTrajectoryPoint {
  day: number;
  date_label: string;
  baseline_revenue: number;
  campaign_revenue: number;
  incremental_lift: number;
  conversion_rate_pct: number;
  orders_count: number;
}

export interface ChannelPerformance {
  channel: string;
  sent_count: number;
  open_rate_pct: number;
  click_through_rate_pct: number;
  conversion_rate_pct: number;
  revenue_generated: number;
  roas: number;
}

export interface CampaignImprovement {
  id: string;
  campaign_id: string;
  campaign_name: string;
  recommendation_type: string;
  insight: string;
  recommended_improvement: string;
  expected_additional_lift: string;
  expected_lift_inr: number;
  confidence_score: number;
  status: 'PENDING' | 'APPLIED';
  applied_at?: string;
}

export interface OptimizedCampaign {
  id: string;
  name: string;
  target_products: string[];
  campaign_objective: string;
  predicted_roi: number;
  predicted_roi_display: string;
  estimated_revenue_increase: number;
  estimated_revenue_increase_display: string;
  confidence_score: number;
  suggested_discount_pct: number;
  discount_code: string;
  target_segment: string;
  target_segment_id: string;
  status: 'active' | 'scheduled' | 'completed' | 'draft';
  channels: string[];
  campaign_spend_budget: number;
  baseline_revenue: number;
  projected_total_gmv: number;
  projected_orders: number;
  conversion_lift_pct: number;
  price_elasticity: number;
  net_margin_impact_pct: number;
  ai_copy_subject: string;
  ai_copy_body: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  created_at: string;
  trajectory: DailyTrajectoryPoint[];
  channel_performance: ChannelPerformance[];
}

export interface CampaignOptimizerOverview {
  total_campaigns: number;
  active_campaigns: number;
  total_projected_revenue_increase: number;
  avg_predicted_roi: number;
  avg_confidence_score: number;
  top_performing_channel: string;
  historical_sales_trends: SalesCategoryTrend[];
  identified_opportunities: CampaignOpportunity[];
  campaigns: OptimizedCampaign[];
  active_improvements: CampaignImprovement[];
  channel_attribution_summary: ChannelPerformance[];
}
