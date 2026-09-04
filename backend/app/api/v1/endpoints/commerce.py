from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Optional
from app.schemas.commerce import (
    ProductDTO,
    CommerceChatRequestDTO,
    CommerceChatResponseDTO,
    CheckoutRequestDTO,
    CheckoutResponseDTO,
    ComparisonDataDTO
)
from app.services.commerce_service import commerce_service

router = APIRouter()

@router.get("/products", response_model=List[ProductDTO])
def list_products(
    q: Optional[str] = Query(default=None, description="Natural language search term"),
    category: Optional[str] = Query(default=None, description="Product category filter")
):
    """Retrieve catalog products with optional query and category filters."""
    return commerce_service.get_all_products(query=q, category=category)

@router.get("/products/{product_id}", response_model=ProductDTO)
def get_product_details(product_id: str):
    """Retrieve detailed product specifications and features."""
    product = commerce_service.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product with ID '{product_id}' not found.")
    return product

@router.post("/chat", response_model=CommerceChatResponseDTO)
def chat_with_commerce_agent(payload: CommerceChatRequestDTO):
    """
    Conversational shopping agent.
    
    Capabilities:
    - Natural language product discovery
    - Product Q&A and technical specs inquiry
    - Side-by-side product comparison
    - Cart addition / removal / inspection
    - Promo coupon validation
    - Razorpay payment link generation
    """
    return commerce_service.process_chat_query(
        query=payload.query,
        history=payload.history,
        cart=payload.cart
    )

@router.post("/compare", response_model=ComparisonDataDTO)
def compare_products(product_ids: List[str] = Body(..., embed=True)):
    """Generate structured side-by-side comparison matrix for selected product IDs."""
    return commerce_service.compare_products(product_ids)

@router.post("/checkout", response_model=CheckoutResponseDTO)
def generate_checkout_payment_link(payload: CheckoutRequestDTO):
    """Generate a dynamic Razorpay payment link and QR code for the active shopping cart."""
    return commerce_service.generate_checkout_link(payload.cart)

@router.get("/prompts", response_model=List[str])
def get_suggested_prompts():
    """Retrieve contextual starter prompts for the conversational commerce interface."""
    return [
        "Show smart POS terminals for high-volume retail",
        "Compare Razorpay POS Terminal V3 and Smart Soundbox 4G",
        "What is the warranty and battery life on the POS terminal?",
        "Recommend developer keyboards and curved 5K monitors",
        "Apply coupon RAZOR2026 and generate Razorpay checkout link"
    ]
