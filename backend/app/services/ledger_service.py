from __future__ import annotations

import sys
import os
from typing import Dict, List, Optional

SRC_DIR = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "src"))
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

import ledger
from schema import REVENUE, COGS, OPEX, OTHER
from app.schemas.ledger import (
    PnLSummaryDTO,
    IncomeStatementSectionDTO,
    IncomeStatementResponseDTO,
)

class LedgerService:
    async def get_income_statement(self, month: Optional[str] = None) -> IncomeStatementResponseDTO:
        summary_raw = ledger.pnl_summary(month)
        channels = ledger.revenue_by_channel(month)
        months = ledger.months_available()

        summary_dto = PnLSummaryDTO(
            revenue=summary_raw["revenue"],
            cogs=summary_raw["cogs"],
            gross_profit=summary_raw["gross_profit"],
            operating_expense=summary_raw["operating_expense"],
            operating_income=summary_raw["operating_income"],
        )

        rows = [r for r in ledger.load_ledger() if not month or r["month"] == month]
        section_totals: Dict[str, float] = {
            REVENUE: 0.0,
            COGS: 0.0,
            OPEX: 0.0,
            OTHER: 0.0,
        }
        for r in rows:
            sec = r.get("section", OTHER)
            section_totals[sec] = section_totals.get(sec, 0.0) + r["amount"]

        sections = [
            IncomeStatementSectionDTO(section=sec, amount=round(amt, 2))
            for sec, amt in section_totals.items()
        ]

        return IncomeStatementResponseDTO(
            summary=summary_dto,
            sections=sections,
            revenue_by_channel=channels,
            available_months=months,
        )
