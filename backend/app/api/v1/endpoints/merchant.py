from fastapi import APIRouter, Query, Body, HTTPException, Path
from typing import Optional, List, Dict, Any
from app.services.merchant_service import merchant_service

router = APIRouter()

@router.get("/dashboard")
def get_merchant_dashboard():
    """Retrieve high-level merchant KPIs: Gross Revenue, Orders, SKUs, Conversion Rate, Customer Growth %."""
    return merchant_service.get_dashboard_metrics()

@router.get("/delivery-partners")
def list_delivery_partners():
    """List 5 realistic demo courier partners (Delhivery, BlueDart, XpressBees, Ekart, Shadowfax) with telemetry."""
    return merchant_service.get_delivery_partners()

@router.get("/shipments")
def list_shipments():
    """List active logistics dispatches and pickup queue across courier fleet."""
    return merchant_service.get_shipments()

@router.get("/orders")
def list_orders(
    status: Optional[str] = Query("ALL", description="Filter by status: ALL, PAYMENT_RECEIVED, ACCEPTED, PICKING, PACKED, READY_FOR_PICKUP, PICKED_UP_BY_COURIER, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, RETURNED, REFUNDED, REJECTED"),
    search: Optional[str] = Query(None, description="Search by order number, customer, email, AWB or tracking ID")
):
    """List merchant orders with line items, customer details, and 11-stage status workflow."""
    return merchant_service.get_orders(status=status, search=search)

@router.get("/orders/{order_id}")
def get_order(order_id: str):
    """Get single order details by ID, order number, tracking ID, or AWB."""
    order = merchant_service.get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")
    return order

# -------------------------------------------------------------
# MERCHANT ACTIONS
# -------------------------------------------------------------

@router.post("/orders/{order_id}/accept")
@router.put("/orders/{order_id}/accept")
def accept_order(order_id: str = Path(...)):
    """Merchant accepts incoming order: PAYMENT_RECEIVED -> ACCEPTED."""
    updated = merchant_service.accept_order(order_id)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")
    return {"status": "success", "message": "Order accepted successfully", "order": updated}

@router.post("/orders/{order_id}/start-picking")
@router.put("/orders/{order_id}/start-picking")
def start_picking_order(order_id: str = Path(...)):
    """Merchant warehouse initiates picking: ACCEPTED -> PICKING."""
    updated = merchant_service.start_picking(order_id)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")
    return {"status": "success", "message": "Warehouse picking initiated", "order": updated}

@router.post("/orders/{order_id}/pack")
@router.put("/orders/{order_id}/pack")
def pack_order(order_id: str = Path(...)):
    """Merchant marks order packed: PICKING -> PACKED."""
    updated = merchant_service.pack_order(order_id)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")
    return {"status": "success", "message": "Order packed and barcoded", "order": updated}

@router.post("/orders/{order_id}/ready-for-pickup")
@router.put("/orders/{order_id}/ready-for-pickup")
def mark_ready_for_pickup_order(order_id: str = Path(...)):
    """Merchant stages package in dispatch dock: PACKED -> READY_FOR_PICKUP."""
    updated = merchant_service.mark_ready_for_pickup(order_id)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")
    return {"status": "success", "message": "Order placed in outbound bay, ready for courier pickup", "order": updated}

@router.post("/orders/{order_id}/reject")
@router.put("/orders/{order_id}/reject")
def reject_order(order_id: str = Path(...), payload: Optional[Dict[str, Any]] = Body(None)):
    """Merchant rejects order and initiates automatic customer refund."""
    reason = payload.get("reason", "Out of stock / Operational constraint") if payload else "Out of stock"
    updated = merchant_service.reject_order(order_id, reason=reason)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")
    return {"status": "success", "message": "Order rejected and refund initiated", "order": updated}

# -------------------------------------------------------------
# COURIER ACTIONS (SIMULATED)
# -------------------------------------------------------------

@router.post("/orders/{order_id}/courier-pickup")
@router.put("/orders/{order_id}/courier-pickup")
@router.post("/orders/{order_id}/courier")
@router.put("/orders/{order_id}/courier")
@router.post("/orders/{order_id}/assign-courier")
@router.put("/orders/{order_id}/assign-courier")
def courier_pickup_endpoint(
    order_id: str = Path(..., description="Order ID or Order Number"),
    courier_name: Optional[str] = Query(None, description="Courier partner: Delhivery Express, BlueDart Express, XpressBees Logistics, Ekart Logistics, Shadowfax Express"),
    courier: Optional[str] = Query(None, description="Alias for courier_name"),
    payload: Optional[Dict[str, Any]] = Body(None)
):
    """
    Courier scans and accepts package at dispatch dock:
    READY_FOR_PICKUP -> PICKED_UP_BY_COURIER.
    GENERATES live AWB Number and Tracking ID strictly upon pickup!
    """
    selected_courier = courier_name or courier
    if payload:
        if not selected_courier and "courier_name" in payload:
            selected_courier = payload["courier_name"]
        if not selected_courier and "courier" in payload:
            selected_courier = payload["courier"]

    if not selected_courier:
        selected_courier = "Delhivery Express"

    updated = merchant_service.courier_pickup(order_id, courier_name=selected_courier)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")
    return {
        "status": "success",
        "message": f"Package picked up by {selected_courier}. AWB {updated.get('awb_number')} & Tracking ID {updated.get('tracking_id')} generated.",
        "order": updated
    }

@router.post("/orders/{order_id}/in-transit")
@router.put("/orders/{order_id}/in-transit")
@router.post("/orders/{order_id}/update-location")
@router.put("/orders/{order_id}/update-location")
def update_shipment_location_endpoint(
    order_id: str = Path(...),
    location: Optional[str] = Query(None, description="Transshipment hub / sorting location"),
    payload: Optional[Dict[str, Any]] = Body(None)
):
    """Courier updates in-transit sorting location: PICKED_UP_BY_COURIER -> IN_TRANSIT."""
    loc = location
    if payload and not loc and "location" in payload:
        loc = payload["location"]
    if not loc:
        loc = "Regional Transshipment Air Hub"

    updated = merchant_service.update_shipment_location(order_id, location=loc)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")
    return {"status": "success", "message": f"Location checkpoint updated: {loc}", "order": updated}

@router.post("/orders/{order_id}/out-for-delivery")
@router.put("/orders/{order_id}/out-for-delivery")
def mark_out_for_delivery_endpoint(
    order_id: str = Path(...),
    notes: Optional[str] = Query(None),
    payload: Optional[Dict[str, Any]] = Body(None)
):
    """Courier rider departs local station for doorstep delivery: IN_TRANSIT -> OUT_FOR_DELIVERY."""
    rider_notes = notes
    if payload and not rider_notes and "notes" in payload:
        rider_notes = payload["notes"]

    updated = merchant_service.mark_out_for_delivery(order_id, agent_notes=rider_notes)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")
    return {"status": "success", "message": "Order marked Out for Delivery with local rider", "order": updated}

@router.post("/orders/{order_id}/deliver")
@router.put("/orders/{order_id}/deliver")
def mark_delivered_endpoint(order_id: str = Path(...)):
    """Courier records successful doorstep delivery: OUT_FOR_DELIVERY -> DELIVERED."""
    updated = merchant_service.mark_delivered(order_id)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")
    return {"status": "success", "message": "Order successfully delivered and signed", "order": updated}

@router.post("/orders/{order_id}/return")
@router.put("/orders/{order_id}/return")
def mark_returned_endpoint(
    order_id: str = Path(...),
    reason: Optional[str] = Query("Customer Return / Exchange"),
    payload: Optional[Dict[str, Any]] = Body(None)
):
    """Process return shipment for order: DELIVERED -> RETURNED."""
    ret_reason = reason
    if payload and "reason" in payload:
        ret_reason = payload["reason"]

    updated = merchant_service.mark_returned(order_id, reason=ret_reason)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")
    return {"status": "success", "message": f"Return processed: {ret_reason}", "order": updated}

@router.post("/orders/{order_id}/refund")
@router.put("/orders/{order_id}/refund")
def mark_refunded_endpoint(order_id: str = Path(...)):
    """Process customer refund settlement: RETURNED/REJECTED -> REFUNDED."""
    updated = merchant_service.mark_refunded(order_id)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")
    return {"status": "success", "message": "Refund processed to original payment source", "order": updated}

# -------------------------------------------------------------
# UNIVERSAL STATUS UPDATE ROUTES
# -------------------------------------------------------------

@router.put("/orders/{order_id}/status")
@router.patch("/orders/{order_id}/status")
@router.post("/orders/{order_id}/status")
@router.put("/orders/{order_id}/update-status")
@router.patch("/orders/{order_id}/update-status")
@router.post("/orders/{order_id}/update-status")
def update_order_status_endpoint(
    order_id: str = Path(..., description="Order ID or Order Number"),
    status: Optional[str] = Query(None, description="Target status in 11-stage pipeline"),
    notes: Optional[str] = Query(None, description="Optional checkpoint location or notes"),
    payload: Optional[Dict[str, Any]] = Body(None)
):
    """Universal router dispatching to any stage in the 11-stage e-commerce logistics lifecycle."""
    target_status = status
    target_notes = notes

    if payload:
        if not target_status and "status" in payload:
            target_status = payload["status"]
        if not target_notes and "notes" in payload:
            target_notes = payload["notes"]

    if not target_status:
        target_status = "PICKING"

    updated = merchant_service.update_order_status(order_id, new_status=target_status, notes=target_notes)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")
    return {"status": "success", "message": f"Status updated to {target_status}", "order": updated}

# -------------------------------------------------------------
# CUSTOMER RETRIEVAL
# -------------------------------------------------------------

@router.get("/customers")
def list_customers():
    """List 100 enterprise and retail commerce customers with buying affinity and LTV."""
    return merchant_service.get_customers()

@router.get("/customers/{customer_id}")
def get_customer(customer_id: str):
    """Get rich customer profile with order history and buying habits."""
    customer = merchant_service.get_customer_by_id(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail=f"Customer '{customer_id}' not found")
    return customer
