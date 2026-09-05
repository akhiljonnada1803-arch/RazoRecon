from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Body

from app.schemas.logistics_intelligence import (
    LogisticsFleetOverviewDTO,
    PincodeRoutingRecommendationDTO,
    ShipmentTrackingDetailDTO,
    AutonomousDispatchAssignRequest
)
from app.services.logistics_intelligence_service import logistics_intelligence_service

router = APIRouter()

@router.get("/overview", response_model=LogisticsFleetOverviewDTO)
def get_logistics_fleet_overview():
    """Pan-India logistics fleet telemetry, multi-carrier SLA comparison, and delay trends."""
    return logistics_intelligence_service.get_fleet_overview()

@router.get("/recommend-carrier/{pincode}", response_model=PincodeRoutingRecommendationDTO)
def recommend_carrier_for_pincode(pincode: str):
    """AI carrier routing recommendation for a destination pincode with explainability."""
    return logistics_intelligence_service.recommend_carrier_for_pincode(pincode)

@router.get("/shipments/tracking/{awb_or_order}", response_model=ShipmentTrackingDetailDTO)
def get_shipment_tracking(awb_or_order: str):
    """Detailed shipment tracking with AI delay risk scoring and reassurance."""
    return logistics_intelligence_service.get_shipment_tracking(awb_or_order)

@router.post("/dispatch/optimize")
def autonomous_dispatch_optimization(payload: AutonomousDispatchAssignRequest):
    """AI agent-to-agent autonomous carrier dispatch assignment."""
    return logistics_intelligence_service.optimize_and_assign_dispatch(
        order_id=payload.order_id,
        pincode=payload.destination_pincode,
        priority=payload.priority
    )
