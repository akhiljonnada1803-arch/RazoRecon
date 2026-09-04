from typing import List, Optional
from pydantic import BaseModel
from app.schemas.categorization import CategorizedTransactionDTO
from app.schemas.reconciliation import MatchDTO

class OverrideCategoryRequestDTO(BaseModel):
    txn_id: str
    approved_category: str
    notes: Optional[str] = None

class ReviewQueueResponseDTO(BaseModel):
    low_confidence_categorizations: List[CategorizedTransactionDTO]
    unmatched_deposits: List[MatchDTO]
    total_pending_review: int
