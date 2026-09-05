from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Optional

from app.schemas.campaign_optimizer import (
    CampaignOptimizerOverviewDTO,
    CampaignOpportunityDTO,
    OptimizedCampaignDTO,
    GenerateOptimizedCampaignRequestDTO,
    CampaignImprovementDTO
)
from app.services.campaign_optimizer_service import campaign_optimizer_service

router = APIRouter()

@router.get("/overview", response_model=CampaignOptimizerOverviewDTO)
def get_campaign_optimizer_overview():
    """
    Get full Campaign Optimization Agent overview:
    Historical sales trends, identified opportunities, KPI metrics,
    performance trajectories, active campaigns, and proactive improvement recommendations.
    """
    return campaign_optimizer_service.get_overview()

@router.get("/opportunities", response_model=List[CampaignOpportunityDTO])
def get_campaign_opportunities():
    """
    Get campaign opportunities uncovered by historical sales and elasticity analysis.
    """
    return campaign_optimizer_service.get_opportunities()

@router.post("/generate", response_model=OptimizedCampaignDTO)
def generate_optimized_campaign(payload: GenerateOptimizedCampaignRequestDTO):
    """
    AI generate an optimized campaign with target products, strategic objective,
    predicted ROI, estimated revenue increase, confidence score, and suggested discount percentage.
    """
    return campaign_optimizer_service.generate_optimized_campaign(payload)

@router.post("/improvements/{recommendation_id}/apply", response_model=CampaignImprovementDTO)
def apply_campaign_improvement(recommendation_id: str, actor_id: str = Query("merchant_admin")):
    """
    1-click apply a recommended campaign improvement (e.g. channel budget reallocation, min order tweak, bundle attachment).
    Updates campaign metrics and records immutable audit log.
    """
    imp = campaign_optimizer_service.apply_improvement(recommendation_id, actor_id=actor_id)
    if not imp:
        raise HTTPException(status_code=404, detail="Improvement recommendation not found")
    return imp
