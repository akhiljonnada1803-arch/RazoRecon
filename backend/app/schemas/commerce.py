from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

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
    in_stock: bool = True
    delivery_time: str = "2-3 business days"
    gst_rate_pct: float = 18.0

class CartItemDTO(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int = 1
    image_url: str
    category: Optional[str] = None

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
    recommended_products: Optional[List[ProductDTO]] = None
    comparison_data: Optional[ComparisonDataDTO] = None
    suggested_prompts: Optional[List[str]] = None
    action_type: Optional[str] = None # "add_to_cart" | "view_cart" | "compare" | "checkout"

class CommerceChatRequestDTO(BaseModel):
    query: str
    history: List[ChatMessageDTO] = []
    cart: Optional[CartDTO] = None

class CommerceChatResponseDTO(BaseModel):
    message: str
    recommended_products: List[ProductDTO] = []
    comparison_data: Optional[ComparisonDataDTO] = None
    suggested_prompts: List[str] = []
    cart: Optional[CartDTO] = None
    action_triggered: Optional[str] = None
    checkout_link: Optional[str] = None

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
