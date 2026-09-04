from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import sys
import os

# Ensure src/ is on sys.path
SRC_DIR = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), "src"))
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

from app.core.config import settings
from app.api.v1.api import api_router
from app.services.categorization_service import CategorizationService

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Warm up policy index and memory on startup
    print("Warming up Knowledge Base index and RAG memory...")
    CategorizationService.get_kb()
    CategorizationService.get_memory()
    print("Warmup complete.")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

from app.api.v1.endpoints import payments, webhooks
app.include_router(payments.router, prefix="/api/payments", tags=["Direct Payments API"])
app.include_router(webhooks.router, prefix="/api/webhooks", tags=["Direct Webhooks API"])

@app.get("/api/forecast")
async def direct_forecast_redirect():
    from app.services.forecast_service import ForecastService
    service = ForecastService()
    return await service.generate_forecast()

@app.get("/api/catalog")
async def direct_catalog_alias():
    from app.services.catalog_service import catalog_service
    return catalog_service.get_all_products(limit=50)

@app.post("/api/reconciliation/run-razorpay")
async def direct_run_razorpay_alias():
    from app.services.reconciliation_service import reconciliation_service
    return await reconciliation_service.run_razorpay_reconciliation()

@app.get("/")
async def root():
    return {
        "message": "AI Reconciliation & Categorization Platform API is online.",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
