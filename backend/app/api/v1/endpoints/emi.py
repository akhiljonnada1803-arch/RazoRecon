from fastapi import APIRouter, HTTPException, Query, Header
from typing import Optional
from app.schemas.emi import (
    EMIRecommendationRequestDTO,
    EMIRecommendationResponseDTO
)
from app.services.emi_service import emi_service

router = APIRouter()


@router.post("/recommend", response_model=EMIRecommendationResponseDTO)
def recommend_emi_plan(
    payload: EMIRecommendationRequestDTO,
    x_customer_id: Optional[str] = Header(default=None)
):
    """
    AI EMI Recommendation API:
    Evaluates 3, 6, 9, 12, 18, and 24-month tenures across No Cost, Standard,
    and Bank EMIs, scoring them against monthly affordability, interest burden,
    and user spending history.
    """
    if payload.price <= 0:
        raise HTTPException(status_code=400, detail="Product price must be greater than zero.")

    user_id = payload.user_id or x_customer_id
    return emi_service.recommend_best_emi(
        price=payload.price,
        user_id=user_id,
        monthly_budget=payload.monthly_budget
    )


@router.get("/options", response_model=EMIRecommendationResponseDTO)
def get_emi_options(
    price: float = Query(..., gt=0, description="Product price in INR"),
    user_id: Optional[str] = Query(default=None, description="Optional customer ID"),
    budget: Optional[float] = Query(default=None, description="Optional customer monthly budget")
):
    """
    Query all EMI options (3, 6, 9, 12, 18, 24 months) and AI recommendation for a given product price.
    """
    return emi_service.recommend_best_emi(
        price=price,
        user_id=user_id,
        monthly_budget=budget
    )
