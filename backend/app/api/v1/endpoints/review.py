from fastapi import APIRouter, Depends, HTTPException
from app.schemas.review import ReviewQueueResponseDTO, OverrideCategoryRequestDTO
from app.services.categorization_service import CategorizationService
from app.services.reconciliation_service import ReconciliationService

router = APIRouter()

@router.get("", response_model=ReviewQueueResponseDTO)
async def get_review_queue(
    cat_service: CategorizationService = Depends(),
    rec_service: ReconciliationService = Depends(),
):
    low_confidence = await cat_service.get_unapproved_transactions()
    unmatched_deposits = await rec_service.get_flagged_deposits()
    return ReviewQueueResponseDTO(
        low_confidence_categorizations=low_confidence,
        unmatched_deposits=unmatched_deposits,
        total_pending_review=len(low_confidence) + len(unmatched_deposits),
    )

@router.post("/override")
async def override_category(
    payload: OverrideCategoryRequestDTO,
    cat_service: CategorizationService = Depends(),
):
    success = await cat_service.override_category(payload.txn_id, payload.approved_category)
    if not success:
        raise HTTPException(status_code=404, detail="Transaction not found in feed")
    return {
        "status": "success",
        "txn_id": payload.txn_id,
        "category": payload.approved_category,
    }
