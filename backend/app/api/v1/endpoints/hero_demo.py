from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Optional
from app.schemas.hero_demo import (
    HeroScenarioDTO,
    HeroDemoStateDTO,
    StepExecutionRequestDTO,
    RunAllRequestDTO
)
from app.services.hero_demo_service import hero_demo_service

router = APIRouter()

@router.get("/scenarios", response_model=List[HeroScenarioDTO])
def list_demo_scenarios():
    """Retrieve available enterprise procurement scenarios for the Hero Demo."""
    return hero_demo_service.get_scenarios()

@router.get("/state", response_model=HeroDemoStateDTO)
def get_hero_demo_state(
    session_id: Optional[str] = Query(default=None, description="Optional active session ID"),
    scenario_id: str = Query(default="mumbai_retail_expansion", description="Scenario ID")
):
    """Retrieve current state of the 10-step AI Commerce Hero Demo."""
    return hero_demo_service.get_or_create_session(session_id, scenario_id)

@router.post("/step", response_model=HeroDemoStateDTO)
def execute_hero_demo_step(payload: StepExecutionRequestDTO = Body(...)):
    """Execute a specific phase (1-10) of the AI Commerce workflow."""
    return hero_demo_service.execute_step(
        session_id=payload.session_id or "default_hero_session",
        step_number=payload.step_number,
        scenario_id=payload.scenario_id or "mumbai_retail_expansion"
    )

@router.post("/run-all", response_model=HeroDemoStateDTO)
def run_all_hero_demo_steps(payload: RunAllRequestDTO = Body(...)):
    """Execute the full 10-step autonomous flow from catalog ingestion to personalized future recommendations."""
    return hero_demo_service.run_all(
        session_id=payload.session_id or "default_hero_session",
        scenario_id=payload.scenario_id or "mumbai_retail_expansion"
    )

@router.post("/reset", response_model=HeroDemoStateDTO)
def reset_hero_demo(payload: RunAllRequestDTO = Body(...)):
    """Reset demo session state back to initial Step 1."""
    return hero_demo_service.reset_session(
        session_id=payload.session_id or "default_hero_session",
        scenario_id=payload.scenario_id or "mumbai_retail_expansion"
    )
