from fastapi import APIRouter, Query, Body, HTTPException, Path
from typing import Optional, List, Dict, Any
from app.services.merchant_service import merchant_service

router = APIRouter()

@router.get("/dashboard")
def get_merchant_dashboard():
    """Retrieve high-level merchant KPIs: Gross Revenue, Orders, SKUs, Conversion Rate, Customer Growth %."""
    return merchant_service.get_dashboard_metrics()

@router.get("/orders")
def list_orders(
    status: Optional[str] = Query("ALL", description="Filter by status: ALL, PENDING_CONFIRMATION, ACCEPTED, PROCESSING, PACKED, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, REJECTED"),
    search: Optional[str] = Query(None, description="Search by order number, customer, email, or AWB tracking")
):
    """List merchant orders with line items, customer details, and 7-stage status workflow."""
    return merchant_service.get_orders(status=status, search=search)

@router.get("/orders/{order_id}")
def get_order(order_id: str):
    """Get single order details by ID, order number, or tracking ID."""
    order = merchant_service.get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")
    return order

@router.post("/orders/{order_id}/accept")
def accept_order(order_id: str = Path(...)):
    """Merchant accepts the incoming customer order."""
    updated = merchant_service.accept_order(order_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"status": "success", "message": "Order accepted successfully", "order": updated}

@router.post("/orders/{order_id}/reject")
def reject_order(order_id: str = Path(...), payload: Optional[Dict[str, Any]] = Body(None)):
    """Merchant rejects the incoming customer order."""
    reason = payload.get("reason", "Out of stock / Operational constraint") if payload else "Out of stock"
    updated = merchant_service.reject_order(order_id, reason=reason)
    if not updated:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"status": "success", "message": "Order rejected", "order": updated}

@router.post("/orders/{order_id}/pack")
def pack_order(order_id: str = Path(...)):
    """Mark order as packed and ready for delivery partner pickup."""
    updated = merchant_service.pack_order(order_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"status": "success", "message": "Order packed", "order": updated}

@router.post("/orders/{order_id}/assign-courier")
def assign_courier(
    order_id: str = Path(...),
    payload: Dict[str, Any] = Body(..., example={"courier": "Delhivery"})
):
    """Assign delivery partner courier (Delhivery, Blue Dart, Shiprocket, Ekart) and generate AWB tracking ID."""
    courier = payload.get("courier", "Delhivery")
    updated = merchant_service.assign_courier(order_id, courier_name=courier)
    if not updated:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"status": "success", "message": f"Assigned to {courier}", "order": updated}

@router.post("/orders/{order_id}/ship")
def ship_order(
    order_id: str = Path(...),
    payload: Optional[Dict[str, Any]] = Body(None)
):
    """Dispatch order with courier partner."""
    courier = payload.get("courier", "Delhivery") if payload else "Delhivery"
    updated = merchant_service.ship_order(order_id, courier=courier)
    if not updated:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"status": "success", "message": "Order shipped", "order": updated}

@router.post("/orders/{order_id}/update-status")
def update_order_status(
    order_id: str = Path(...),
    payload: Dict[str, Any] = Body(..., example={"status": "DELIVERED", "notes": "Customer signed confirmation"})
):
    """Update order status checkpoint in 7-stage workflow."""
    status = payload.get("status", "DELIVERED")
    notes = payload.get("notes")
    updated = merchant_service.update_order_status(order_id, new_status=status, notes=notes)
    if not updated:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"status": "success", "message": f"Status updated to {status}", "order": updated}

@router.get("/delivery-partners")
def list_delivery_partners():
    """List integrated logistics delivery partners (Delhivery, Blue Dart, Shiprocket, Ekart)."""
    return merchant_service.get_delivery_partners()

@router.get("/shipments")
def list_active_shipments():
    """List all live active shipments with courier tracking IDs, ETAs, and status."""
    return merchant_service.get_shipments()

@router.post("/orders")
def create_order(payload: Dict[str, Any] = Body(...)):
    """Create a new merchant order."""
    return merchant_service.create_order(payload)

@router.get("/customers")
def list_customers():
    """List customer profiles with lifetime value (LTV), order frequency, preferences, and AI buyer insights."""
    return merchant_service.get_customers()

@router.get("/customers/{customer_id}")
def get_customer(customer_id: str):
    """Get single customer profile with preferences and history."""
    customer = merchant_service.get_customer_by_id(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer
