from fastapi import APIRouter, Query, Body, HTTPException, Path
from typing import List, Optional, Dict, Any

from app.schemas.razorpay_analytics import (
    RazorpayAnalyticsOverviewDTO,
    SettlementDTO,
    RefundDTO,
    TriggerSettlementRequestDTO,
    CreateRefundRequestDTO
)
from app.services.razorpay_analytics_service import razorpay_analytics_service

router = APIRouter()

@router.get("/overview", response_model=RazorpayAnalyticsOverviewDTO)
def get_razorpay_analytics_overview(
    timeframe: Optional[str] = Query("30d", description="Timeframe filter: 7d, 30d, 90d, 1y, ytd")
):
    """
    Retrieve unified Razorpay Analytics overview combining:
    - Payments API metrics (Total, Captured, Failed, Refunded, Success Rate)
    - Settlements API metrics (Pending, Completed, Settlement Time, UTR tracking)
    - Financial & MDR metrics (Gross Revenue, MDR Charges, Net Revenue, Efficiency Ratio)
    - Visualizations (Line Charts, Pie Charts, Trend data)
    """
    return razorpay_analytics_service.get_analytics(timeframe=timeframe or "30d")

@router.get("/settlements", response_model=List[SettlementDTO])
def list_settlements(
    status: Optional[str] = Query("all", description="Filter by status: all, pending, settled"),
    limit: int = Query(50, ge=1, le=100)
):
    """List Razorpay settlement payout batches with UTRs and fees."""
    return razorpay_analytics_service.list_settlements(status=status, limit=limit)

@router.post("/settlements/trigger", response_model=SettlementDTO)
def trigger_settlement_payout(payload: TriggerSettlementRequestDTO = Body(default=TriggerSettlementRequestDTO())):
    """Trigger manual or instant settlement payout batch to primary merchant bank."""
    return razorpay_analytics_service.trigger_settlement_payout(payload)

@router.get("/refunds", response_model=List[RefundDTO])
def list_refunds(limit: int = Query(50, ge=1, le=100)):
    """List processed and pending customer refunds."""
    return razorpay_analytics_service.list_refunds(limit=limit)

@router.post("/refunds", response_model=RefundDTO)
def create_refund(payload: CreateRefundRequestDTO = Body(...)):
    """Process a refund for a payment via Razorpay Refund API."""
    return razorpay_analytics_service.create_refund(payload)
