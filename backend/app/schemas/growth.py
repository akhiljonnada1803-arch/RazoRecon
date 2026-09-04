from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class GrowthBasketItemDTO(BaseModel):
    product_id: str
    name: str
    brand: Optional[str] = "RazorRecon Commerce"
    category: str = "General"
    price: float
    cost_price: Optional[float] = None
    quantity: int = 1
    image_url: Optional[str] = "https://images.unsplash.com/photo-1556742049-0a67e557224f?w=500"

class GrowthBasketRequestDTO(BaseModel):
    items: List[GrowthBasketItemDTO] = []
    merchant_segment: Optional[str] = "Retail & D2C E-Commerce"

class RecommendationCardDTO(BaseModel):
    id: str
    type: str # "upsell" | "cross_sell"
    title: str
    badge_label: str
    target_product_id: str
    target_product_name: str
    target_brand: str
    target_category: str
    target_image_url: str
    target_price: float
    target_cost_price: float
    original_product_id: Optional[str] = None
    original_product_name: Optional[str] = None
    price_delta: float
    margin_delta_pct: float
    confidence_score_pct: int
    conversion_probability: float
    expected_uplift_inr: float
    strategy_rationale: str
    key_advantages: List[str] = []

class AffinityRuleDTO(BaseModel):
    rule_id: str
    antecedent_product_name: str
    consequent_product_name: str
    consequent_product_id: str
    consequent_price: float
    support_pct: float
    confidence_pct: float
    lift_score: float
    historical_co_purchases: int
    synergy_type: str # "Hardware + Audio" | "POS + Software" | "Peripheral + Warranty"

class SampleBasketDTO(BaseModel):
    id: str
    name: str
    description: str
    industry: str
    items: List[GrowthBasketItemDTO]

class GrowthAnalysisResponseDTO(BaseModel):
    current_cart_value: float
    predicted_cart_value: float
    expected_uplift_pct: float
    expected_uplift_inr: float
    current_gross_margin_pct: float
    projected_gross_margin_pct: float
    margin_expansion_pct: float
    total_active_items: int
    upsell_recommendations: List[RecommendationCardDTO] = []
    cross_sell_recommendations: List[RecommendationCardDTO] = []
    affinity_rules: List[AffinityRuleDTO] = []
    ai_strategy_rationale: str
    growth_health_score: int # 0-100
