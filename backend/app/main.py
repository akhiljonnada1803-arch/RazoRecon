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

from app.api.v1.endpoints import payments, webhooks, catalog, checkout, hero_demo
app.include_router(payments.router, prefix="/payments", tags=["Direct Payments Root API"])
app.include_router(payments.router, prefix="/api/payments", tags=["Direct Payments API"])

app.include_router(webhooks.router, prefix="/api/webhooks", tags=["Direct Webhooks API"])
app.include_router(catalog.router, prefix="/products", tags=["Direct Products API"])
app.include_router(catalog.router, prefix="/api/products", tags=["Direct API Products"])
app.include_router(catalog.router, prefix="/catalog", tags=["Direct Catalog API"])
app.include_router(catalog.router, prefix="/api/catalog", tags=["Direct API Catalog"])
app.include_router(checkout.router, prefix="/checkout", tags=["Direct Checkout API"])
app.include_router(checkout.router, prefix="/api/checkout", tags=["Direct API Checkout"])
app.include_router(hero_demo.router, prefix="/hero-demo", tags=["Direct Hero Demo API"])
app.include_router(hero_demo.router, prefix="/api/hero-demo", tags=["Direct API Hero Demo"])



@app.get("/api/forecast")
async def direct_forecast_redirect():
    from app.services.forecast_service import ForecastService
    service = ForecastService()
    return await service.generate_forecast()

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
