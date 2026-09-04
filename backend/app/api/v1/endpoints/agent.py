from fastapi import APIRouter, Depends
from app.schemas.agent import AgentQueryRequestDTO, AgentQueryResponseDTO
from app.services.agent_service import AgentService

router = APIRouter()

@router.post("/query", response_model=AgentQueryResponseDTO)
async def query_agent(
    payload: AgentQueryRequestDTO,
    service: AgentService = Depends(),
):
    return await service.execute_query(question=payload.question, max_steps=payload.max_steps)
