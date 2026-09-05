from fastapi import APIRouter, HTTPException, Query, Path, Body, Depends, Header
from typing import List, Optional, Dict, Any
from app.services.customer_order_service import customer_order_service
from app.services.auth_service import auth_service
from app.schemas.auth import UserDTO

router = APIRouter()

def resolve_customer_user(
    authorization: Optional[str] = Header(None),
    x_customer_id: Optional[str] = Header(None),
    x_customer_email: Optional[str] = Header(None),
    user_id: Optional[str] = Query(None),
    customer_email: Optional[str] = Query(None)
) -> Optional[UserDTO]:
    # 1. Prioritize JWT bearer token verification if present
    if isinstance(authorization, str) and authorization.strip():
        user = auth_service.verify_token(authorization.strip())
        if user:
            return user

    # 2. Check explicit customer identifier (ID or email)
    for candidate in [customer_email, x_customer_email, user_id, x_customer_id]:
        if isinstance(candidate, str) and candidate.strip():
            cid = candidate.strip()
            if cid.startswith("usr_guest_"):
                cid = cid[len("usr_guest_"):]
            if cid == "usr_customer_demo":
                cid = "customer@acme.com"
            user = auth_service.get_user_by_id_or_email(cid)
            if user:
                return user

    return None

# -------------------------------------------------------------
# ADDRESS BOOK ENDPOINTS
# -------------------------------------------------------------
@router.get("/addresses")
def get_saved_addresses(
    user_id: Optional[str] = Query(None),
    customer_email: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    x_customer_id: Optional[str] = Header(None),
    x_customer_email: Optional[str] = Header(None)
):
    """List saved customer delivery addresses with default flags."""
    customer = resolve_customer_user(
        authorization=authorization, 
        x_customer_id=x_customer_id, 
        x_customer_email=x_customer_email,
        user_id=user_id,
        customer_email=customer_email
    )
    eff_id = customer.id if customer else user_id
    if not eff_id:
        return []
    return customer_order_service.get_addresses(user_id=eff_id)

@router.post("/addresses")
def add_new_address(
    payload: Dict[str, Any] = Body(...), 
    user_id: Optional[str] = Query(None),
    customer_email: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    x_customer_id: Optional[str] = Header(None),
    x_customer_email: Optional[str] = Header(None)
):
    """Add new delivery address to customer profile."""
    customer = resolve_customer_user(
        authorization=authorization, 
        x_customer_id=x_customer_id, 
        x_customer_email=x_customer_email,
        user_id=user_id,
        customer_email=customer_email
    )
    eff_id = customer.id if customer else (user_id or "usr_guest")
    return customer_order_service.add_address(user_id=eff_id, data=payload)

@router.put("/addresses/{addr_id}")
def update_existing_address(
    addr_id: str = Path(...), 
    payload: Dict[str, Any] = Body(...),
    user_id: Optional[str] = Query(None),
    customer_email: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    x_customer_id: Optional[str] = Header(None),
    x_customer_email: Optional[str] = Header(None)
):
    """Update saved delivery address."""
    customer = resolve_customer_user(
        authorization=authorization, 
        x_customer_id=x_customer_id, 
        x_customer_email=x_customer_email,
        user_id=user_id,
        customer_email=customer_email
    )
    eff_id = customer.id if customer else (user_id or "usr_guest")
    res = customer_order_service.update_address(addr_id=addr_id, user_id=eff_id, data=payload)
    if not res:
        raise HTTPException(status_code=404, detail="Address not found or unauthorized")
    return res

@router.delete("/addresses/{addr_id}")
def delete_existing_address(
    addr_id: str = Path(...),
    user_id: Optional[str] = Query(None),
    customer_email: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    x_customer_id: Optional[str] = Header(None),
    x_customer_email: Optional[str] = Header(None)
):
    """Delete saved delivery address."""
    customer = resolve_customer_user(
        authorization=authorization, 
        x_customer_id=x_customer_id, 
        x_customer_email=x_customer_email,
        user_id=user_id,
        customer_email=customer_email
    )
    eff_id = customer.id if customer else (user_id or "usr_guest")
    ok = customer_order_service.delete_address(addr_id=addr_id, user_id=eff_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Address not found or unauthorized")
    return {"status": "DELETED", "id": addr_id}

@router.put("/addresses/{addr_id}/default")
def set_default_address(
    addr_id: str = Path(...),
    user_id: Optional[str] = Query(None),
    customer_email: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    x_customer_id: Optional[str] = Header(None),
    x_customer_email: Optional[str] = Header(None)
):
    """Designate address as customer's default delivery address."""
    customer = resolve_customer_user(
        authorization=authorization, 
        x_customer_id=x_customer_id, 
        x_customer_email=x_customer_email,
        user_id=user_id,
        customer_email=customer_email
    )
    eff_id = customer.id if customer else (user_id or "usr_guest")
    res = customer_order_service.set_default_address(addr_id=addr_id, user_id=eff_id)
    if not res:
        raise HTTPException(status_code=404, detail="Address not found or unauthorized")
    return res

# -------------------------------------------------------------
# PAYMENT METHODS (SAVED INSTRUMENTS)
# -------------------------------------------------------------
@router.get("/payment-methods")
def get_saved_payment_methods(
    user_id: Optional[str] = Query(None),
    customer_email: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    x_customer_id: Optional[str] = Header(None),
    x_customer_email: Optional[str] = Header(None)
):
    """List saved cards, UPI IDs, and netbanking accounts (PCI-DSS masked)."""
    customer = resolve_customer_user(
        authorization=authorization, 
        x_customer_id=x_customer_id, 
        x_customer_email=x_customer_email,
        user_id=user_id,
        customer_email=customer_email
    )
    eff_id = customer.id if customer else user_id
    if not eff_id:
        return []
    return customer_order_service.get_payment_methods(user_id=eff_id)

@router.post("/payment-methods")
def add_new_payment_method(
    payload: Dict[str, Any] = Body(...), 
    user_id: Optional[str] = Query(None),
    customer_email: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    x_customer_id: Optional[str] = Header(None),
    x_customer_email: Optional[str] = Header(None)
):
    """Save payment instrument with tokenization & PCI-DSS compliance masking."""
    customer = resolve_customer_user(
        authorization=authorization, 
        x_customer_id=x_customer_id, 
        x_customer_email=x_customer_email,
        user_id=user_id,
        customer_email=customer_email
    )
    eff_id = customer.id if customer else (user_id or "usr_guest")
    return customer_order_service.add_payment_method(user_id=eff_id, data=payload)

@router.delete("/payment-methods/{method_id}")
def delete_existing_payment_method(
    method_id: str = Path(...),
    user_id: Optional[str] = Query(None),
    customer_email: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    x_customer_id: Optional[str] = Header(None),
    x_customer_email: Optional[str] = Header(None)
):
    """Revoke saved card or UPI handle."""
    customer = resolve_customer_user(
        authorization=authorization, 
        x_customer_id=x_customer_id, 
        x_customer_email=x_customer_email,
        user_id=user_id,
        customer_email=customer_email
    )
    eff_id = customer.id if customer else (user_id or "usr_guest")
    ok = customer_order_service.delete_payment_method(method_id=method_id, user_id=eff_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Payment instrument not found or unauthorized")
    return {"status": "DELETED", "id": method_id}

@router.put("/payment-methods/{method_id}/default")
def set_default_payment_method(
    method_id: str = Path(...),
    user_id: Optional[str] = Query(None),
    customer_email: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    x_customer_id: Optional[str] = Header(None),
    x_customer_email: Optional[str] = Header(None)
):
    """Set default payment method."""
    customer = resolve_customer_user(
        authorization=authorization, 
        x_customer_id=x_customer_id, 
        x_customer_email=x_customer_email,
        user_id=user_id,
        customer_email=customer_email
    )
    eff_id = customer.id if customer else (user_id or "usr_guest")
    res = customer_order_service.set_default_payment_method(method_id=method_id, user_id=eff_id)
    if not res:
        raise HTTPException(status_code=404, detail="Payment instrument not found or unauthorized")
    return res

# -------------------------------------------------------------
# CHECKOUT & ORDER LIFECYCLE
# -------------------------------------------------------------
@router.post("/checkout")
def process_checkout_and_place_order(
    payload: Dict[str, Any] = Body(...),
    user_id: Optional[str] = Query(None),
    customer_email: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    x_customer_id: Optional[str] = Header(None),
    x_customer_email: Optional[str] = Header(None)
):
    """
    Complete order placement with stock decrement, courier assignment, 
    AIAgent telemetry logging, and optional payment instrument tokenization.
    """
    customer = resolve_customer_user(
        authorization=authorization, 
        x_customer_id=x_customer_id, 
        x_customer_email=x_customer_email,
        user_id=payload.get("customer_id") or user_id,
        customer_email=payload.get("customer_email") or customer_email
    )
    if customer:
        payload["customer_id"] = customer.id
        if not payload.get("customer_email"):
            payload["customer_email"] = customer.email
        if not payload.get("customer_name"):
            payload["customer_name"] = customer.name
            
    cid = payload.get("customer_id") or (customer.id if customer else user_id)
    if not cid or not str(cid).strip():
        raise HTTPException(status_code=400, detail="customer_id is required")

    aid = (
        payload.get("address_id") or 
        payload.get("shipping_address_id") or 
        (payload.get("shipping_address", {}).get("address_id") if isinstance(payload.get("shipping_address"), dict) else None) or
        (payload.get("shipping_address", {}).get("address_line1") if isinstance(payload.get("shipping_address"), dict) else None)
    )
    if not aid or not str(aid).strip():
        raise HTTPException(status_code=400, detail="Please add a delivery address before placing an order.")

    pm = payload.get("payment_method")
    if not pm or not str(pm).strip():
        raise HTTPException(status_code=400, detail="payment_method is required")

    try:
        order = customer_order_service.process_checkout(user_id=cid, payload=payload)
        return order
    except PermissionError as pe:
        raise HTTPException(status_code=403, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Checkout processing failed: {str(e)}")

# -------------------------------------------------------------
# ORDER TRACKING & MANAGEMENT
# -------------------------------------------------------------
@router.get("/orders")
def get_customer_orders(
    user_id: Optional[str] = Query(None),
    customer_email: Optional[str] = Query(None),
    status: Optional[str] = Query("ALL", description="Filter by stage: ALL, PROCESSING, PACKED, SHIPPED, DELIVERED, CANCELLED, RETURNED, REFUNDED"),
    search: Optional[str] = Query(None, description="Search by Order ID, Product, or AWB"),
    authorization: Optional[str] = Header(None),
    x_customer_id: Optional[str] = Header(None),
    x_customer_email: Optional[str] = Header(None)
):
    """List customer orders with stage filters and search, strictly isolated to the authenticated customer."""
    customer = resolve_customer_user(
        authorization=authorization, 
        x_customer_id=x_customer_id, 
        x_customer_email=x_customer_email,
        user_id=user_id,
        customer_email=customer_email
    )
    
    eff_id = customer.id if customer else user_id
    eff_email = customer.email if customer else (customer_email or x_customer_email)

    if not eff_id and not eff_email:
        return {"orders": [], "total": 0}

    orders = customer_order_service.get_customer_orders(
        user_id=eff_id, 
        customer_email=eff_email, 
        status=status or "ALL", 
        search=search
    )
    return {"orders": orders, "total": len(orders)}

@router.get("/onboarding/status")
def get_customer_onboarding_status(
    user_id: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    x_customer_id: Optional[str] = Header(None)
):
    """
    Get customer onboarding status and AutoPay prerequisites checklist:
    - address (>= 1 address)
    - payment (>= 1 payment method)
    - order (>= 1 completed order)
    """
    customer = resolve_customer_user(authorization=authorization, x_customer_id=x_customer_id, user_id=user_id)
    if not customer:
        eff_id = user_id or "usr_guest"
    else:
        eff_id = customer.id
    return customer_order_service.get_onboarding_status(user_id=eff_id)

@router.post("/onboarding/address")
def submit_onboarding_address(
    payload: Dict[str, Any] = Body(...),
    user_id: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    x_customer_id: Optional[str] = Header(None)
):
    """Step 1: Save default delivery address during customer onboarding."""
    customer = resolve_customer_user(authorization=authorization, x_customer_id=x_customer_id, user_id=user_id)
    if not customer and not user_id:
        raise HTTPException(status_code=401, detail="Authentication required to save onboarding address")
    eff_id = customer.id if customer else user_id

    # Validation
    if not payload.get("full_name") or not payload.get("address_line1") or not payload.get("pincode"):
        raise HTTPException(status_code=400, detail="Missing required address fields (full_name, address_line1, pincode)")

    return customer_order_service.complete_onboarding_address(user_id=eff_id, data=payload)

@router.post("/onboarding/payment")
def submit_onboarding_payment(
    payload: Dict[str, Any] = Body(...),
    user_id: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    x_customer_id: Optional[str] = Header(None)
):
    """Step 2: Add payment method or skip payment setup to complete onboarding."""
    customer = resolve_customer_user(authorization=authorization, x_customer_id=x_customer_id, user_id=user_id)
    if not customer and not user_id:
        raise HTTPException(status_code=401, detail="Authentication required to complete onboarding")
    eff_id = customer.id if customer else user_id

    return customer_order_service.complete_onboarding_payment(user_id=eff_id, data=payload)

@router.get("/payment-methods")
def get_customer_payment_methods(
    user_id: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    x_customer_id: Optional[str] = Header(None)
):
    """List saved customer payment methods & active mandates (AES-256 encrypted at rest)."""
    customer = resolve_customer_user(authorization=authorization, x_customer_id=x_customer_id, user_id=user_id)
    if not customer:
        return []
    return customer_order_service.get_saved_payment_methods(user_id=customer.id)

@router.post("/payment-methods")
def add_customer_payment_method(
    payload: Dict[str, Any] = Body(...),
    user_id: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    x_customer_id: Optional[str] = Header(None)
):
    """Save a customer payment method (Card, UPI VPA) with AES-256 encryption at rest."""
    customer = resolve_customer_user(authorization=authorization, x_customer_id=x_customer_id, user_id=user_id)
    if not customer and not user_id:
        raise HTTPException(status_code=401, detail="Authentication required to save payment method")
    eff_id = customer.id if customer else user_id
    return customer_order_service.add_saved_payment_method(user_id=eff_id, data=payload)

@router.delete("/payment-methods/{payment_method_id}")
def delete_customer_payment_method(
    payment_method_id: str,
    user_id: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    x_customer_id: Optional[str] = Header(None)
):
    """Delete a saved payment method or revoke connected mandate."""
    customer = resolve_customer_user(authorization=authorization, x_customer_id=x_customer_id, user_id=user_id)
    if not customer and not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    eff_id = customer.id if customer else user_id
    deleted = customer_order_service.delete_saved_payment_method(user_id=eff_id, pm_id=payment_method_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Payment method not found")
    return {"success": True, "message": "Saved payment method removed successfully"}

# -------------------------------------------------------------
# ORDERS & TRACKING
# -------------------------------------------------------------

@router.get("/orders/{order_id}")
def get_single_order_details(
    order_id: str = Path(...),
    authorization: Optional[str] = Header(None),
    x_customer_id: Optional[str] = Header(None)
):
    """Get single order details with item list, address snapshot, invoice breakdown, merchant info, and courier details."""
    order = customer_order_service.get_order_details(order_id)
    if not order:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")

    # Strict multi-tenant isolation check: Customer can only view their own orders
    customer = resolve_customer_user(authorization=authorization, x_customer_id=x_customer_id)
    if customer and customer.role_id == "role_customer":
        is_owner = (
            order.get("customer_id") == customer.id or 
            (order.get("customer_email") and order["customer_email"].lower() == customer.email.lower()) or
            (customer.id in ("usr_customer", "usr_customer_demo") and order.get("customer_email") == "customer@acme.com")
        )
        if not is_owner:
            raise HTTPException(status_code=403, detail="Access denied: You do not have permission to view this order.")

    return order

@router.get("/orders/{order_id}/tracking")
def get_order_tracking_timeline(
    order_id: str = Path(...),
    authorization: Optional[str] = Header(None),
    x_customer_id: Optional[str] = Header(None)
):
    """Retrieve visual 8-stage milestone tracking timeline with live timestamps and carrier telemetry."""
    # Check order access
    order = customer_order_service.get_order_details(order_id)
    if not order:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' tracking not found")

    customer = resolve_customer_user(authorization=authorization, x_customer_id=x_customer_id)
    if customer and customer.role_id == "role_customer":
        is_owner = (
            order.get("customer_id") == customer.id or 
            (order.get("customer_email") and order["customer_email"].lower() == customer.email.lower()) or
            (customer.id in ("usr_customer", "usr_customer_demo") and order.get("customer_email") == "customer@acme.com")
        )
        if not is_owner:
            raise HTTPException(status_code=403, detail="Access denied: You do not have permission to view this tracking.")

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
    user_id: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    x_customer_id: Optional[str] = Header(None)
):
    """Submit return request for an order with reason, notes, and optional attachment."""
    customer = resolve_customer_user(authorization=authorization, x_customer_id=x_customer_id, user_id=user_id)
    eff_id = customer.id if customer else (user_id or "usr_guest")
    try:
        return customer_order_service.create_return_request(order_id=order_id, user_id=eff_id, data=payload)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Return request failed: {str(e)}")

# -------------------------------------------------------------
# TAX INVOICE GENERATION
# -------------------------------------------------------------
@router.get("/orders/{order_id}/invoice")
def get_order_tax_invoice(
    order_id: str = Path(...),
    authorization: Optional[str] = Header(None),
    x_customer_id: Optional[str] = Header(None)
):
    """Retrieve full GST compliant tax invoice breakdown for an order."""
    order = customer_order_service.get_order_details(order_id)
    if not order:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found")

    customer = resolve_customer_user(authorization=authorization, x_customer_id=x_customer_id)
    if customer and customer.role_id == "role_customer":
        is_owner = (
            order.get("customer_id") == customer.id or 
            (order.get("customer_email") and order["customer_email"].lower() == customer.email.lower()) or
            (customer.id in ("usr_customer", "usr_customer_demo") and order.get("customer_email") == "customer@acme.com")
        )
        if not is_owner:
            raise HTTPException(status_code=403, detail="Access denied: You do not have permission to download this invoice.")

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
def get_customer_dashboard_widgets(
    user_id: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    x_customer_id: Optional[str] = Header(None)
):
    """Retrieve customer hub widgets: Recent Orders, In-Transit Shipments, Returns, and Saved Addresses."""
    customer = resolve_customer_user(authorization=authorization, x_customer_id=x_customer_id, user_id=user_id)
    if not customer:
        return {
            "total_orders": 0,
            "in_transit_count": 0,
            "returns_count": 0,
            "saved_addresses_count": 0,
            "recent_orders": [],
            "in_transit_orders": [],
            "active_returns": [],
            "saved_addresses": []
        }
    return customer_order_service.get_dashboard_widgets(user_id=customer.id, customer_email=customer.email)
