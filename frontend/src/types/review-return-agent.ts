export interface CustomerPrePurchaseIntelligence {
  product_id: string;
  product_name: string;
  review_summary: string;
  common_positives: string[];
  common_concerns: string[];
  return_risk_score: number;
  return_risk_tier: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH';
  explainable_recommendation: string;
  satisfaction_score: number;
  recommendation_score: number;
  total_reviews_analyzed: number;
  verified_buyer_ratio_pct: number;
  mitigation_action?: {
    type: string;
    label: string;
    risk_reduction_pct: number;
  };
}

export interface MerchantComplaintCategory {
  id: string;
  category_name: string;
  complaint_count: number;
  share_pct: number;
  primary_return_reason: string;
  return_rate_correlation_pct: number;
  sample_quote: string;
}

export interface MerchantReturnTrendPoint {
  period_label: string;
  baseline_return_rate_pct: number;
  actual_return_rate_pct: number;
  prevented_returns_count: number;
  saved_revenue_inr: number;
}

export interface ProductSentimentAspect {
  aspect: string;
  positive_pct: number;
  neutral_pct: number;
  negative_pct: number;
  sentiment_score: number;
  sentiment_label: string;
}

export interface SuggestedImprovement {
  id: string;
  title: string;
  issue_addressed: string;
  recommended_action: string;
  predicted_return_reduction_pct: number;
  expected_saved_revenue_inr: number;
  confidence_score: number;
  status: 'PENDING' | 'APPLIED';
  applied_at?: string;
}

export interface ProductReturnSummary {
  product_id: string;
  product_name: string;
  category: string;
  total_orders: number;
  return_count: number;
  return_rate_pct: number;
  sentiment_score: number;
  top_complaint: string;
  return_risk_tier: string;
}

export interface MerchantReviewReturnOverview {
  overall_return_rate_pct: number;
  baseline_return_rate_pct: number;
  predicted_return_reduction_pct: number;
  overall_sentiment_score_pct: number;
  total_saved_revenue_inr: number;
  total_complaints_analyzed: number;
  complaint_categories: MerchantComplaintCategory[];
  return_trends: MerchantReturnTrendPoint[];
  sentiment_aspects: ProductSentimentAspect[];
  suggested_improvements: SuggestedImprovement[];
  product_summaries: ProductReturnSummary[];
}
