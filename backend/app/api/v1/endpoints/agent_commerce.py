from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Optional
from app.schemas.agent_commerce import (
    A2APresetScenarioDTO,
    A2ASimulationRequestDTO,
    A2ASimulationResponseDTO
)
from app.services.agent_commerce_service import agent_commerce_service

router = APIRouter()

@router.get("/scenarios", response_model=List[A2APresetScenarioDTO])
def list_preset_scenarios():
    """
    List available Agent-to-Agent Commerce procurement scenarios.
    """
    return agent_commerce_service.get_preset_scenarios()

@router.post("/simulate", response_model=A2ASimulationResponseDTO)
def simulate_agent_commerce(payload: A2ASimulationRequestDTO):
    """
    Run autonomous 6-step Buyer-Seller Agent negotiation and settlement simulation.
    """
    try:
        return agent_commerce_service.run_simulation(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"A2A Simulation failed: {str(e)}")
