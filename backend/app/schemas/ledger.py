from typing import List, Dict, Optional
from pydantic import BaseModel

class PnLSummaryDTO(BaseModel):
    revenue: float
    cogs: float
    gross_profit: float
    operating_expense: float
    operating_income: float

class IncomeStatementSectionDTO(BaseModel):
    section: str
    amount: float

class IncomeStatementResponseDTO(BaseModel):
    summary: PnLSummaryDTO
    sections: List[IncomeStatementSectionDTO]
    revenue_by_channel: Dict[str, float]
    available_months: List[str]
