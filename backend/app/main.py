from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
import sys
import os
import traceback
import logging

# Ensure src/ is on sys.path
SRC_DIR = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), "src"))
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

from app.core.config import settings
from app.api.v1.api import api_router
from app.services.categorization_service import CategorizationService

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

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

# -------------------------------------------------------------
# 1. CONFIGURE FASTAPI CORS
# Allowed Origins: http://localhost:3000, http://localhost:3001, http://localhost:3002
# -------------------------------------------------------------
ALLOWED_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"^https?:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# -------------------------------------------------------------
# 2. GLOBAL EXCEPTION HANDLERS
# -------------------------------------------------------------
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail if isinstance(exc.detail, str) else "HTTP Error",
            "detail": exc.detail,
            "status_code": exc.status_code,
            "path": str(request.url.path)
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Request Validation Failed",
            "detail": exc.errors(),
            "status_code": 422,
            "path": str(request.url.path)
        }
    )

@app.exception_handler(Exception)
async def global_unhandled_exception_handler(request: Request, exc: Exception):
    err_trace = traceback.format_exc()
    logging.error(f"[GlobalExceptionHandler] Unhandled 500 error on {request.method} {request.url.path}:\n{err_trace}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": str(exc),
            "status_code": 500,
            "path": str(request.url.path)
        }
    )

# Mount static uploads directory
app.mount("/static/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include standard API V1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Mount direct root/aliased routes for backward compatibility
from app.api.v1.endpoints import (
    payments, webhooks, catalog, checkout, hero_demo, 
    merchant, growth, audit, admin, customer_orders, ai_autopay, commerce, merchant_growth, orders,
    reviews, emi
)

# AI EMI Recommendation Endpoints
app.include_router(emi.router, prefix="/api/v1/commerce/emi", tags=["Direct EMI V1 API"])
app.include_router(emi.router, prefix="/api/commerce/emi", tags=["Direct EMI API"])
app.include_router(emi.router, prefix="/commerce/emi", tags=["Direct EMI Root API"])
app.include_router(emi.router, prefix="/emi", tags=["Direct EMI Root Alias API"])

# Product Ratings & Reviews Direct Endpoints
app.include_router(reviews.router, prefix="/reviews", tags=["Direct Product Reviews Root API"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["Direct Product Reviews API"])
app.include_router(reviews.router, prefix="/api/v1/reviews", tags=["Direct Product Reviews V1 API"])


# Orders & Invoices Direct Endpoints
app.include_router(orders.router, prefix="/orders", tags=["Direct Orders Root API"])
app.include_router(orders.router, prefix="/api/orders", tags=["Direct Orders API"])

# Customer AutoPay Endpoints
app.include_router(ai_autopay.router, prefix="/api/customer/autopay", tags=["Direct Customer AutoPay API"])
app.include_router(ai_autopay.router, prefix="/customer/autopay", tags=["Direct Customer AutoPay Root API"])
app.include_router(ai_autopay.router, prefix="/api/v1/customer/autopay", tags=["Direct Customer AutoPay V1 API"])

# Commerce Chat & Product Discovery Endpoints
app.include_router(commerce.router, prefix="/api/commerce", tags=["Direct Commerce API"])
app.include_router(commerce.router, prefix="/commerce", tags=["Direct Commerce Root API"])
app.include_router(commerce.router, prefix="/api/v1/commerce", tags=["Direct Commerce V1 API"])

# Customer Orders & Experience
app.include_router(customer_orders.router, prefix="/api/customer", tags=["Direct Customer Experience API"])
app.include_router(customer_orders.router, prefix="/customer", tags=["Direct Customer Root API"])

# Merchant & Growth
app.include_router(merchant.router, prefix="/api/merchant", tags=["Direct Merchant API"])
app.include_router(merchant.router, prefix="/merchant", tags=["Direct Merchant Root API"])
app.include_router(merchant_growth.router, prefix="/api/merchant/growth", tags=["Direct Merchant Growth OS API"])
app.include_router(merchant_growth.router, prefix="/merchant/growth", tags=["Direct Merchant Growth OS Root API"])
app.include_router(merchant_growth.router, prefix="/api/v1/merchant/growth", tags=["Direct Merchant Growth OS V1 API"])
app.include_router(growth.router, prefix="/api/growth", tags=["Direct Growth API"])
app.include_router(growth.router, prefix="/growth", tags=["Direct Growth Root API"])
app.include_router(audit.router, prefix="/api/audit", tags=["Direct Audit API"])
app.include_router(admin.router, prefix="/api/admin", tags=["Direct Admin API"])

# Payments & Checkout
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

# -------------------------------------------------------------
# 3. HEALTH CHECK ENDPOINTS
# GET /api/health -> {"status":"healthy"}
# -------------------------------------------------------------
@app.get("/api/health")
@app.get("/health")
@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy"
    }

@app.get("/api/forecast")
async def direct_forecast_redirect():
    from app.services.forecast_service import ForecastService
    service = ForecastService()
    return await service.generate_forecast()

@app.post("/api/reconciliation/run-razorpay")
@app.get("/api/reconciliation/run-razorpay")
async def direct_run_razorpay_alias():
    from app.services.reconciliation_service import reconciliation_service
    return await reconciliation_service.run_razorpay_reconciliation()

@app.get("/agent-context", tags=["AI Agent Context Direct"])
@app.get("/ai-context", tags=["AI Agent Context Direct"])
@app.get("/api/agent-context", tags=["AI Agent Context Direct"])
@app.get("/api/ai-context", tags=["AI Agent Context Direct"])
@app.get("/api/v1/agent-context", tags=["AI Agent Context Direct"])
@app.get("/api/v1/ai-context", tags=["AI Agent Context Direct"])
def direct_agent_context_alias():
    from app.services.catalog_service import catalog_service
    return catalog_service.get_ai_readable_context()

@app.get("/")
async def root():
    return {
        "message": "RazorCommerce AI Platform API is online.",
        "status": "healthy",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
