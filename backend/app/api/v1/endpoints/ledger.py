from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.schemas.ledger import IncomeStatementResponseDTO
from app.services.ledger_service import LedgerService

router = APIRouter()

@router.get("/income-statement", response_model=IncomeStatementResponseDTO)
async def get_income_statement(
    month: Optional[str] = Query(None, pattern=r"^\d{4}-\d{2}$"),
    service: LedgerService = Depends(),
):
    return await service.get_income_statement(month=month)
