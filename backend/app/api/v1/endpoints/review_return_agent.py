from fastapi import APIRouter, HTTPException, Query, Path
from typing import List, Optional

from app.schemas.review_return_agent import (
    CustomerPrePurchaseIntelligenceDTO,
    MerchantReviewReturnOverviewDTO,
    SuggestedImprovementDTO
)
from app.services.review_return_agent_service import review_return_agent_service

router = APIRouter()

@router.get("/pre-purchase/{product_id}", response_model=CustomerPrePurchaseIntelligenceDTO)
def get_customer_pre_purchase_intelligence(product_id: str = Path(..., description="Target Product ID")):
    """
    Customer Pre-Purchase Decision Shield:
    Provides review summary, common positives, common concerns,
    predicted return risk score, and transparent explainable recommendation.
    """
    return review_return_agent_service.get_prepurchase_intelligence(product_id)

@router.get("/merchant/overview", response_model=MerchantReviewReturnOverviewDTO)
def get_merchant_review_return_overview():
    """
    Merchant Intelligence & Return Reduction Command Center:
    Provides complaint categories, 6-month return trends, sentiment aspect scores,
    suggested improvements, and product drilldowns.
    """
    return review_return_agent_service.get_merchant_overview()

@router.post("/merchant/mitigate/{improvement_id}", response_model=SuggestedImprovementDTO)
def apply_return_mitigation(improvement_id: str = Path(..., description="Improvement Recommendation ID"),
                            actor_id: str = Query("merchant_admin", description="Admin or Merchant ID")):
    """
    1-Click execute a return mitigation strategy.
    Applies mitigation across the platform and logs immutable audit trail.
    """
    imp = review_return_agent_service.apply_mitigation(improvement_id, actor_id=actor_id)
    if not imp:
        raise HTTPException(status_code=404, detail="Improvement strategy not found")
    return imp
