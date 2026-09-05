from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Body

from app.schemas.installation import (
    InstallationServiceItem,
    InstallationBookingCreate,
    InstallationBookingDTO,
    InstallationStatusUpdate,
    InstallationKPIsDTO
)
from app.services.installation_service import installation_service

router = APIRouter()

@router.get("/services", response_model=List[InstallationServiceItem])
def get_installation_services(
    category: Optional[str] = Query(None, description="Filter by product category e.g. Payment Terminals")
):
    """Retrieve catalog of certified hardware installation, deployment & onboarding services."""
    return installation_service.get_services_catalog(category=category)

@router.get("/services/{service_id}", response_model=InstallationServiceItem)
def get_installation_service_detail(service_id: str):
    """Get service details by ID or SKU."""
    item = installation_service.get_service_by_id(service_id)
    if not item:
        raise HTTPException(status_code=404, detail="Installation service not found")
    return item

@router.post("/bookings", response_model=InstallationBookingDTO)
def create_installation_booking(payload: InstallationBookingCreate):
    """Book a certified field technician for hardware installation & staff onboarding."""
    return installation_service.create_booking(payload)

@router.get("/bookings/customer/{customer_id}", response_model=List[InstallationBookingDTO])
def get_customer_installation_bookings(customer_id: str):
    """Get all past and upcoming installation bookings for a specific customer."""
    return installation_service.get_customer_bookings(customer_id)

@router.get("/bookings/{booking_id}", response_model=InstallationBookingDTO)
def get_installation_booking(booking_id: str):
    """Get booking details and live technician status."""
    booking = installation_service.get_booking_by_id(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Installation booking not found")
    return booking

@router.patch("/bookings/{booking_id}/status", response_model=InstallationBookingDTO)
def update_installation_status(booking_id: str, update: InstallationStatusUpdate):
    """Update technician deployment status (technician_assigned, in_transit, completed, etc)."""
    res = installation_service.update_booking_status(
        booking_id=booking_id,
        status=update.status,
        notes=update.notes,
        updated_by=update.updated_by
    )
    if not res:
        raise HTTPException(status_code=404, detail="Installation booking not found")
    return res

@router.get("/analytics/overview", response_model=InstallationKPIsDTO)
def get_installation_kpis():
    """Operations overview KPIs for field deployment fleet."""
    return installation_service.get_kpis()
