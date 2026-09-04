from fastapi import APIRouter, Depends
from app.schemas.demo import (
    DemoGenerationResultDTO,
    GenerateDemoRequestDTO,
    OneClickDemoFlowResultDTO
)
from app.services.demo_service import demo_service, DemoService
from app.services.data_state_service import data_state_service

router = APIRouter()

@router.get("/status")
def get_data_status():
    """Retrieve global dataset status (has_data: true/false)."""
    return {"has_data": data_state_service.has_data()}

@router.post("/reset")
def reset_demo_data():
    """Reset all application modules to a clean zero-data state."""
    data_state_service.reset_data()
    return {"status": "success", "has_data": False, "message": "Application reset to clean empty state."}

@router.post("/generate", response_model=DemoGenerationResultDTO)
async def generate_demo_scenario(
    payload: GenerateDemoRequestDTO,
    service: DemoService = Depends()
):
    """Generate 100 invoices, 100 settlements & 100 transactions with injected financial anomalies."""
    data_state_service.set_has_data(True)
    return await service.generate_scenario(
        seed=payload.seed or 42,
        scale_invoices=payload.scale_invoices or 100,
        scale_settlements=payload.scale_settlements or 100,
        scale_transactions=payload.scale_transactions or 100,
    )

@router.post("/connect-razorpay", response_model=OneClickDemoFlowResultDTO)
async def connect_demo_razorpay_account():
    """
    One-Click Demo Flow:
    1. Load demo Razorpay transactions (500 payments).
    2. Run reconciliation (470 Matched, 30 Exceptions).
    3. Detect exceptions.
    4. Update Vendor Memory (22 counterparties).
    5. Calculate Vendor Risk Scores.
    6. Generate CFO Summary.
    """
    data_state_service.set_has_data(True)
    return await demo_service.run_one_click_demo_flow()
