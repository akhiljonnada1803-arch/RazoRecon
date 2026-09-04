from fastapi import APIRouter, HTTPException, Path
from typing import List
from app.services.memory_engine import memory_engine
from app.schemas.memory import (
    VendorBehavioralProfileDTO,
    VendorListResponseDTO,
    MemoryUpdateRequestDTO,
    ExceptionMemoryDTO,
    MemoryEventLogDTO,
    RecordExceptionRequestDTO
)

router = APIRouter()

@router.get("/vendors", response_model=VendorListResponseDTO)
def get_all_vendor_profiles():
    """Retrieve all vendor behavioral profiles, memory telemetry, and latest recalculation events."""
    return memory_engine.get_all_vendors()

@router.get("/vendor/{vendor_id}", response_model=VendorBehavioralProfileDTO)
def get_vendor_profile(vendor_id: str = Path(..., description="Vendor ID or Vendor Name substring")):
    """Retrieve historical behavioral profile, risk trend, and exception patterns for a specific vendor."""
    profile = memory_engine.get_vendor_profile(vendor_id)
    if not profile:
        raise HTTPException(status_code=404, detail=f"No historical memory profile found for vendor '{vendor_id}'")
    return profile

@router.get("/exceptions/{vendor_id}", response_model=List[ExceptionMemoryDTO])
def get_vendor_exceptions(vendor_id: str = Path(..., description="Vendor ID")):
    """Retrieve previous exception history and stored resolutions for this vendor."""
    profile = memory_engine.get_vendor_profile(vendor_id)
    if not profile:
        raise HTTPException(status_code=404, detail=f"Vendor '{vendor_id}' not found in memory engine")
    return profile.recent_exceptions

@router.get("/events", response_model=List[MemoryEventLogDTO])
def get_memory_events():
    """Retrieve the continuous memory & risk recalculation event audit stream."""
    return memory_engine.get_recent_event_logs(limit=25)

@router.post("/update", response_model=VendorBehavioralProfileDTO)
def update_vendor_memory(payload: MemoryUpdateRequestDTO):
    """Record a new transaction or exception resolution into vendor memory."""
    profile = memory_engine.update_memory(
        vendor_id=payload.vendor_id,
        vendor_name=payload.vendor_name,
        transaction_amount=payload.transaction_amount,
        has_exception=payload.has_exception,
        exception_type=payload.exception_type,
        root_cause=payload.root_cause,
        resolution=payload.resolution
    )
    return profile

@router.post("/record-exception", response_model=VendorBehavioralProfileDTO)
def record_exception_and_recalculate_risk(payload: RecordExceptionRequestDTO):
    """
    Workflow:
    Transactions ➔ Reconciliation ➔ Exception Detection ➔ Memory Update ➔ Vendor Risk Recalculation
    """
    profile = memory_engine.update_memory(
        vendor_id=payload.vendor_id,
        vendor_name=payload.vendor_name,
        transaction_amount=payload.transaction_amount,
        has_exception=True,
        exception_type=payload.exception_type,
        root_cause=payload.root_cause or f"Reconciliation detected {payload.exception_type}",
        resolution=payload.resolution or "Pending operator resolution"
    )
    return profile
