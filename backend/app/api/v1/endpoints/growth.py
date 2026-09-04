from fastapi import APIRouter, HTTPException, Body
from typing import List, Optional
from app.schemas.growth import (
    GrowthBasketRequestDTO,
    GrowthAnalysisResponseDTO,
    AffinityRuleDTO,
    SampleBasketDTO
)
from app.services.growth_service import growth_service

router = APIRouter()

@router.post("/analyze", response_model=GrowthAnalysisResponseDTO)
def analyze_revenue_growth(payload: GrowthBasketRequestDTO):
    """
    Revenue Growth Agent Analysis.
    
    Computes:
    - Current Cart Value vs Predicted Cart Value
    - Expected Revenue Uplift (%)
    - High-conversion Upsell recommendations (tier upgrades)
    - High-affinity Cross-sell recommendations (complementary add-ons)
    - Market Basket Association Rules (Lift > 1.5)
    """
    return growth_service.analyze_basket(payload)

@router.get("/sample-baskets", response_model=List[SampleBasketDTO])
def get_sample_baskets():
    """Retrieve pre-configured merchant shopping baskets for instant simulation testing."""
    return growth_service.get_sample_baskets()

@router.get("/affinity-matrix", response_model=List[AffinityRuleDTO])
def get_affinity_rules_matrix():
    """Retrieve historical market basket co-occurrence association rules with Support, Confidence & Lift scores."""
    return growth_service.get_affinity_matrix()
