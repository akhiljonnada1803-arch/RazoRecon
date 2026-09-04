from fastapi import APIRouter, HTTPException, Path
from typing import List
from app.services.vendor_risk_service import vendor_risk_service
from app.schemas.vendor_risk import VendorRiskScoreDTO, VendorRiskDashboardDTO

router = APIRouter()

@router.get("/risk", response_model=VendorRiskDashboardDTO)
def get_vendor_risk_dashboard():
    """Retrieve full vendor risk intelligence dashboard, distribution, trends, and alerts."""
    return vendor_risk_service.get_vendor_risk_dashboard()

@router.get("/risk/{vendor_id}", response_model=VendorRiskScoreDTO)
def get_single_vendor_risk(vendor_id: str = Path(..., description="Vendor ID or Vendor Name")):
    """Score a specific vendor based on historical behavior and 4-factor risk breakdown."""
    score = vendor_risk_service.get_vendor_risk(vendor_id)
    if not score:
        raise HTTPException(status_code=404, detail=f"Vendor '{vendor_id}' not found in risk intelligence index.")
    return score
