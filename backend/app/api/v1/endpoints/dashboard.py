from fastapi import APIRouter, Depends
from app.schemas.dashboard import ExecutiveDashboardResponseDTO
from app.services.dashboard_service import DashboardService

router = APIRouter()

@router.get("/executive", response_model=ExecutiveDashboardResponseDTO)
async def get_executive_dashboard(
    service: DashboardService = Depends()
):
    """Retrieve high-level executive dashboard metrics, charts, insights, and forecast."""
    return await service.get_executive_summary()
