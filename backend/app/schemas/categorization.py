from typing import Optional, List
from pydantic import BaseModel

class PolicyBasisDTO(BaseModel):
    doc_id: str
    title: str
    score: Optional[float] = None

class CategorizedTransactionDTO(BaseModel):
    txn_id: str
    date: str
    description: str
    amount: float
    category: str
    confidence: float
    section: str
    auto_post: bool
    cited_rule: Optional[str] = "—"
    rationale: str
    policy_basis: Optional[PolicyBasisDTO] = None

class CategorizationResponseDTO(BaseModel):
    total_count: int
    auto_post_count: int
    auto_post_rate: float
    review_count: int
    items: List[CategorizedTransactionDTO]
