from fastapi import APIRouter, Depends, Body
from typing import Optional
from app.schemas.reconciliation import (
    ReconciliationResponseDTO,
    RazorpayReconciliationRequestDTO,
    RazorpayReconciliationResponseDTO,
    CommerceTransactionResponseDTO
)
from app.services.reconciliation_service import reconciliation_service

router = APIRouter()

@router.get("", response_model=ReconciliationResponseDTO)
async def get_reconciliation():
    """Retrieve full deterministic commerce transaction and deposit reconciliation."""
    return await reconciliation_service.reconcile_all()

@router.get("/commerce-transactions", response_model=CommerceTransactionResponseDTO)
@router.get("/transactions", response_model=CommerceTransactionResponseDTO)
@router.get("/orders-engine", response_model=CommerceTransactionResponseDTO)
async def get_commerce_transactions():
    """Retrieve full 7-stage Commerce Transaction Engine data with payments, refunds, deliveries, and agent orders."""
    return await reconciliation_service.get_commerce_engine_data()

@router.post("/run-razorpay", response_model=RazorpayReconciliationResponseDTO)
async def run_razorpay_reconciliation(
    payload: Optional[RazorpayReconciliationRequestDTO] = Body(default=None)
):
    """
    Connect imported Razorpay payments to the commerce transaction engine.
    """
    return await reconciliation_service.run_razorpay_reconciliation(payload)
