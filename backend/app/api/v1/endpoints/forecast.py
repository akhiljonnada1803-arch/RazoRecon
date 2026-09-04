from fastapi import APIRouter, Depends
from app.schemas.forecast import CashForecastResponseDTO
from app.services.forecast_service import ForecastService

router = APIRouter()

@router.get("", response_model=CashForecastResponseDTO)
async def get_cash_forecast(
    service: ForecastService = Depends()
):
    """Generate predictive 7-day, 30-day, and 90-day cash flow projections from historical payments and settlements."""
    return await service.generate_forecast()
