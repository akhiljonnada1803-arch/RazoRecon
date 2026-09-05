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
    demand_intelligence,
    customer_orders,
    ai_autopay,
    merchant_growth,
    orders,
    reviews as product_reviews_endpoint,
    emi,
    razorpay_analytics,
    decision_assistant,
    installation,
    logistics_intelligence,
    return_risk,
    merchant_growth_agent,
    campaign_optimizer,
    review_return_agent,
)

api_router = APIRouter()
api_router.include_router(orders.router, prefix="/orders", tags=["GST Tax Invoices"])
api_router.include_router(customer_orders.router, prefix="/customer", tags=["Customer Experience Hub"])
api_router.include_router(ai_autopay.router, prefix="/customer/autopay", tags=["AI Commerce AutoPay Agent"])
api_router.include_router(merchant.router, prefix="/merchant", tags=["Merchant Hub"])
api_router.include_router(merchant_growth.router, prefix="/merchant/growth", tags=["Merchant AI Growth OS"])
api_router.include_router(merchant.router, prefix="/merchant-orders", tags=["Merchant Hub"])
api_router.include_router(merchant.router, prefix="/order", tags=["Merchant Hub"])
api_router.include_router(growth.router, prefix="/growth", tags=["Revenue Growth Engine"])
api_router.include_router(merchant_growth.router, prefix="/growth", tags=["Merchant AI Growth OS Direct"])
api_router.include_router(demand_intelligence.router, prefix="/growth", tags=["AI Demand Intelligence"])
api_router.include_router(demand_intelligence.router, prefix="/demand", tags=["AI Demand Intelligence"])
api_router.include_router(audit.router, prefix="/audit", tags=["Audit & Compliance"])
api_router.include_router(admin.router, prefix="/admin", tags=["Administration & RBAC"])
api_router.include_router(hero_demo.router, prefix="/hero-demo", tags=["Hero Demo - Razorpay Track 01"])
api_router.include_router(checkout.router, prefix="/checkout", tags=["AI Checkout Engine"])
api_router.include_router(agent_commerce.router, prefix="/agent-commerce", tags=["Agent-to-Agent Commerce"])

api_router.include_router(payments.router, prefix="/payments", tags=["Razorpay Test Mode Payments"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["Razorpay Webhooks"])
api_router.include_router(campaigns.router, prefix="/campaigns", tags=["Campaign Orchestrator"])
api_router.include_router(catalog.router, prefix="/catalog", tags=["Product Catalog Management"])
api_router.include_router(catalog.router, prefix="/products", tags=["Product Catalog Management"])
api_router.include_router(commerce.router, prefix="/commerce", tags=["Conversational Commerce Agent"])
api_router.include_router(product_reviews_endpoint.router, prefix="/reviews", tags=["Product Ratings & Reviews"])
api_router.include_router(emi.router, prefix="/commerce/emi", tags=["AI EMI Recommendation System"])
api_router.include_router(razorpay_analytics.router, prefix="/razorpay/analytics", tags=["Razorpay Analytics Module"])
api_router.include_router(razorpay_analytics.router, prefix="/razorpay", tags=["Razorpay Analytics Direct"])
api_router.include_router(decision_assistant.router, prefix="/commerce/decision-assistant", tags=["Pre-Purchase Decision Assistant"])
api_router.include_router(decision_assistant.router, prefix="/decision-assistant", tags=["Pre-Purchase Decision Assistant Direct"])

api_router.include_router(installation.router, prefix="/installation", tags=["Installation & Setup Services"])
api_router.include_router(installation.router, prefix="/services/installation", tags=["Installation Services Direct"])
api_router.include_router(logistics_intelligence.router, prefix="/logistics", tags=["Logistics Intelligence"])
api_router.include_router(return_risk.router, prefix="/commerce/return-risk", tags=["Return Risk Prediction"])
api_router.include_router(return_risk.router, prefix="/return-risk", tags=["Return Risk Prediction Direct"])

api_router.include_router(merchant_growth_agent.router, prefix="/merchant/growth-agent", tags=["Merchant Growth Agent"])
api_router.include_router(merchant_growth_agent.router, prefix="/growth-agent", tags=["Merchant Growth Agent Direct"])

api_router.include_router(campaign_optimizer.router, prefix="/campaigns/optimizer", tags=["Campaign Optimization Agent"])
api_router.include_router(campaign_optimizer.router, prefix="/growth/optimizer", tags=["Campaign Optimization Agent Direct"])

api_router.include_router(review_return_agent.router, prefix="/review-return", tags=["Review Intelligence & Return Reduction Agent"])
api_router.include_router(review_return_agent.router, prefix="/merchant/review-return", tags=["Review Intelligence & Return Reduction Agent Direct"])

api_router.include_router(emi.router, prefix="/emi", tags=["AI EMI Recommendation System"])


api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Multi-Tenant Orgs"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Executive Dashboard"])
api_router.include_router(demo.router, prefix="/demo", tags=["Demo Mode Generator"])
api_router.include_router(month_close.router, prefix="/month-close", tags=["Autonomous Month-End Close Agent"])

api_router.include_router(vendor_risk.router, prefix="/vendor-risk", tags=["Merchant & Buyer Intelligence"])
api_router.include_router(vendor_risk.router, prefix="/vendors", tags=["Merchant & Buyer Intelligence"])
api_router.include_router(vendor_risk.router, prefix="/intelligence", tags=["Merchant & Buyer Intelligence"])

api_router.include_router(memory.router, prefix="/memory", tags=["Finance Agent Memory Engine"])
api_router.include_router(copilot.router, prefix="/copilot", tags=["Commerce AI Copilot"])
api_router.include_router(fraud.router, prefix="/fraud", tags=["Fraud Detection Center"])
api_router.include_router(forecast.router, prefix="/forecast", tags=["Cash Forecasting Module"])
api_router.include_router(exceptions.router, prefix="/exceptions", tags=["Commerce Exception Center"])
api_router.include_router(categorization.router, prefix="/categorization", tags=["Categorization"])
api_router.include_router(reconciliation.router, prefix="/reconciliation", tags=["Commerce Transaction Engine"])
api_router.include_router(review.router, prefix="/review", tags=["Review Queue"])
api_router.include_router(ledger.router, prefix="/ledger", tags=["Ledger & Income Statement"])
api_router.include_router(agent.router, prefix="/agent", tags=["AI Operations Copilot"])
api_router.include_router(health.router, prefix="/health", tags=["Health & Status"])
