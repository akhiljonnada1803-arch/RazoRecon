from fastapi import APIRouter
from model import USING_MOCK
import os

router = APIRouter()

@router.get("")
async def health_check():
    return {
        "status": "healthy",
        "using_mock": USING_MOCK,
        "llm_model": os.getenv("APP_LLM_MODEL", "mock"),
    }
