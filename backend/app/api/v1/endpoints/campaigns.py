from fastapi import APIRouter, HTTPException, Query, Body, Depends
from typing import List, Optional
from app.schemas.campaign import (
    CustomerSegmentDTO,
    CampaignDTO,
    CampaignGenerateRequestDTO,
    CampaignSimulationRequestDTO,
    CampaignSimulationResponseDTO,
    CampaignListResponseDTO
)
from app.services.campaign_service import campaign_service
from app.core.auth_dependency import get_authenticated_merchant_context, MerchantContext

router = APIRouter()

@router.get("", response_model=CampaignListResponseDTO)
def get_campaigns_overview(
    context: MerchantContext = Depends(get_authenticated_merchant_context)
):
    """
    Get full Campaign Orchestrator overview with KPIs, active campaigns, and customer segments.
    """
    return campaign_service.get_campaigns_overview(merchant_id=context.merchant_id)

@router.get("/segments", response_model=List[CustomerSegmentDTO])
def get_customer_segments(
    context: MerchantContext = Depends(get_authenticated_merchant_context)
):
    """
    Get list of RFM behavioral customer segments.
    """
    return campaign_service.get_all_segments(merchant_id=context.merchant_id)

@router.post("/simulate", response_model=CampaignSimulationResponseDTO)
def simulate_discount_campaign(payload: CampaignSimulationRequestDTO):
    """
    Simulate price elasticity, conversion rate lift, volume expansion, and net revenue payoff for a campaign discount.
    """
    return campaign_service.simulate_discount(payload)

@router.post("/generate", response_model=CampaignDTO)
def generate_ai_campaign(
    payload: CampaignGenerateRequestDTO,
    context: MerchantContext = Depends(get_authenticated_merchant_context)
):
    """
    AI generate a tailored campaign with copywriting, multi-channel rollout, and forecasted payoff.
    """
    camp = campaign_service.generate_campaign_with_ai(payload)
    camp.merchant_id = context.merchant_id
    return camp

@router.patch("/{campaign_id}/status", response_model=CampaignDTO)
def update_campaign_status(campaign_id: str, status: str = Query(..., pattern="^(active|scheduled|draft|completed)$")):
    """
    Update campaign lifecycle status.
    """
    camp = campaign_service.toggle_campaign_status(campaign_id, status)
    if not camp:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return camp

@router.delete("/{campaign_id}")
def delete_campaign(campaign_id: str):
    """
    Delete a campaign from the orchestrator.
    """
    success = campaign_service.delete_campaign(campaign_id)
    if not success:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {"message": "Campaign deleted successfully", "campaign_id": campaign_id}
