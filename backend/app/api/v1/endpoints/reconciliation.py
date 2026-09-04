from fastapi import APIRouter, Depends, Body
from typing import Optional
from app.schemas.reconciliation import (
    ReconciliationResponseDTO,
    RazorpayReconciliationRequestDTO,
    RazorpayReconciliationResponseDTO
)
from app.services.reconciliation_service import reconciliation_service

router = APIRouter()

@router.get("", response_model=ReconciliationResponseDTO)
async def get_reconciliation():
    """Retrieve full deterministic deposit-to-payout reconciliation."""
    return await reconciliation_service.reconcile_all()

@router.post("/run-razorpay", response_model=RazorpayReconciliationResponseDTO)
async def run_razorpay_reconciliation(
    payload: Optional[RazorpayReconciliationRequestDTO] = Body(default=None)
):
    """
    Connect imported Razorpay payments to the reconciliation engine.
    
    Workflow:
    Razorpay Payments ➔ Normalize Data ➔ Reconciliation Engine ➔ Exception Detection ➔ Memory Engine ➔ Vendor Risk Intelligence
    """
    return await reconciliation_service.run_razorpay_reconciliation(payload)
