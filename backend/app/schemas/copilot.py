from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class CopilotMessageDTO(BaseModel):
    role: str  # "user" | "assistant" | "system"
    content: str
    trace: Optional[List[Dict[str, Any]]] = None
    citations: Optional[List[Dict[str, str]]] = None

class CopilotQueryRequestDTO(BaseModel):
    messages: List[CopilotMessageDTO]
    merchant_id: Optional[str] = None
    stream: bool = False

class CopilotQueryResponseDTO(BaseModel):
    answer: str
    trace: List[Dict[str, Any]] = Field(default_factory=list)
    citations: List[Dict[str, str]] = Field(default_factory=list)
    suggested_followups: List[str] = Field(default_factory=list)
    using_mock: bool = False
