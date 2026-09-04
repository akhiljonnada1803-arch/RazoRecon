from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

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
    price: float
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
    in_stock: bool = True
    delivery_time: str = "2-3 business days"
    gst_rate_pct: float = 18.0
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
    category: str
    stock: int
    description: str
    availability: bool
    sku: str
    brand: str
    specs: Dict[str, str] = {}
    active_offer: Optional[str] = None
    gst_rate_pct: float = 18.0

class AICatalogContextDTO(BaseModel):
    schema_version: str = "2026.1"
    platform: str = "RazorCommerce AI Agentic Catalog"
    currency: str = "INR"
    last_synced: str
    total_items: int
    categories: List[str]
    products: List[AICatalogProductItemDTO]
    instructions_for_ai_agent: str
