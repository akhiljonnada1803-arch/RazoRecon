from fastapi import APIRouter
from app.api.v1.endpoints import (
    categorization,
    reconciliation,
    review,
    ledger,
    agent,
    health,
    dashboard,
    exceptions,
    forecast,
    fraud,
    copilot,
    month_close,
    demo,
    memory,
    vendor_risk,
    auth,
    commerce,
    catalog,
    growth,
    campaigns,
    payments,
    webhooks,
    agent_commerce,
    checkout,
    hero_demo,
    merchant,
    audit,
    admin,
)

api_router = APIRouter()
api_router.include_router(merchant.router, prefix="/merchant", tags=["Merchant Hub"])
api_router.include_router(growth.router, prefix="/growth", tags=["Revenue Growth Engine"])
api_router.include_router(audit.router, prefix="/audit", tags=["Audit & Compliance"])
api_router.include_router(admin.router, prefix="/admin", tags=["Administration & RBAC"])
api_router.include_router(hero_demo.router, prefix="/hero-demo", tags=["Hero Demo - Razorpay Track 01"])
api_router.include_router(checkout.router, prefix="/checkout", tags=["AI Checkout Engine"])
api_router.include_router(agent_commerce.router, prefix="/agent-commerce", tags=["Agent-to-Agent Commerce"])


api_router.include_router(payments.router, prefix="/payments", tags=["Razorpay Test Mode Payments"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["Razorpay Webhooks"])
api_router.include_router(campaigns.router, prefix="/campaigns", tags=["Campaign Orchestrator"])
api_router.include_router(growth.router, prefix="/growth", tags=["Revenue Growth Agent"])
api_router.include_router(catalog.router, prefix="/catalog", tags=["Product Catalog Management"])
api_router.include_router(catalog.router, prefix="/products", tags=["Product Catalog Management"])
api_router.include_router(commerce.router, prefix="/commerce", tags=["Conversational Commerce Agent"])

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Multi-Tenant Orgs"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Executive Dashboard"])
api_router.include_router(demo.router, prefix="/demo", tags=["Demo Mode Generator"])
api_router.include_router(month_close.router, prefix="/month-close", tags=["Autonomous Month-End Close Agent"])
api_router.include_router(vendor_risk.router, prefix="/vendors", tags=["Vendor Risk Intelligence"])
api_router.include_router(memory.router, prefix="/memory", tags=["Finance Agent Memory Engine"])
api_router.include_router(copilot.router, prefix="/copilot", tags=["CFO Copilot"])
api_router.include_router(fraud.router, prefix="/fraud", tags=["Fraud Detection Center"])
api_router.include_router(forecast.router, prefix="/forecast", tags=["Cash Forecasting Module"])
api_router.include_router(exceptions.router, prefix="/exceptions", tags=["Exception Intelligence Agent"])
api_router.include_router(categorization.router, prefix="/categorization", tags=["Categorization"])
api_router.include_router(reconciliation.router, prefix="/reconciliation", tags=["Reconciliation"])
api_router.include_router(review.router, prefix="/review", tags=["Review Queue"])
api_router.include_router(ledger.router, prefix="/ledger", tags=["Ledger & Income Statement"])
api_router.include_router(agent.router, prefix="/agent", tags=["AI Operations Copilot"])
api_router.include_router(health.router, prefix="/health", tags=["Health & Status"])
