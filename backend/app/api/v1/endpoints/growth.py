from fastapi import APIRouter
from typing import Dict, Any, List
from app.services.growth_engine_service import growth_service

router = APIRouter()

@router.get("/overview")
def get_growth_overview():
    """Retrieve aggregate growth stats, cart uplift projections, and recent cross-sell metrics."""
    return growth_service.get_growth_overview()

@router.get("/upsell")
def get_upsell_rules():
    """Retrieve catalog upsell and cross-sell rules with baseline vs predicted cart value and uplift %."""
    return growth_service.get_upsell_rules()

@router.get("/segments")
def list_segments():
    """Retrieve RFM merchant segments with reach, average order value, GMV, and churn risk %."""
    return growth_service.get_segments()

@router.get("/campaigns")
def list_campaigns():
    """Retrieve AI-generated campaigns with target segment, revenue lift, and projected order volume."""
    return growth_service.get_campaigns()
