from fastapi import APIRouter, HTTPException, Query, Path, Body
from typing import List, Optional
from app.schemas.catalog import (
    OfferDTO,
    ProductDetailDTO,
    ProductCreateDTO,
    ProductUpdateDTO,
    StockAdjustmentDTO,
    CatalogStatsDTO,
    CategoryCountDTO,
    ProductListResponseDTO,
    AICatalogContextDTO
)

from app.services.catalog_service import catalog_service

router = APIRouter()

@router.get("", response_model=ProductListResponseDTO)
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

@router.get("/offers", response_model=List[OfferDTO])
def get_catalog_offers():
    """Retrieve all active promotional offers and discounts for products."""
    return catalog_service.get_offers()

@router.get("/categories", response_model=List[CategoryCountDTO])
def get_categories_breakdown():
    """Retrieve distinct catalog categories with product counts and available stock quantities."""
    return catalog_service.get_categories_breakdown()


@router.get("/ai-context", response_model=AICatalogContextDTO)
def get_ai_readable_catalog():
    """
    AI-readable catalog endpoint.
    
    Returns structured, token-optimized JSON context with embeddings-ready specs,
    HSN/SAC codes, and GST rates for autonomous AI agents and CFO Copilot tools.
    """
    return catalog_service.get_ai_readable_context()

@router.get("/{product_id}", response_model=ProductDetailDTO)
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

@router.patch("/{product_id}/stock", response_model=ProductDetailDTO)
def adjust_product_stock(
    product_id: str = Path(..., description="Unique product identifier"),
    payload: StockAdjustmentDTO = Body(...)
):
    """Quickly increment, decrement, or override inventory count for a product."""
    updated = catalog_service.adjust_stock(
        product_id=product_id,
        quantity=payload.quantity,
        adjustment_type=payload.adjustment_type
    )
    if not updated:
        raise HTTPException(status_code=404, detail=f"Product with ID '{product_id}' not found.")
    return updated

@router.delete("/{product_id}")
def delete_product(product_id: str = Path(..., description="Unique product identifier")):
    """Remove a product from the enterprise catalog."""
    success = catalog_service.delete_product(product_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Product with ID '{product_id}' not found.")
    return {"status": "deleted", "product_id": product_id, "message": "Product successfully removed from catalog."}
