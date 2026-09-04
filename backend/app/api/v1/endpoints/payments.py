from fastapi import APIRouter, HTTPException, Query, Body, Header, Depends
from typing import List, Optional, Dict, Any
from app.schemas.payments import (
    CreateOrderRequestDTO,
    CreateOrderResponseDTO,
    VerifyPaymentRequestDTO,
    VerifyPaymentResponseDTO,
    OrderDTO,
    PaymentDTO
)
from app.schemas.auth import UserDTO
from app.services.payment_service import payment_service
from app.core.auth_dependency import require_authenticated_customer

router = APIRouter()

@router.post("/create-order", response_model=CreateOrderResponseDTO)
def create_order(
    payload: CreateOrderRequestDTO,
    customer: UserDTO = Depends(require_authenticated_customer)
):
    """
    Create a new Razorpay Order in Test Mode and generate a checkout session.
    Requires verified customer authentication.
    """
    try:
        return payment_service.create_order(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")

@router.post("/verify", response_model=VerifyPaymentResponseDTO)
def verify_payment_signature(payload: VerifyPaymentRequestDTO):
    """
    Verify HMAC SHA256 signature, persist payment, and automatically send transaction to Reconciliation Engine.
    """
    try:
        return payment_service.verify_payment(payload)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment verification failed: {str(e)}")

@router.get("/orders", response_model=List[OrderDTO])
def list_orders(limit: int = Query(50, ge=1, le=100)):
    """
    List all stored orders in SQLite.
    """
    return payment_service.get_all_orders(limit=limit)

@router.get("/list", response_model=List[PaymentDTO])
def list_payments(limit: int = Query(50, ge=1, le=100)):
    """
    List all stored payments with reconciliation status.
    """
    return payment_service.get_all_payments(limit=limit)
