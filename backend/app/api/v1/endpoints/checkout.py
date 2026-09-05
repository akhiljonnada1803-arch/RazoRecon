from fastapi import APIRouter, HTTPException, Query, Path, Body, Depends
from typing import List, Optional
from app.schemas.checkout import (
    CartDTO,
    AddToCartRequestDTO,
    UpdateQuantityRequestDTO,
    ApplyCouponRequestDTO,
    CheckoutOrderRequestDTO,
    CheckoutOrderResponseDTO,
    AuditLogDTO,
    TransactionStatusDTO,
    AgentCommandRequestDTO,
    AgentCommandResponseDTO
)
from app.schemas.auth import UserDTO
from app.services.checkout_service import checkout_service
from app.core.auth_dependency import require_authenticated_customer

router = APIRouter()

@router.get("/cart", response_model=CartDTO)
def get_or_create_default_cart(cart_id: Optional[str] = Query(default=None, description="Optional existing cart ID")):
    """Retrieve active enterprise shopping cart or create a new session."""
    return checkout_service.get_or_create_cart(cart_id)

@router.get("/cart/{cart_id}", response_model=CartDTO)
def get_cart_by_id(cart_id: str = Path(..., description="Cart unique identifier")):
    """Retrieve specific cart and live summary calculations."""
    return checkout_service.get_or_create_cart(cart_id)

@router.post("/cart/{cart_id}/items", response_model=CartDTO)
def add_product_to_cart(
    cart_id: str = Path(..., description="Cart unique identifier"),
    payload: AddToCartRequestDTO = Body(...)
):
    """Add a product SKU to the shopping cart."""
    try:
        return checkout_service.add_to_cart(cart_id, payload.product_id, payload.quantity, actor="User")
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add item to cart: {str(e)}")

@router.put("/cart/{cart_id}/items/{product_id}", response_model=CartDTO)
def update_cart_item_quantity(
    cart_id: str = Path(..., description="Cart unique identifier"),
    product_id: str = Path(..., description="Product identifier"),
    payload: UpdateQuantityRequestDTO = Body(...)
):
    """Update item quantity in cart or remove if quantity is 0."""
    try:
        return checkout_service.update_quantity(cart_id, product_id, payload.quantity, actor="User")
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update quantity: {str(e)}")

@router.delete("/cart/{cart_id}/items/{product_id}", response_model=CartDTO)
def remove_cart_item(
    cart_id: str = Path(..., description="Cart unique identifier"),
    product_id: str = Path(..., description="Product identifier")
):
    """Remove a product from the shopping cart."""
    try:
        return checkout_service.remove_item(cart_id, product_id, actor="User")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove item: {str(e)}")

@router.post("/cart/{cart_id}/coupon", response_model=CartDTO)
def apply_promo_coupon(
    cart_id: str = Path(..., description="Cart unique identifier"),
    payload: ApplyCouponRequestDTO = Body(...)
):
    """Apply promo code to cart (e.g. RAZOR2026, FESTIVE15, ENTERPRISE5000)."""
    try:
        return checkout_service.apply_coupon(cart_id, payload.code, actor="User")
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to apply coupon: {str(e)}")

@router.post("/create-order", response_model=CheckoutOrderResponseDTO)
def create_checkout_order(
    payload: CheckoutOrderRequestDTO = Body(...),
    customer: UserDTO = Depends(require_authenticated_customer)
):
    """
    Convert cart to a Razorpay Test Mode Order.
    Requires verified authenticated customer identity.
    Computes Subtotal (Order Amount), 18% GST Taxes, Promo Discounts, and Final Amount.
    """
    cid = payload.customer_id or customer.id
    if not cid or not str(cid).strip():
        raise HTTPException(status_code=400, detail="customer_id is required")

    aid = payload.address_id or payload.shipping_address_id
    if not aid or not str(aid).strip():
        raise HTTPException(status_code=400, detail="address_id is required")

    # Verify address ownership strictly (Return 403 if address belongs to another user)
    from app.services.customer_order_service import customer_order_service
    addr = customer_order_service.get_address_by_id(aid)
    if not addr:
        raise HTTPException(status_code=400, detail="Address not found")
    if addr.get("user_id") != cid:
        raise HTTPException(status_code=403, detail="Address does not belong to user")

    pm = payload.payment_method
    if not pm or not str(pm).strip():
        raise HTTPException(status_code=400, detail="payment_method is required")

    try:
        return checkout_service.create_checkout_order(payload, actor=customer.name)
    except PermissionError as pe:
        raise HTTPException(status_code=403, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Checkout order creation failed: {str(e)}")

@router.post("/agent-command", response_model=AgentCommandResponseDTO)
def process_agent_command(payload: AgentCommandRequestDTO = Body(...)):
    """Process natural language instructions from the AI Checkout Assistant."""
    return checkout_service.process_agent_command(payload)

@router.get("/audit-logs", response_model=List[AuditLogDTO])
def get_checkout_audit_logs(limit: int = Query(50, ge=1, le=200)):
    """Retrieve full chronological audit log stream of all cart and checkout lifecycle events."""
    return checkout_service.get_audit_logs(limit=limit)

@router.get("/transactions", response_model=List[TransactionStatusDTO])
def get_checkout_transactions(limit: int = Query(50, ge=1, le=100)):
    """Retrieve live status of all checkout transactions."""
    return checkout_service.get_transactions(limit=limit)
