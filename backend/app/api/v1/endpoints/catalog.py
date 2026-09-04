from fastapi import APIRouter, HTTPException, Query, Path, Body, UploadFile, File
from typing import List, Optional, Dict, Any
import os
import uuid
import base64

from app.schemas.catalog import (
    OfferDTO,
    ProductDetailDTO,
    ProductCreateDTO,
    ProductUpdateDTO,
    StockAdjustmentDTO,
    CatalogStatsDTO,
    CategoryCountDTO,
    ProductListResponseDTO,
    AICatalogContextDTO,
    ImageUploadResponseDTO
)

from app.services.catalog_service import catalog_service

router = APIRouter()

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("", response_model=ProductListResponseDTO)
@router.get("/products", response_model=ProductListResponseDTO)
def list_catalog_products(
    search: Optional[str] = Query(default=None, description="Search by name, SKU, brand or keywords"),
    category: Optional[str] = Query(default=None, description="Category filter"),
    stock_status: Optional[str] = Query(default=None, description="Filter: In Stock, Low Stock, Out of Stock"),
    min_price: Optional[float] = Query(default=None, description="Minimum price filter"),
    max_price: Optional[float] = Query(default=None, description="Maximum price filter"),
    sort_by: str = Query(default="newest", description="Sort: newest, price_asc, price_desc, stock_asc, stock_desc, name"),
    page: int = Query(default=1, ge=1, description="Page number"),
    limit: int = Query(default=50, ge=1, le=100, description="Items per page")
):
    """Retrieve filtered, sorted, and paginated products from the enterprise catalog."""
    return catalog_service.get_all_products(
        search=search,
        category=category,
        stock_status=stock_status,
        min_price=min_price,
        max_price=max_price,
        sort_by=sort_by,
        page=page,
        limit=limit
    )

@router.get("/stats", response_model=CatalogStatsDTO)
def get_catalog_statistics():
    """Retrieve aggregate catalog metrics: total inventory valuation, units, low stock alerts, in-stock rate."""
    return catalog_service.get_catalog_stats()

@router.get("/inventory")
def get_inventory_management_data():
    """Retrieve detailed inventory view with stock levels, low stock alerts, valuation, and threshold alerts."""
    stats = catalog_service.get_catalog_stats()
    all_products = catalog_service.get_all_products(limit=100)
    
    return {
        "stats": stats,
        "items": all_products.items,
        "low_stock_items": [p for p in all_products.items if p.stock_status == "Low Stock"],
        "out_of_stock_items": [p for p in all_products.items if p.stock_status == "Out of Stock"],
        "total_inventory_value": stats.total_valuation_inr,
        "total_units": stats.total_inventory_units,
    }

@router.get("/offers", response_model=List[OfferDTO])
def get_catalog_offers():
    """Retrieve all active promotional offers and discounts for products."""
    return catalog_service.get_offers()

@router.get("/categories", response_model=List[CategoryCountDTO])
def get_categories_breakdown():
    """Retrieve distinct catalog categories with product counts and available stock quantities."""
    return catalog_service.get_categories_breakdown()

@router.get("/agent-context", response_model=AICatalogContextDTO)
@router.get("/ai-context", response_model=AICatalogContextDTO)
def get_agent_readable_catalog():
    """
    AI-readable catalog endpoint (Razorpay Track 01).
    
    Exposes products as structured JSON for AI Agent discovery, autonomous search,
    pricing negotiations, and 1-click Razorpay test payment links.
    """
    return catalog_service.get_ai_readable_context()

@router.post("/upload")
async def upload_product_image_form(
    file: Optional[UploadFile] = File(None),
    payload: Optional[Dict[str, Any]] = Body(None)
):
    """
    Upload a product image supporting file picker, drag & drop, and base64.
    Supported: JPG, PNG, WEBP.
    """
    if file:
        file_ext = os.path.splitext(file.filename)[1].lower() if file.filename else ".jpg"
        if file_ext not in [".jpg", ".jpeg", ".png", ".webp"]:
            raise HTTPException(status_code=400, detail="Only JPG, PNG, and WEBP formats are supported.")
        
        file_id = f"img_{uuid.uuid4().hex[:12]}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, file_id)
        
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
            
        return {
            "url": f"/static/uploads/{file_id}",
            "filename": file.filename,
            "size_bytes": len(contents),
            "mime_type": file.content_type or "image/jpeg"
        }
    elif payload and "base64" in payload:
        # Base64 upload
        b64_data = payload["base64"]
        if "," in b64_data:
            b64_data = b64_data.split(",")[1]
        raw_bytes = base64.b64decode(b64_data)
        file_id = f"img_{uuid.uuid4().hex[:12]}.jpg"
        file_path = os.path.join(UPLOAD_DIR, file_id)
        with open(file_path, "wb") as f:
            f.write(raw_bytes)
        return {
            "url": f"/static/uploads/{file_id}",
            "filename": payload.get("filename", file_id),
            "size_bytes": len(raw_bytes),
            "mime_type": payload.get("mime_type", "image/jpeg")
        }
    else:
        # Fallback demo sample image
        sample_img = "https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600"
        return {
            "url": sample_img,
            "filename": "sample_product.jpg",
            "size_bytes": 45000,
            "mime_type": "image/jpeg"
        }

@router.get("/{product_id}", response_model=ProductDetailDTO)
@router.get("/products/{product_id}", response_model=ProductDetailDTO)
def get_product(product_id: str = Path(..., description="Unique product identifier")):
    """Retrieve full details and specifications for a single product."""
    product = catalog_service.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product with ID '{product_id}' not found.")
    return product

@router.post("", response_model=ProductDetailDTO, status_code=201)
def create_product(payload: ProductCreateDTO):
    """Create a new product SKU in the enterprise catalog."""
    return catalog_service.create_product(payload)

@router.put("/{product_id}", response_model=ProductDetailDTO)
def update_product(
    product_id: str = Path(..., description="Unique product identifier"),
    payload: ProductUpdateDTO = Body(...)
):
    """Update existing product details, pricing, or metadata."""
    updated = catalog_service.update_product(product_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Product with ID '{product_id}' not found.")
    return updated

@router.patch("/{product_id}/status", response_model=ProductDetailDTO)
@router.put("/{product_id}/status", response_model=ProductDetailDTO)
@router.patch("/products/{product_id}/status", response_model=ProductDetailDTO)
@router.put("/products/{product_id}/status", response_model=ProductDetailDTO)
def update_product_inventory_status(
    product_id: str = Path(..., description="Unique product identifier"),
    status: Optional[str] = Query(None, description="New inventory status: IN_STOCK, LOW_STOCK, OUT_OF_STOCK, PRE_ORDER, DISCONTINUED"),
    body: Optional[Dict[str, Any]] = Body(None)
):
    """Update interactive inventory status badge for a product."""
    target_status = status
    if not target_status and body and "status" in body:
        target_status = body["status"]
    if not target_status:
        target_status = "IN_STOCK"

    updated = catalog_service.update_inventory_status(product_id=product_id, status=target_status)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Product with ID '{product_id}' not found.")
    return updated

@router.patch("/{product_id}/stock", response_model=ProductDetailDTO)
@router.put("/{product_id}/stock", response_model=ProductDetailDTO)
@router.patch("/products/{product_id}/stock", response_model=ProductDetailDTO)
@router.put("/products/{product_id}/stock", response_model=ProductDetailDTO)
def adjust_product_stock(
    product_id: str = Path(..., description="Unique product identifier"),
    payload: Optional[StockAdjustmentDTO] = Body(default=None),
    stock_quantity: Optional[int] = Query(default=None)
):
    """Quickly increment, decrement, or override inventory count for a product."""
    if payload is None:
        if stock_quantity is not None:
            payload = StockAdjustmentDTO(adjustment_type="set", quantity=stock_quantity)
        else:
            payload = StockAdjustmentDTO(adjustment_type="set", quantity=50)

    updated = catalog_service.adjust_stock(
        product_id=product_id,
        adj=payload
    )
    if not updated:
        raise HTTPException(status_code=404, detail=f"Product with ID '{product_id}' not found.")
    return updated

@router.delete("/{product_id}")
@router.delete("/products/{product_id}")
def delete_product(product_id: str = Path(..., description="Unique product identifier")):
    """Remove a product from the enterprise catalog."""
    success = catalog_service.delete_product(product_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Product with ID '{product_id}' not found.")
    return {"status": "deleted", "product_id": product_id, "message": "Product successfully removed from catalog."}
