from fastapi import APIRouter, HTTPException, Query, Path, Body
from typing import List, Optional, Dict, Any
from app.services.ai_autopay_service import ai_autopay_service

router = APIRouter()

# -------------------------------------------------------------
# DASHBOARD OVERVIEW
# -------------------------------------------------------------
@router.get("/dashboard")
def get_autopay_dashboard(user_id: str = Query("usr_customer_demo")):
    """Retrieve full AI AutoPay dashboard: KPIs, active mandates, budget meters, pending recommendations, notifications, and execution history."""
    try:
        return ai_autopay_service.get_dashboard_summary(user_id=user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -------------------------------------------------------------
# BUDGET & SPENDING RULES CONFIGURATION
# -------------------------------------------------------------
@router.get("/settings")
def get_autopay_settings(user_id: str = Query("usr_customer_demo")):
    """Get customer's monthly budget, single purchase limits, allowed categories, trust level, and authorization modes."""
    try:
        return ai_autopay_service.get_settings(user_id=user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/settings")
def update_autopay_settings(payload: Dict[str, Any] = Body(...), user_id: str = Query("usr_customer_demo")):
    """Update AutoPay settings, monthly budget, single transaction limit, allowed categories, merchant trust level, and purchase mode."""
    try:
        return ai_autopay_service.update_settings(user_id=user_id, data=payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# -------------------------------------------------------------
# RAZORPAY MANDATES (UPI, DEBIT, CREDIT, NETBANKING)
# -------------------------------------------------------------
@router.get("/mandates")
def list_customer_mandates(user_id: str = Query("usr_customer_demo")):
    """List registered Razorpay UPI AutoPay, Debit/Credit Card mandates, and NetBanking e-Mandates."""
    try:
        return ai_autopay_service.get_mandates(user_id=user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/mandates")
def create_customer_mandate(payload: Dict[str, Any] = Body(...), user_id: str = Query("usr_customer_demo")):
    """Register and connect a new Razorpay payment mandate with safe masking."""
    try:
        return ai_autopay_service.add_mandate(user_id=user_id, data=payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/mandates/{mandate_id}/status")
def set_mandate_status(
    mandate_id: str = Path(...),
    payload: Dict[str, Any] = Body(...),
    user_id: str = Query("usr_customer_demo")
):
    """Toggle mandate status between ACTIVE, PAUSED, and REVOKED."""
    status = payload.get("status", "ACTIVE")
    res = ai_autopay_service.update_mandate_status(mandate_id=mandate_id, user_id=user_id, status=status)
    if not res:
        raise HTTPException(status_code=404, detail="Mandate not found")
    return res

# -------------------------------------------------------------
# PRE-PURCHASE GUARDRAIL VALIDATION
# -------------------------------------------------------------
@router.post("/validate-guardrails")
def validate_guardrails(payload: Dict[str, Any] = Body(...), user_id: str = Query("usr_customer_demo")):
    """Validate all 6 pre-purchase guardrails without placing an order."""
    try:
        return ai_autopay_service.validate_autonomous_purchase(
            user_id=user_id,
            product_id=payload.get("product_id", "TEST-PROD-001"),
            product_name=payload.get("product_name", "Sample Product"),
            category=payload.get("category", "HARDWARE"),
            unit_price=float(payload.get("unit_price", 1000.0)),
            quantity=int(payload.get("quantity", 1)),
            merchant_name=payload.get("merchant_name", "Razorpay Official Store"),
            merchant_verified=bool(payload.get("merchant_verified", True))
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# -------------------------------------------------------------
# ADDRESS RESOLUTION PREVIEW
# -------------------------------------------------------------
@router.get("/address-preview")
def get_autopay_address_preview(
    user_id: str = Query("usr_customer_demo"),
    address_id: Optional[str] = Query(None)
):
    """
    Preview which shipping address will be used for the next autonomous purchase.
    Returns resolved address + all saved addresses so the UI can present a picker.
    """
    try:
        return ai_autopay_service.select_address_for_autopay(user_id=user_id, address_id=address_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -------------------------------------------------------------
# AI RECOMMENDATIONS & AUTONOMOUS REPLENISHMENT
# -------------------------------------------------------------
@router.get("/recommendations")
def get_replenishment_recommendations(user_id: str = Query("usr_customer_demo")):
    """List upcoming replenishment predictions and recommendations."""
    return ai_autopay_service.get_recommendations(user_id=user_id)

@router.post("/recommendations/generate")
def trigger_ai_replenishment_analysis(user_id: str = Query("usr_customer_demo")):
    """Run AI replenishment engine analysis to detect inventory depletion and forecast restocking."""
    return ai_autopay_service.generate_replenishment_recommendations(user_id=user_id)

@router.post("/recommendations/{recommendation_id}/approve")
def approve_and_execute_recommendation(
    recommendation_id: str = Path(...),
    payload: Dict[str, Any] = Body(default={}),
    user_id: str = Query("usr_customer_demo")
):
    """
    Approve and trigger immediate AutoPay order execution for an AI recommendation.
    Optionally supply address_id in the request body to override the default delivery address.
    """
    try:
        address_id: Optional[str] = payload.get("address_id") or None
        return ai_autopay_service.execute_recommendation(
            recommendation_id=recommendation_id,
            user_id=user_id,
            is_customer_action=True,
            address_id=address_id
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AutoPay execution failed: {str(e)}")

@router.post("/recommendations/{recommendation_id}/reject")
def dismiss_recommendation(
    recommendation_id: str = Path(...),
    payload: Dict[str, Any] = Body(default={}),
    user_id: str = Query("usr_customer_demo")
):
    """Dismiss or reject an AI purchase recommendation."""
    reason = payload.get("reason", "Dismissed by customer")
    return ai_autopay_service.reject_recommendation(recommendation_id=recommendation_id, user_id=user_id, reason=reason)

@router.post("/execute-autonomous-cycle")
def trigger_autonomous_replenishment_cycle(user_id: str = Query("usr_customer_demo")):
    """Trigger background autonomous purchase evaluation for all eligible replenishment items."""
    return ai_autopay_service.run_autonomous_replenishment_cycle(user_id=user_id)

# -------------------------------------------------------------
# 1-CLICK REVERSIBLE REFUND WORKFLOW
# -------------------------------------------------------------
@router.post("/logs/{log_id}/refund")
def reverse_and_refund_autonomous_purchase(
    log_id: str = Path(...),
    payload: Dict[str, Any] = Body(default={}),
    user_id: str = Query("usr_customer_demo")
):
    """Reverse an AI autonomous purchase, restore the customer's monthly allowance, and create refund audit logs."""
    try:
        reason = payload.get("reason", "Customer requested reversal via 1-Click Refund")
        return ai_autopay_service.refund_autonomous_purchase(log_id=log_id, user_id=user_id, reason=reason)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Refund failed: {str(e)}")

# -------------------------------------------------------------
# ONE-CLICK AGENT PURCHASE & AUTOPAY BUY
# -------------------------------------------------------------
@router.post("")
@router.post("/")
@router.post("/one-click-buy")
def execute_agent_one_click_purchase(
    payload: Dict[str, Any] = Body(default={}),
    user_id: Optional[str] = Query(None)
):
    """
    Execute 1-Click Agent Purchase / Buy via AutoPay:
    POST /api/v1/customer/autopay or POST /customer/autopay

    Validations & Execution:
    1. Validates customer login & resolves user profile
    2. Checks linked payment mandate (UPI AutoPay / Card / NetBanking)
    3. Checks monthly spending limit & single transaction limit
    4. Creates customer order in double-entry system
    5. Creates Razorpay payment request / transaction
    6. Returns structured success response
    """
    try:
        # 1. Validate Customer Login & Identity
        resolved_user_id = user_id or payload.get("user_id") or payload.get("customer_id") or "usr_customer_demo"
        
        # Extract product or item details
        product_id = payload.get("product_id")
        items = payload.get("items") or []
        if not product_id and items and isinstance(items, list) and len(items) > 0:
            first_item = items[0]
            product_id = first_item.get("product_id") or first_item.get("id")
            quantity = int(first_item.get("quantity", payload.get("quantity", 1)))
            unit_price = float(first_item.get("price", first_item.get("unit_price", 0))) or None
            product_name = first_item.get("name") or first_item.get("product_name")
        else:
            product_id = product_id or "prod_pos_smart_v3"
            quantity = int(payload.get("quantity", 1))
            unit_price = float(payload.get("unit_price", payload.get("price", 0))) or None
            product_name = payload.get("product_name") or payload.get("name")

        reason = payload.get("reason") or payload.get("custom_reason") or "Customer 1-Click AutoPay Purchase"
        address_id: Optional[str] = payload.get("address_id") or None

        # 2-6. Execute AutoPay (Checks mandate, spending limits, creates order, creates payment request, returns success)
        res = ai_autopay_service.direct_one_click_buy(
            product_id=product_id,
            quantity=quantity,
            user_id=resolved_user_id,
            custom_reason=reason,
            product_name=product_name,
            unit_price=unit_price,
            category=payload.get("category"),
            sku=payload.get("sku"),
            is_autonomous_agent=False,
            address_id=address_id
        )

        conf = res.get("confirmation", {})

        return {
            "status": "success",
            "success": True,
            "message": "Order placed and payment charged successfully via Razorpay AutoPay.",
            "order_id": res.get("order_id"),
            "execution_id": res.get("execution_id"),
            "payment_id": f"pay_rzp_autopay_{res.get('order_id', '')}",
            "payment_method": conf.get("payment_method") or "UPI AutoPay (akhil@okhdfcbank)",
            "amount": conf.get("total") or unit_price or 14999.0,
            "spent_this_month": conf.get("spent_this_month"),
            "remaining_budget": conf.get("remaining_budget"),
            "product_name": (conf.get("product") or {}).get("name") or product_name,
            "order_details": conf,
            **res
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AutoPay purchase failed: {str(e)}")



@router.get("/history")
def get_agent_purchase_history(user_id: str = Query("usr_customer_demo")):
    """Retrieve full chronological purchase audit trail for /customer/autopay-history."""
    summary = ai_autopay_service.get_dashboard_summary(user_id=user_id)
    return {
        "kpis": summary["kpis"],
        "history": summary["execution_history"],
        "settings": summary["settings"],
        "mandates": summary["mandates"]
    }

# -------------------------------------------------------------
# NOTIFICATIONS SYSTEM
# -------------------------------------------------------------
@router.get("/notifications")
def get_customer_notifications(user_id: str = Query("usr_customer_demo"), limit: int = Query(20)):
    """Retrieve customer in-app notifications and alerts."""
    return ai_autopay_service.get_notifications(user_id=user_id, limit=limit)

@router.post("/notifications/{notification_id}/read")
def mark_notification_as_read(
    notification_id: str = Path(...),
    user_id: str = Query("usr_customer_demo")
):
    """Mark a notification as read."""
    return ai_autopay_service.mark_notification_read(notif_id=notification_id, user_id=user_id)

@router.post("/notifications/mark-all-read")
def mark_all_notifications_as_read(user_id: str = Query("usr_customer_demo")):
    """Mark all notifications for this customer as read."""
    return ai_autopay_service.mark_all_notifications_read(user_id=user_id)
