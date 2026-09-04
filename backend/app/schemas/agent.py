from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class ToolExecutionDTO(BaseModel):
    tool: str
    args: Dict[str, Any]
    result: Any

class AgentQueryRequestDTO(BaseModel):
    question: str
    max_steps: int = 5

class AgentQueryResponseDTO(BaseModel):
    answer: str
    trace: List[ToolExecutionDTO]
    using_mock: bool
