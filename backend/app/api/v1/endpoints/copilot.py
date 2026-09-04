from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from app.schemas.copilot import CopilotQueryRequestDTO, CopilotQueryResponseDTO
from app.services.cfo_copilot_service import CFOCopilotService

router = APIRouter()

@router.post("/query", response_model=CopilotQueryResponseDTO)
async def query_cfo_copilot(
    payload: CopilotQueryRequestDTO,
    service: CFOCopilotService = Depends()
):
    """Query the CFO Copilot for Match Rates, Cash Positions, Forecasts, Exceptions, Fraud, or Finance Health."""
    return await service.generate_response(payload.messages)

@router.post("/stream")
async def stream_cfo_copilot(
    payload: CopilotQueryRequestDTO,
    service: CFOCopilotService = Depends()
):
    """Stream CFO Copilot responses using Server-Sent Events (SSE) with tool execution trace & citations."""
    return StreamingResponse(
        service.stream_response(payload.messages),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
