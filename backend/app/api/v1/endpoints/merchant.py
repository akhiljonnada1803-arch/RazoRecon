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

# Status Update Routes (Supports PUT, PATCH, POST with query param or body)
@router.put("/orders/{order_id}/status")
@router.patch("/orders/{order_id}/status")
@router.post("/orders/{order_id}/status")
@router.put("/orders/{order_id}/update-status")
@router.patch("/orders/{order_id}/update-status")
@router.post("/orders/{order_id}/update-status")
def update_order_status_endpoint(
    order_id: str = Path(..., description="Order ID or Order Number"),
    status: Optional[str] = Query(None, description="New status in 7-stage pipeline"),
    notes: Optional[str] = Query(None, description="Optional checkpoint notes"),
    payload: Optional[Dict[str, Any]] = Body(None)
):
    """Update order status in 7-stage workflow (ACCEPTED, PROCESSING, PACKED, COURIER_ASSIGNED, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, REJECTED)."""
    target_status = status
    target_notes = notes

    if payload:
        if not target_status and "status" in payload:
            target_status = payload["status"]
        if not target_notes and "notes" in payload:
            target_notes = payload["notes"]

    if not target_status:
        target_status = "PROCESSING"

    updated = merchant_service.update_order_status(order_id, new_status=target_status, notes=target_notes)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")
    return {"status": "success", "message": f"Status updated to {target_status}", "order": updated}

# Courier Assignment Routes (Supports PUT, PATCH, POST)
@router.put("/orders/{order_id}/courier")
@router.patch("/orders/{order_id}/courier")
@router.post("/orders/{order_id}/courier")
@router.put("/orders/{order_id}/assign-courier")
@router.patch("/orders/{order_id}/assign-courier")
@router.post("/orders/{order_id}/assign-courier")
def assign_courier_endpoint(
    order_id: str = Path(..., description="Order ID or Order Number"),
    courier_name: Optional[str] = Query(None, description="Courier name (Delhivery Express, Blue Dart, Shiprocket, Ekart)"),
    courier: Optional[str] = Query(None, description="Alias for courier_name"),
    payload: Optional[Dict[str, Any]] = Body(None)
):
    """Assign delivery partner courier and generate AWB tracking ID."""
    selected_courier = courier_name or courier

    if payload:
        if not selected_courier and "courier_name" in payload:
            selected_courier = payload["courier_name"]
        if not selected_courier and "courier" in payload:
            selected_courier = payload["courier"]

    if not selected_courier:
        selected_courier = "Delhivery Express"

    updated = merchant_service.assign_courier(order_id, courier_name=selected_courier)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")
    return {"status": "success", "message": f"Assigned to {selected_courier}", "order": updated}

@router.post("/orders/{order_id}/accept")
@router.put("/orders/{order_id}/accept")
def accept_order(order_id: str = Path(...)):
    """Merchant accepts the incoming customer order."""
    updated = merchant_service.accept_order(order_id)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")
    return {"status": "success", "message": "Order accepted successfully", "order": updated}

@router.post("/orders/{order_id}/reject")
@router.put("/orders/{order_id}/reject")
def reject_order(order_id: str = Path(...), payload: Optional[Dict[str, Any]] = Body(None)):
    """Merchant rejects the incoming customer order."""
    reason = payload.get("reason", "Out of stock / Operational constraint") if payload else "Out of stock"
    updated = merchant_service.reject_order(order_id, reason=reason)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")
    return {"status": "success", "message": "Order rejected", "order": updated}

@router.post("/orders/{order_id}/pack")
@router.put("/orders/{order_id}/pack")
def pack_order(order_id: str = Path(...)):
    """Mark order as packed and ready for delivery partner pickup."""
    updated = merchant_service.pack_order(order_id)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")
    return {"status": "success", "message": "Order packed", "order": updated}

@router.post("/orders/{order_id}/ship")
@router.put("/orders/{order_id}/ship")
def ship_order(
    order_id: str = Path(...),
    payload: Optional[Dict[str, Any]] = Body(None)
):
    """Dispatch order with courier partner."""
    courier = payload.get("courier", "Delhivery Express") if payload else "Delhivery Express"
    updated = merchant_service.ship_order(order_id, courier=courier)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")
    return {"status": "success", "message": "Order shipped", "order": updated}

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
    """Get single customer profile details."""
    cust = merchant_service.get_customer_by_id(customer_id)
    if not cust:
        raise HTTPException(status_code=404, detail=f"Customer '{customer_id}' not found")
    return cust
