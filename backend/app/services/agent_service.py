from __future__ import annotations

import sys
import os
from typing import Dict, Any

SRC_DIR = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "src"))
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

import agent as ops_agent
from model import USING_MOCK
from app.schemas.agent import AgentQueryResponseDTO, ToolExecutionDTO

class AgentService:
    async def execute_query(self, question: str, max_steps: int = 5) -> AgentQueryResponseDTO:
        out = ops_agent.run(question, max_steps=max_steps)

        trace_dtos = [
            ToolExecutionDTO(
                tool=t["tool"],
                args=t.get("args", {}),
                result=t.get("result"),
            )
            for t in out.get("trace", [])
        ]

        return AgentQueryResponseDTO(
            answer=out.get("answer", ""),
            trace=trace_dtos,
            using_mock=USING_MOCK,
        )
