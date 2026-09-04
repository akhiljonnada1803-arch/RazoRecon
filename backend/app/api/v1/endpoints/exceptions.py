from fastapi import APIRouter, Depends, HTTPException
from app.schemas.exception_intelligence import (
    ExceptionIntelligenceResponseDTO,
    ResolveExceptionRequestDTO,
)
from app.services.exception_intelligence_service import ExceptionIntelligenceService

router = APIRouter()

@router.get("", response_model=ExceptionIntelligenceResponseDTO)
async def get_all_exceptions(
    service: ExceptionIntelligenceService = Depends()
):
    """Investigate all financial mismatches & categorize root causes, impacts, actions, and confidence scores."""
    return await service.investigate_all()

@router.post("/resolve")
async def resolve_exception(
    payload: ResolveExceptionRequestDTO,
    service: ExceptionIntelligenceService = Depends()
):
    """Resolve an investigated exception or apply recommended action."""
    success = await service.resolve_exception(payload.exception_id, payload.resolution_action)
    if not success:
        raise HTTPException(status_code=404, detail="Exception record not found")
    return {
        "status": "success",
        "exception_id": payload.exception_id,
        "action": payload.resolution_action,
    }
