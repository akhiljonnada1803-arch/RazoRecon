export interface TopProductPerformanceDTO {
  id: string;
  title: string;
  category: string;
  sales_count: number;
  gmv_inr: number;
  stock_status: string;
  conversion_rate_pct: number;
}

export interface ConversionMetricsDTO {
  cart_to_checkout_pct: number;
  agent_conversion_pct: number;
  repeat_buyer_rate_pct: number;
  abandonment_recovery_pct: number;
}

export interface MerchantAnalyticsDTO {
  revenue_runrate_inr: number;
  gmv_growth_pct: number;
  fulfillment_score: number;
  inventory_health_pct: number;
  in_stock_skus_count: number;
  low_stock_skus_count: number;
  top_products: TopProductPerformanceDTO[];
  conversion_metrics: ConversionMetricsDTO;
}

export interface BuyerCohortItemDTO {
  id: string;
  name: string;
  email: string;
  ltv_inr: number;
  orders_count: number;
  avg_order_value_inr: number;
  last_order_date: string;
  churn_risk: 'Low' | 'Medium' | 'High' | string;
  preferred_category: string;
  agent_buyer_user: boolean;
  recommended_product: string;
}

export interface BuyingPatternDTO {
  channel: string;
  orders_count: number;
  share_pct: number;
  avg_order_value_inr: number;
}

export interface BuyerAnalyticsDTO {
  total_buyers_count: number;
  avg_ltv_inr: number;
  repeat_purchase_rate_pct: number;
  ai_recommendations_influence_pct: number;
  churn_risk_distribution: Record<string, number>;
  buying_patterns: BuyingPatternDTO[];
  top_buyers: BuyerCohortItemDTO[];
}

export interface VendorRiskScoreDTO {
  vendor_id: string;
  vendor: string;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  main_risk: string;
  total_transactions: number;
  total_exceptions: number;
  duplicate_payment_count: number;
  tax_mismatch_count: number;
  settlement_delay_count: number;
  avg_transaction_value: number;
  factors_breakdown: Record<string, number>;
  status: string;
}

export interface RiskDistributionPointDTO {
  level: string;
  count: number;
  percentage: number;
  color: string;
}

export interface RiskTrendPointDTO {
  date: string;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  avg_risk_score: number;
}

export interface HighRiskAlertDTO {
  alert_id: string;
  vendor_id: string;
  vendor: string;
  risk_score: number;
  main_risk: string;
  severity: string;
  exposure_amount: number;
  recommended_action: string;
}

export interface VendorRiskDashboardDTO {
  total_vendors: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  average_risk_score: number;
  vendors: VendorRiskScoreDTO[];
  distribution: RiskDistributionPointDTO[];
  trend: RiskTrendPointDTO[];
  alerts: HighRiskAlertDTO[];
  merchant_intelligence?: MerchantAnalyticsDTO;
  buyer_intelligence?: BuyerAnalyticsDTO;
}
