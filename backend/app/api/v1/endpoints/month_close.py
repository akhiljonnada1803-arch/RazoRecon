from fastapi import APIRouter, Depends
from app.schemas.month_close import (
    MonthCloseResultDTO,
    ExecuteMonthCloseRequestDTO,
)
from app.services.month_close_service import MonthCloseService

router = APIRouter()

@router.get("/status", response_model=MonthCloseResultDTO)
async def get_month_close_status(
    service: MonthCloseService = Depends()
):
    """Get the latest Month-End Close status and audit pack metrics."""
    return await service.get_latest_status()

@router.post("/execute", response_model=MonthCloseResultDTO)
async def execute_month_close(
    payload: ExecuteMonthCloseRequestDTO,
    service: MonthCloseService = Depends()
):
    """Trigger the autonomous 7-step Month-End Close agent workflow."""
    return await service.execute_month_close(period=payload.period or "March 2026")
