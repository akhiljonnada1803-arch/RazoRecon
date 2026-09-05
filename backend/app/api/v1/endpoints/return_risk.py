from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Body

from app.schemas.return_risk import (
    ReturnRiskEvaluationRequest,
    ReturnRiskEvaluationDTO,
    ReturnRiskAnalyticsDTO
)
from app.services.return_risk_service import return_risk_service

router = APIRouter()

@router.post("/evaluate", response_model=ReturnRiskEvaluationDTO)
def evaluate_order_return_risk(payload: ReturnRiskEvaluationRequest):
    """Predict pre-purchase return & RTO risk with explainable factors and auto-mitigations."""
    return return_risk_service.evaluate_return_risk(payload)

@router.get("/product/{product_id}", response_model=ReturnRiskEvaluationDTO)
def evaluate_product_default_return_risk(
    product_id: str,
    payment_method: str = Query("razorpay_autopay", description="cod, razorpay_autopay, razorpay_card"),
    has_installation: bool = Query(False, description="Whether installation service is attached")
):
    """Product-level return risk profile with customizable payment method and installation options."""
    req = ReturnRiskEvaluationRequest(
        product_id=product_id,
        price=10000.0,
        payment_method=payment_method,
        has_installation_service=has_installation
    )
    return return_risk_service.evaluate_return_risk(req)

@router.get("/analytics", response_model=ReturnRiskAnalyticsDTO)
def get_return_risk_analytics():
    """Merchant/Admin analytics on return rates, RTO reduction, and prevented loss."""
    return return_risk_service.get_return_risk_analytics()
