from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class PriceTierDTO(BaseModel):
    min_qty: int
    max_qty: Optional[int] = None
    discount_pct: float

class ProductSpecDTO(BaseModel):
    key: str
    value: str

class OfferDTO(BaseModel):
    id: str
    code: str
    title: str
    discount_type: str # "percentage" | "flat_inr"
    discount_value: float
    min_order_value: float = 0.0
    badge_label: str
    category_restriction: Optional[str] = None
    active: bool = True

class ProductDetailDTO(BaseModel):
    id: str
    sku: str
    name: str
    brand: str
    category: str
    price: float  # Customer-facing GST-inclusive price
    customer_price: Optional[float] = None  # Explicit GST-inclusive price
    base_price: Optional[float] = None  # Net price before GST
    gst_rate: Optional[float] = 0.18  # Fractional GST rate (e.g. 0.18)
    gst_rate_pct: float = 18.0  # Percentage GST rate (e.g. 18.0)
    gst_amount: Optional[float] = None  # GST component in INR
    price_display: Optional[str] = None  # e.g. "₹14,999 Inclusive of GST"
    cost_price: float = 0.0
    original_price: Optional[float] = None
    currency: str = "INR"
    stock_quantity: int = 50
    stock: int = 50
    reorder_threshold: int = 10
    stock_status: str = "In Stock" # "In Stock" | "Low Stock" | "Out of Stock"
    inventory_status: str = "IN_STOCK" # "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "PRE_ORDER" | "DISCONTINUED"
    rating: float = 4.8
    reviews_count: int = 120
    image_url: str
    images: List[str] = []
    tagline: str = ""
    description: str
    features: List[str] = []
    key_features: List[str] = []
    specs: List[ProductSpecDTO] = []
    price_tiers: Optional[List[PriceTierDTO]] = []
    price_tiers_json: Optional[str] = "[]"
    review_sentiment_score: Optional[float] = 0.90
    popularity_score: Optional[float] = 0.88
    in_stock: bool = True
    delivery_time: str = "2-3 business days"
    hsn_sac_code: str = "8470"
    offer_id: Optional[str] = None
    offer_text: Optional[str] = None
    active_offer: Optional[str] = None
    offer_discount_pct: Optional[float] = None
    offer_badge: Optional[str] = None
    created_at: str
    updated_at: str

class ProductCreateDTO(BaseModel):
    sku: Optional[str] = None
    name: str
    brand: Optional[str] = "Acme Hardware"
    category: str
    price: float
    base_price: Optional[float] = None
    customer_price: Optional[float] = None
    gst_rate: Optional[float] = 0.18
    gst_rate_pct: Optional[float] = 18.0
    cost_price: Optional[float] = None
    original_price: Optional[float] = None
    stock_quantity: Optional[int] = 50
    stock: Optional[int] = None
    reorder_threshold: Optional[int] = 10
    inventory_status: Optional[str] = "IN_STOCK"
    image_url: Optional[str] = None
    images: Optional[List[str]] = None
    tagline: Optional[str] = ""
    description: str
    features: Optional[List[str]] = []
    key_features: Optional[List[str]] = None
    specs: Optional[List[ProductSpecDTO]] = []
    price_tiers: Optional[List[PriceTierDTO]] = None
    price_tiers_json: Optional[str] = None
    delivery_time: Optional[str] = "2-3 business days"
    gst_rate_pct: Optional[float] = 18.0
    hsn_sac_code: Optional[str] = "8470"
    active_offer: Optional[str] = None
    offer_id: Optional[str] = None
    offer_text: Optional[str] = None
    offer_discount_pct: Optional[float] = None
    offer_badge: Optional[str] = None

class ProductUpdateDTO(BaseModel):
    sku: Optional[str] = None
    name: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    cost_price: Optional[float] = None
    original_price: Optional[float] = None
    stock_quantity: Optional[int] = None
    stock: Optional[int] = None
    reorder_threshold: Optional[int] = None
    inventory_status: Optional[str] = None
    image_url: Optional[str] = None
    images: Optional[List[str]] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    features: Optional[List[str]] = None
    key_features: Optional[List[str]] = None
    specs: Optional[List[ProductSpecDTO]] = None
    price_tiers: Optional[List[PriceTierDTO]] = None
    price_tiers_json: Optional[str] = None
    delivery_time: Optional[str] = None
    gst_rate_pct: Optional[float] = None
    hsn_sac_code: Optional[str] = None
    active_offer: Optional[str] = None
    offer_id: Optional[str] = None
    offer_text: Optional[str] = None
    offer_discount_pct: Optional[float] = None
    offer_badge: Optional[str] = None

class StockAdjustmentDTO(BaseModel):
    adjustment_type: str = "set" # "set" | "increment" | "decrement"
    quantity: int
    reason: Optional[str] = "Manual inventory replenishment"

class CatalogStatsDTO(BaseModel):
    total_products: int
    total_inventory_units: int
    total_valuation_inr: float
    low_stock_count: int
    out_of_stock_count: int
    in_stock_rate_pct: float
    categories_count: int
    active_offers_count: int = 5
    categories: List[Dict[str, Any]] = []

class CategoryCountDTO(BaseModel):
    name: str
    count: int
    total_units: int = 0

class ProductListResponseDTO(BaseModel):
    items: List[ProductDetailDTO]
    products: List[ProductDetailDTO]
    total: int
    total_count: int
    page: int
    limit: int
    total_pages: int
    categories: List[CategoryCountDTO] = []

class ImageUploadResponseDTO(BaseModel):
    url: str
    filename: str
    size_bytes: int
    mime_type: str

class AICatalogProductItemDTO(BaseModel):
    product_id: str
    name: str
    price: float
    customer_price: float
    base_price: float
    gst_rate: float = 0.18
    gst_rate_pct: float = 18.0
    gst_inclusive: bool = True
    price_display: str = ""
    category: str
    stock: int
    description: str
    availability: bool
    sku: str
    brand: str
    specs: Dict[str, str] = {}
    active_offer: Optional[str] = None
    volume_pricing_tiers: List[Dict[str, Any]] = []

class AICatalogContextDTO(BaseModel):
    schema_version: str = "2026.1"
    platform: str = "RazorCommerce AI Agentic Catalog"
    currency: str = "INR"
    last_synced: str
    total_items: int
    categories: List[str]
    products: List[AICatalogProductItemDTO]
    instructions_for_ai_agent: str
