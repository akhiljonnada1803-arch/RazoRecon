from fastapi import APIRouter, HTTPException, Path
from typing import List
from app.services.vendor_risk_service import vendor_risk_service
from app.schemas.vendor_risk import (
    VendorRiskScoreDTO, 
    VendorRiskDashboardDTO,
    MerchantAnalyticsDTO,
    BuyerAnalyticsDTO
)

router = APIRouter()

@router.get("", response_model=VendorRiskDashboardDTO)
@router.get("/risk", response_model=VendorRiskDashboardDTO)
@router.get("/dashboard", response_model=VendorRiskDashboardDTO)
def get_vendor_risk_dashboard():
    """Retrieve full Merchant & Buyer Intelligence dashboard, GMV metrics, buyer LTV, churn prediction, and distribution."""
    return vendor_risk_service.get_vendor_risk_dashboard()

@router.get("/merchant-intelligence", response_model=MerchantAnalyticsDTO)
def get_merchant_intelligence():
    """Retrieve merchant analytics: revenue, fulfillment score, inventory health, top products, and conversion metrics."""
    return vendor_risk_service.get_merchant_intelligence()

@router.get("/buyer-intelligence", response_model=BuyerAnalyticsDTO)
def get_buyer_intelligence():
    """Retrieve buyer analytics: lifetime value, order history, churn prediction, buying patterns, and AI recommendations."""
    return vendor_risk_service.get_buyer_intelligence()

@router.get("/risk/{vendor_id}", response_model=VendorRiskScoreDTO)
def get_single_vendor_risk(vendor_id: str = Path(..., description="Vendor ID or Vendor Name")):
    """Score a specific entity based on historical behavior and 4-factor risk breakdown."""
    score = vendor_risk_service.get_vendor_risk(vendor_id)
    if not score:
        raise HTTPException(status_code=404, detail=f"Entity '{vendor_id}' not found in intelligence index.")
    return score
