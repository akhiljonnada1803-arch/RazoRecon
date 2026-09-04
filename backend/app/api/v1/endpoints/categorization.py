from fastapi import APIRouter, Depends, Query
from app.schemas.categorization import CategorizationResponseDTO
from app.services.categorization_service import CategorizationService

router = APIRouter()

@router.get("", response_model=CategorizationResponseDTO)
async def get_categorized_transactions(
    auto_approve_threshold: float = Query(0.75, ge=0.0, le=1.0),
    service: CategorizationService = Depends()
):
    return await service.get_all_categorized(auto_approve_threshold=auto_approve_threshold)
