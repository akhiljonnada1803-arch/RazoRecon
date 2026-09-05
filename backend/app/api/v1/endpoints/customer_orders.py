from fastapi import APIRouter, HTTPException, Query, Path, Body, Depends, Header
from typing import List, Optional, Dict, Any
from app.services.customer_order_service import customer_order_service

router = APIRouter()

# -------------------------------------------------------------
# ADDRESS BOOK ENDPOINTS
# -------------------------------------------------------------
@router.get("/addresses")
def get_saved_addresses(user_id: str = Query("usr_customer_demo")):
    """List saved customer delivery addresses with default flags."""
    return customer_order_service.get_addresses(user_id=user_id)

@router.post("/addresses")
def add_new_address(payload: Dict[str, Any] = Body(...), user_id: str = Query("usr_customer_demo")):
    """Add new delivery address to customer profile."""
    return customer_order_service.add_address(user_id=user_id, data=payload)

@router.put("/addresses/{addr_id}")
def update_existing_address(
    addr_id: str = Path(...),
    payload: Dict[str, Any] = Body(...),
    user_id: str = Query("usr_customer_demo")
):
    """Update existing delivery address."""
    updated = customer_order_service.update_address(addr_id=addr_id, user_id=user_id, data=payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Address not found")
    return updated

@router.delete("/addresses/{addr_id}")
def delete_saved_address(addr_id: str = Path(...), user_id: str = Query("usr_customer_demo")):
    """Delete a saved delivery address."""
    success = customer_order_service.delete_address(addr_id=addr_id, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Address not found or already deleted")
    return {"status": "success", "message": "Address deleted"}

@router.post("/addresses/{addr_id}/default")
def set_default_address(addr_id: str = Path(...), user_id: str = Query("usr_customer_demo")):
    """Set default delivery address."""
    updated = customer_order_service.set_default_address(addr_id=addr_id, user_id=user_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Address not found")
    return updated

# -------------------------------------------------------------
# MULTI-STEP CHECKOUT
# -------------------------------------------------------------
@router.post("/checkout")
def execute_multi_step_checkout(payload: Dict[str, Any] = Body(...), user_id: str = Query("usr_customer_demo")):
    """
    Execute 5-step Amazon/Flipkart checkout.
    Persists order, generates RCM-2026-XXXXXX order number, saves address snapshot, and schedules fulfillment.
    """
    try:
        return customer_order_service.process_checkout(user_id=user_id, payload=payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Checkout processing failed: {str(e)}")

# -------------------------------------------------------------
# ORDERS & TRACKING
# -------------------------------------------------------------
@router.get("/orders")
def get_customer_orders(
    user_id: Optional[str] = Query("usr_customer_demo"),
    status: Optional[str] = Query("ALL", description="Filter by stage: ALL, PROCESSING, PACKED, SHIPPED, DELIVERED, CANCELLED, RETURNED, REFUNDED"),
    search: Optional[str] = Query(None, description="Search by Order ID, Product, or AWB")
):
    """List customer orders with stage filters and search."""
    orders = customer_order_service.get_customer_orders(user_id=user_id, status=status or "ALL", search=search)
    return {"orders": orders, "total": len(orders)}

@router.get("/orders/{order_id}")
def get_single_order_details(order_id: str = Path(...)):
    """Get single order details with item list, address snapshot, invoice breakdown, merchant info, and courier details."""
    order = customer_order_service.get_order_details(order_id)
    if not order:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")
    return order

@router.get("/orders/{order_id}/tracking")
def get_order_tracking_timeline(order_id: str = Path(...)):
    """Retrieve visual 8-stage milestone tracking timeline with live timestamps and carrier telemetry."""
    tracking = customer_order_service.get_order_tracking(order_id)
    if not tracking:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' tracking not found")
    return tracking

# -------------------------------------------------------------
# RETURNS & REFUNDS
# -------------------------------------------------------------
@router.post("/orders/{order_id}/return")
def submit_return_request(
    order_id: str = Path(...),
    payload: Dict[str, Any] = Body(...),
    user_id: str = Query("usr_customer_demo")
):
    """Submit return request for an order with reason, notes, and optional attachment."""
    try:
        return customer_order_service.create_return_request(order_id=order_id, user_id=user_id, data=payload)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Return request failed: {str(e)}")

# -------------------------------------------------------------
# TAX INVOICE GENERATION
# -------------------------------------------------------------
@router.get("/orders/{order_id}/invoice")
def get_order_tax_invoice(order_id: str = Path(...)):
    """Retrieve full GST compliant tax invoice breakdown for an order."""
    try:
        return customer_order_service.generate_tax_invoice(order_id)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate invoice: {str(e)}")

# -------------------------------------------------------------
# CUSTOMER DASHBOARD WIDGETS
# -------------------------------------------------------------
@router.get("/dashboard-widgets")
def get_customer_dashboard_widgets(user_id: str = Query("usr_customer_demo")):
    """Retrieve customer hub widgets: Recent Orders, In-Transit Shipments, Returns, and Saved Addresses."""
    return customer_order_service.get_dashboard_widgets(user_id=user_id)

