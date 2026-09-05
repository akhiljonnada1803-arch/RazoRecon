from fastapi import APIRouter, HTTPException, Query, Body, Path, Depends
from typing import Dict, Any, Optional
from app.services.merchant_growth_service import merchant_growth_service
from app.services.merchant_analytics_service import merchant_analytics_service
from app.core.auth_dependency import get_authenticated_merchant_context, MerchantContext

router = APIRouter()

# 0. ADVANCED MERCHANT ANALYTICS (Recharts Telemetry)
@router.get("/advanced-analytics")
@router.get("/analytics/advanced")
def get_advanced_merchant_analytics(
    merchant_id: Optional[str] = Query(None, description="Merchant ID for drilldown (e.g. all, mcht_acme_pos, mcht_bharat_audio)"),
    date_range: Optional[str] = Query("30d", description="Timeframe filter: today, 7d, 30d, 90d, 1y, custom"),
    from_date: Optional[str] = Query(None, description="Start date for custom range (YYYY-MM-DD)"),
    to_date: Optional[str] = Query(None, description="End date for custom range (YYYY-MM-DD)"),
    context: MerchantContext = Depends(get_authenticated_merchant_context)
):
    """
    Retrieve telemetry for 7 Recharts visualizations:
    1. Revenue Trend (Line Chart)
    2. Daily Orders (Bar Chart)
    3. Category Revenue (Pie Chart)
    4. Top Selling Products (Horizontal Bar)
    5. Agent Orders vs Human Orders (Donut Chart)
    6. Revenue Forecast (Line Graph)
    7. Customer Lifetime Value (Histogram)
    Includes merchant drilldown and date range filtering.
    """
    target_id = merchant_id if (merchant_id and merchant_id != "all") else context.merchant_id
    return merchant_analytics_service.get_advanced_analytics(
        merchant_id=target_id,
        date_range=date_range or "30d",
        from_date=from_date,
        to_date=to_date
    )

@router.get("/merchants")
def list_analytics_merchants():
    """List registered merchants available for analytics drilldown."""
    return merchant_analytics_service.get_merchants()


# 1. UPSELL & CROSS-SELL ENGINE
@router.get("/upsell-cross-sell")
def get_upsell_cross_sell_analytics(
    context: MerchantContext = Depends(get_authenticated_merchant_context)
):
    """
    Retrieve Frequently Bought Together matrix, Bundle Recommendations, 
    Cross-Sell Opportunities, Upsell Suggestions, and Predicted Revenue Lift.
    """
    return merchant_growth_service.get_upsell_cross_sell(merchant_id=context.merchant_id)

# 2. AGENT ANALYTICS
@router.get("/agent-analytics")
def get_agent_analytics(
    context: MerchantContext = Depends(get_authenticated_merchant_context)
):
    """
    Retrieve deep-dive telemetry comparing AI Agent Autonomous Commerce vs Human Manual Shopping.
    Includes AI Orders Count, AI Revenue %, Conversion multiplier, AutoPay success, and top AI SKUs.
    """
    return merchant_growth_service.get_agent_analytics(merchant_id=context.merchant_id)

# 3. CUSTOMER INTELLIGENCE
@router.get("/customer-intelligence")
def get_customer_intelligence(
    context: MerchantContext = Depends(get_authenticated_merchant_context)
):
    """
    Retrieve Customer Lifetime Value (CLV) breakdown, Repeat Purchase Rates, 
    Cohort Retention Matrix, Churn Risk scores, and VIP Client accounts.
    """
    return merchant_growth_service.get_customer_intelligence(merchant_id=context.merchant_id)

# 4. REVENUE DASHBOARD
@router.get("/revenue-dashboard")
def get_revenue_dashboard(
    context: MerchantContext = Depends(get_authenticated_merchant_context)
):
    """
    Retrieve comprehensive revenue KPIs: Revenue Today, Revenue MTD, Orders Today, 
    AOV, YoY Annual Growth %, and AI Commerce Revenue Share %.
    """
    return merchant_growth_service.get_revenue_dashboard(merchant_id=context.merchant_id)

# 5. CAMPAIGN MANAGER
@router.get("/campaigns")
def list_growth_campaigns(
    context: MerchantContext = Depends(get_authenticated_merchant_context)
):
    """List all AI and merchant marketing campaigns with real-time ROI tracking."""
    return merchant_growth_service.get_campaigns(merchant_id=context.merchant_id)

@router.post("/campaigns/launch")
def launch_growth_campaign(
    payload: Dict[str, Any] = Body(...),
    context: MerchantContext = Depends(get_authenticated_merchant_context)
):
    """Deploy and immediately activate an AI generated or custom campaign."""
    return merchant_growth_service.launch_campaign(payload, merchant_id=context.merchant_id)

@router.post("/campaigns/{campaign_id}/toggle")
def toggle_growth_campaign(campaign_id: str = Path(...), payload: Optional[Dict[str, Any]] = Body(default={})):
    """Pause or Resume an active campaign."""
    target_status = payload.get("status") if payload else None
    try:
        return merchant_growth_service.toggle_campaign_status(campaign_id, target_status)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))

# 6. AGENT READINESS SCORE
@router.get("/agent-readiness")
def get_agent_readiness_scorecard(
    context: MerchantContext = Depends(get_authenticated_merchant_context)
):
    """Retrieve 5-dimension Agent Readiness scorecard (Catalog, Inventory, Pricing, Specs, Delivery)."""
    return merchant_growth_service.get_agent_readiness(merchant_id=context.merchant_id)

@router.post("/agent-readiness/optimize")
def auto_optimize_agent_readiness():
    """Execute 1-click autonomous AI remediation to achieve 100/100 Agent Readiness."""
    return merchant_growth_service.optimize_agent_readiness()
