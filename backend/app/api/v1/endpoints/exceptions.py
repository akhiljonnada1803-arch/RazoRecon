from fastapi import APIRouter, Depends, HTTPException, Path, Body
from typing import Optional, Dict, Any
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
    """Investigate all commerce exceptions & categorize root causes, impacts, actions, and severity scores."""
    return await service.investigate_all()

@router.post("/resolve")
async def resolve_exception(
    payload: ResolveExceptionRequestDTO,
    service: ExceptionIntelligenceService = Depends()
):
    """Resolve an investigated exception or apply recommended workflow action."""
    success = await service.resolve_exception(payload.exception_id, payload.resolution_action)
    if not success:
        raise HTTPException(status_code=404, detail="Exception record not found")
    return {
        "status": "success",
        "exception_id": payload.exception_id,
        "action": payload.resolution_action,
    }

@router.post("/{exception_id}/resolve")
async def resolve_exception_by_path(
    exception_id: str = Path(..., description="Exception ID"),
    payload: Optional[Dict[str, Any]] = Body(None),
    service: ExceptionIntelligenceService = Depends()
):
    """Resolve an investigated exception by exception ID in URL path."""
    action = payload.get("resolution_action", "Automated Workflow Executed") if payload else "Resolved"
    success = await service.resolve_exception(exception_id, action)
    if not success:
        raise HTTPException(status_code=404, detail="Exception record not found")
    return {
        "status": "success",
        "exception_id": exception_id,
        "action": action,
    }
