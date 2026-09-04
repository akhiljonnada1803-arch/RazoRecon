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
    cost_price: float
    original_price: Optional[float] = None
    currency: str = "INR"
    stock_quantity: int = 50
    reorder_threshold: int = 10
    stock_status: str = "In Stock" # "In Stock" | "Low Stock" | "Out of Stock"
    rating: float = 4.8
    reviews_count: int = 120
    image_url: str
    tagline: str
    description: str
    features: List[str] = []
    specs: List[ProductSpecDTO] = []
    in_stock: bool = True
    delivery_time: str = "2-3 business days"
    gst_rate_pct: float = 18.0
    hsn_sac_code: str = "8470"
    offer_id: Optional[str] = None
    offer_text: Optional[str] = None
    offer_discount_pct: Optional[float] = None
    offer_badge: Optional[str] = None
    created_at: str
    updated_at: str

class ProductCreateDTO(BaseModel):
    sku: Optional[str] = None
    name: str
    brand: str
    category: str
    price: float
    cost_price: Optional[float] = None
    original_price: Optional[float] = None
    stock_quantity: int = 50
    reorder_threshold: int = 10
    image_url: Optional[str] = None
    tagline: str
    description: str
    features: List[str] = []
    specs: List[ProductSpecDTO] = []
    delivery_time: Optional[str] = "2-3 business days"
    gst_rate_pct: float = 18.0
    hsn_sac_code: Optional[str] = "8470"
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
    reorder_threshold: Optional[int] = None
    image_url: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    features: Optional[List[str]] = None
    specs: Optional[List[ProductSpecDTO]] = None
    delivery_time: Optional[str] = None
    gst_rate_pct: Optional[float] = None
    hsn_sac_code: Optional[str] = None
    offer_id: Optional[str] = None
    offer_text: Optional[str] = None
    offer_discount_pct: Optional[float] = None
    offer_badge: Optional[str] = None

class StockAdjustmentDTO(BaseModel):
    adjustment_type: str = "set" # "set" | "increment" | "decrement"
    quantity: int
    reason: Optional[str] = "Manual inventory reconciliation"

class CatalogStatsDTO(BaseModel):
    total_products: int
    total_inventory_units: int
    total_valuation_inr: float
    low_stock_count: int
    out_of_stock_count: int
    in_stock_rate_pct: float
    categories_count: int

class CategoryCountDTO(BaseModel):
    category: str
    count: int
    total_units: int

class ProductListResponseDTO(BaseModel):
    products: List[ProductDetailDTO]
    total_count: int
    page: int
    limit: int
    total_pages: int
    categories: List[str]

class AICatalogProductItemDTO(BaseModel):
    id: str
    sku: str
    name: str
    brand: str
    category: str
    price_inr: float
    stock_status: str
    available_units: int
    key_features: List[str]
    specs_summary: Dict[str, str]
    gst_input_credit_pct: float
    active_offer: Optional[str] = None

class AICatalogContextDTO(BaseModel):
    schema_version: str = "2026.1"
    platform: str = "RazorRecon Commerce & Inventory System"
    currency: str = "INR"
    last_synced: str
    total_items: int
    categories: List[str]
    products: List[AICatalogProductItemDTO]
    instructions_for_llm: str
