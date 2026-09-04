from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from app.schemas.copilot import CopilotQueryRequestDTO, CopilotQueryResponseDTO
from app.services.cfo_copilot_service import CommerceCopilotService, CFOCopilotService

router = APIRouter()

@router.post("/query", response_model=CopilotQueryResponseDTO)
async def query_commerce_copilot(
    payload: CopilotQueryRequestDTO,
    service: CommerceCopilotService = Depends()
):
    """Query the Commerce AI Copilot for sales velocity, stockout alerts, campaign generation, product discovery, or order tracking."""
    return await service.generate_response(payload.messages)

@router.post("/stream")
async def stream_commerce_copilot(
    payload: CopilotQueryRequestDTO,
    service: CommerceCopilotService = Depends()
):
    """Stream Commerce AI Copilot responses using Server-Sent Events (SSE) with tool execution trace & citations."""
    return StreamingResponse(
        service.stream_response(payload.messages),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
