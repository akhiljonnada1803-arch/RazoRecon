from fastapi import APIRouter, Query, Body, HTTPException
from typing import Optional, List, Dict, Any
from app.services.merchant_service import merchant_service
from app.services.catalog_service import catalog_service

router = APIRouter()

@router.get("/dashboard")
def get_merchant_dashboard():
    """Retrieve high-level merchant KPIs: Gross Revenue, Orders, SKUs, Conversion Rate, Customer Growth %."""
    return merchant_service.get_dashboard_metrics()

@router.get("/orders")
def list_orders(status: Optional[str] = Query("ALL", description="Filter by status: ALL, PENDING, PAID, CANCELLED, REFUNDED")):
    """List merchant orders with line items, customer details, and payment reconciliation status."""
    return merchant_service.get_orders(status=status)

@router.get("/orders/{order_id}")
def get_order(order_id: str):
    """Get single order details by ID or order number."""
    order = merchant_service.get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

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
