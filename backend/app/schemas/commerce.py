from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.schemas.reviews import ReviewIntelligenceDTO

class ProductSpecDTO(BaseModel):
    key: str
    value: str

class ProductDTO(BaseModel):
    id: str
    name: str
    brand: str
    category: str
    price: float
    original_price: Optional[float] = None
    currency: str = "INR"
    rating: float = 4.8
    reviews_count: int = 124
    image_url: str
    tagline: str
    description: str
    features: List[str] = []
    specs: List[ProductSpecDTO] = []
    pros: List[str] = []
    cons: List[str] = []
    stock_status: Optional[str] = "In Stock (Available)"
    delivery_eta: Optional[str] = "Tomorrow by 5:00 PM via Delhivery"
    merchant_trust_score: Optional[float] = 98.5
    in_stock: bool = True
    delivery_time: str = "2-3 business days"
    gst_rate_pct: float = 18.0
    price_tiers: Optional[List[Dict[str, Any]]] = None
    price_tiers_json: Optional[str] = None
    review_sentiment_score: Optional[float] = 0.90
    popularity_score: Optional[float] = 0.88
    match_score: Optional[float] = None
    ranking_breakdown: Optional[Dict[str, float]] = None
    why_recommended: Optional[str] = None
    review_intelligence: Optional[ReviewIntelligenceDTO] = None


class CartItemDTO(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int = 1
    image_url: str
    category: Optional[str] = None
    tier_used: Optional[Dict[str, Any]] = None
    discount_amount: float = 0.0
    effective_price: Optional[float] = None

class CartDTO(BaseModel):
    items: List[CartItemDTO] = []
    subtotal: float = 0.0
    tax_gst: float = 0.0
    shipping: float = 0.0
    discount: float = 0.0
    coupon_applied: Optional[str] = None
    total: float = 0.0
    currency: str = "INR"

class ComparisonAttributeDTO(BaseModel):
    attribute: str
    values: Dict[str, str]

class ComparisonDataDTO(BaseModel):
    product_ids: List[str]
    products: List[ProductDTO]
    attributes: List[ComparisonAttributeDTO]
    verdict: str

class ChatMessageDTO(BaseModel):
    role: str # "user" | "assistant"
    content: str
    timestamp: Optional[str] = None
    recommended_products: Optional[List[Any]] = None
    comparison_data: Optional[ComparisonDataDTO] = None
    suggested_prompts: Optional[List[str]] = None
    action_type: Optional[str] = None # "add_to_cart" | "view_cart" | "compare" | "checkout" | "select_product" | "select_address"
    flow_step: Optional[str] = None
    ai_recommendation_reason: Optional[Dict[str, Any]] = None
    selected_product: Optional[Any] = None
    selected_address: Optional[Dict[str, Any]] = None
    order_summary: Optional[Dict[str, Any]] = None
    saved_addresses: Optional[List[Dict[str, Any]]] = None
    review_intelligence: Optional[ReviewIntelligenceDTO] = None
    before_checkout_summary: Optional[str] = None

class CommerceChatRequestDTO(BaseModel):
    query: str
    history: List[ChatMessageDTO] = []
    cart: Optional[CartDTO] = None
    action: Optional[str] = None # "select_product" | "select_address" | "confirm_autopay_purchase"
    selected_product_id: Optional[str] = None
    selected_address: Optional[Dict[str, Any]] = None
    quantity: Optional[int] = 1

class CommerceChatResponseDTO(BaseModel):
    message: str
    recommended_products: List[ProductDTO] = []
    comparison_data: Optional[ComparisonDataDTO] = None
    suggested_prompts: List[str] = []
    cart: Optional[CartDTO] = None
    action_triggered: Optional[str] = None
    flow_step: Optional[str] = None # "TOP_RECOMMENDATIONS" | "ADDRESS_SELECTION" | "ORDER_SUMMARY" | "AUTONOMOUS_PURCHASE" | "APPROVAL_REQUIRED"
    ai_recommendation_reason: Optional[Dict[str, Any]] = None
    recommendation_reason: Optional[str] = None
    confidence_score: Optional[float] = None
    selected_product: Optional[ProductDTO] = None
    selected_address: Optional[Dict[str, Any]] = None
    order_summary: Optional[Dict[str, Any]] = None
    saved_addresses: Optional[List[Dict[str, Any]]] = None
    checkout_link: Optional[str] = None
    autonomous_order: Optional[Dict[str, Any]] = None
    requires_approval: Optional[bool] = False
    autopay_guardrail_info: Optional[Dict[str, Any]] = None
    parsed_intent: Optional[Dict[str, Any]] = None
    review_intelligence: Optional[ReviewIntelligenceDTO] = None
    before_checkout_summary: Optional[str] = None


class AdvisorParsedIntentDTO(BaseModel):
    intent: str = "product_recommendation"
    category: Optional[str] = None
    budget: Optional[float] = None
    desired_specs: List[str] = []
    rating_min: Optional[float] = None
    preferred_brands: List[str] = []
    raw_query: Optional[str] = None

class AdvisorRecommendRequestDTO(BaseModel):
    query: str
    budget_cap: Optional[float] = None
    limit: Optional[int] = 3

class AdvisorRecommendationResponseDTO(BaseModel):
    recommended_products: List[ProductDTO] = []
    recommendation_reason: str = ""
    confidence_score: float = 0.0
    parsed_intent: Optional[AdvisorParsedIntentDTO] = None
    query: Optional[str] = None

class CheckoutRequestDTO(BaseModel):
    cart: CartDTO
    customer_email: Optional[str] = "finance.ops@acmedirect.com"
    customer_name: Optional[str] = "Acme Direct Corp"
    customer_phone: Optional[str] = "+91 98765 43210"

class CheckoutResponseDTO(BaseModel):
    payment_link_id: str
    payment_url: str
    order_id: str
    amount: float
    currency: str = "INR"
    status: str = "created"
    qr_code_mock: str
    expires_at: str
    summary_items: List[CartItemDTO] = []
