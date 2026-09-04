from fastapi import APIRouter, Depends, HTTPException
from app.schemas.fraud import (
    FraudCenterResponseDTO,
    UpdateFraudAlertStatusRequestDTO,
)
from app.services.fraud_service import FraudService

router = APIRouter()

@router.get("", response_model=FraudCenterResponseDTO)
async def get_fraud_dashboard(
    service: FraudService = Depends()
):
    """Scan all financial data for Duplicate Payments, Amount Anomalies, Vendor Anomalies & Repeated Settlement Issues."""
    return await service.scan_and_detect()

@router.post("/update-status")
async def update_fraud_alert_status(
    payload: UpdateFraudAlertStatusRequestDTO,
    service: FraudService = Depends()
):
    """Update alert status (e.g. Blocked, Cleared, Under Review)."""
    success = await service.update_status(payload.alert_id, payload.new_status)
    if not success:
        raise HTTPException(status_code=404, detail="Fraud alert not found")
    return {
        "status": "success",
        "alert_id": payload.alert_id,
        "new_status": payload.new_status,
    }
