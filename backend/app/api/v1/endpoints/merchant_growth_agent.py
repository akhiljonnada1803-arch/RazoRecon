from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Body

from app.schemas.merchant_growth_agent import (
    GrowthRecommendationDTO,
    GrowthChatRequestDTO,
    GrowthChatResponseDTO,
    GrowthDashboardOverviewDTO
)
from app.services.merchant_growth_agent_service import merchant_growth_agent_service

router = APIRouter()

@router.get("/overview", response_model=GrowthDashboardOverviewDTO)
def get_growth_agent_overview():
    """Full overview of autonomous merchant growth signals, waterfall lift, and recommendations."""
    return merchant_growth_agent_service.get_dashboard_overview()

@router.get("/recommendations", response_model=List[GrowthRecommendationDTO])
def get_growth_recommendations(
    category: Optional[str] = Query(None, description="DECLINING_PRODUCT, REVENUE_OPPORTUNITY, DISCOUNT_RECOMMENDATION, BUNDLE_RECOMMENDATION, UPSELL_CROSS_SELL")
):
    """Retrieve targeted growth recommendations with explainable reasons and revenue impacts."""
    return merchant_growth_agent_service.get_recommendations_by_category(category_filter=category)

@router.post("/chat", response_model=GrowthChatResponseDTO)
def chat_with_growth_agent(payload: GrowthChatRequestDTO):
    """Conversational chat endpoint for merchant growth diagnosis and strategy queries."""
    return merchant_growth_agent_service.chat_with_growth_agent(payload)

@router.post("/apply/{recommendation_id}", response_model=GrowthRecommendationDTO)
def apply_growth_recommendation(
    recommendation_id: str,
    applied_by: Optional[str] = Query("Merchant Admin")
):
    """1-Click execution of an agent-recommended growth strategy."""
    rec = merchant_growth_agent_service.apply_recommendation(recommendation_id, applied_by=applied_by)
    if not rec:
        raise HTTPException(status_code=404, detail="Growth recommendation not found")
    return rec
