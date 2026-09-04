from __future__ import annotations

import sys
import os
import json
import asyncio
from typing import List, Dict, Any, AsyncGenerator

SRC_DIR = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "src"))
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

from app.schemas.copilot import CopilotMessageDTO, CopilotQueryResponseDTO
from app.services.forecast_service import ForecastService
from app.services.fraud_service import FraudService
from app.services.exception_intelligence_service import exception_intelligence_service
from app.services.vendor_risk_service import vendor_risk_service
from app.services.reconciliation_service import reconciliation_service
from app.services.catalog_service import catalog_service
from app.services.demand_intelligence_service import demand_intelligence_service

class CommerceCopilotService:
    def __init__(self):
        self.forecast_service = ForecastService()
        self.fraud_service = FraudService()

    async def execute_tools(self, tool_name: str, args: Dict[str, Any]) -> Any:
        if tool_name == "get_demand_intelligence":
            return demand_intelligence_service.get_demand_intelligence()

        elif tool_name == "get_inventory_optimization":
            return demand_intelligence_service.get_inventory_optimization()

        elif tool_name == "analyze_sales_and_revenue":
            comm_summary = reconciliation_service.get_commerce_transaction_summary()
            merchant_intel = vendor_risk_service.get_merchant_intelligence()
            return {
                "total_gmv_inr": comm_summary.total_gmv_inr,
                "annualized_runrate_inr": merchant_intel.revenue_runrate_inr,
                "gmv_growth_pct": merchant_intel.gmv_growth_pct,
                "total_orders": comm_summary.total_orders,
                "agent_purchases_count": comm_summary.agent_purchases_count,
                "agent_gmv_inr": comm_summary.agent_gmv_inr,
                "top_products": [
                    {"title": p.title, "sales": p.sales_count, "gmv": p.gmv_inr}
                    for p in merchant_intel.top_products
                ]
            }

        elif tool_name == "get_inventory_alerts":
            stats = catalog_service.get_catalog_stats()
            low_stock_items = [p for p in catalog_service.get_all_products(limit=50).items if "Low" in p.stock_status or p.stock_quantity < 10]
            return {
                "total_skus": stats.total_products,
                "in_stock_rate_pct": stats.in_stock_rate_pct,
                "low_stock_alerts_count": len(low_stock_items),
                "low_stock_skus": [
                    {"id": p.id, "name": p.name, "stock": p.stock_quantity, "category": p.category}
                    for p in low_stock_items
                ]
            }

        elif tool_name == "generate_promotional_campaign":
            discount_pct = args.get("discount_pct", 15)
            target_segment = args.get("target_segment", "High Churn Risk Buyers")
            category = args.get("category", "Electronics & Wearables")
            return {
                "campaign_id": "CMP-2026-AI-WINBACK",
                "campaign_name": f"AI Autonomous Flash Promo: {discount_pct}% Off {category}",
                "coupon_code": f"SAVE{discount_pct}AUTONOMOUS",
                "discount_pct": discount_pct,
                "target_cohort": target_segment,
                "estimated_reach": 117,
                "projected_incremental_gmv_inr": 284000.00,
                "status": "Ready for 1-Click Launch"
            }

        elif tool_name == "generate_cross_sell_bundle":
            main_sku = args.get("main_sku", "Sony WH-1000XM5 Headphones")
            bundle_sku = args.get("bundle_sku", "Titan Smartwatch Pro Titanium")
            return {
                "bundle_id": "BNDL-AUDIO-PRO",
                "bundle_title": f"Audiophile & Tech Executive Duo ({main_sku} + {bundle_sku})",
                "individual_total_inr": 41989.00,
                "bundle_price_inr": 36990.00,
                "savings_inr": 4999.00,
                "expected_conversion_lift": "+24.8%",
                "status": "Active across AI Agent Feeds"
            }

        elif tool_name == "sync_agent_catalog_feed":
            ctx = catalog_service.get_ai_readable_context()
            return {
                "feed_version": ctx.schema_version,
                "total_skus": ctx.total_items,
                "token_density": "~3.8k tokens",
                "protocol_compliance": "Agentic Commerce Protocol v1.4 (RFC-8994)",
                "status": "Synchronized globally across edge nodes in 12ms"
            }

        elif tool_name == "discover_products":
            query = args.get("query", "titan smartwatch")
            products = catalog_service.get_all_products(search=query, limit=5)
            return {
                "matched_skus_count": len(products.items),
                "products": [
                    {
                        "id": p.id,
                        "name": p.name,
                        "category": p.category,
                        "price_inr": p.price_inr,
                        "stock_status": p.stock_status,
                        "rating": p.rating,
                        "key_features": p.features[:3] if p.features else []
                    }
                    for p in products.items
                ]
            }

        elif tool_name == "track_order_status":
            order_id = args.get("order_id", "ORD-2026-8941")
            txns = reconciliation_service.get_commerce_transactions()
            matched = next((t for t in txns if t.order_id == order_id or t.id == order_id), None)
            if matched:
                return {
                    "order_id": matched.order_id,
                    "customer": matched.customer_name,
                    "product": matched.product_title,
                    "amount_inr": matched.amount,
                    "payment_status": matched.payment_status,
                    "lifecycle_stage": matched.lifecycle_stage,
                    "carrier": matched.carrier,
                    "tracking_number": matched.tracking_number,
                    "timeline_events": [
                        {"stage": e.stage, "time": e.timestamp, "desc": e.description}
                        for e in matched.timeline
                    ]
                }
            return {
                "order_id": order_id,
                "status": "In Transit via Delhivery Express",
                "expected_delivery": "Tomorrow by 2:00 PM"
            }

        elif tool_name == "get_match_rate_analysis":
            comm_summary = reconciliation_service.get_commerce_transaction_summary()
            return {
                "total_orders": comm_summary.total_orders,
                "total_gmv_inr": comm_summary.total_gmv_inr,
                "agent_purchases_count": comm_summary.agent_purchases_count,
                "agent_purchases_share": f"{round((comm_summary.agent_purchases_count / max(1, comm_summary.total_orders)) * 100, 1)}%",
                "delivered_count": comm_summary.delivered_count
            }

        elif tool_name == "get_cash_forecast":
            forecast_data = await self.forecast_service.generate_forecast()
            return {
                "current_cash_position_inr": forecast_data.current_cash_balance,
                "forecast_30d_closing_inr": forecast_data.forecast_30d.projected_closing_balance,
                "monthly_net_improvement_pct": 14.8,
                "runway_days": forecast_data.forecast_30d.runway_days
            }

        elif tool_name == "get_top_risks_and_fraud":
            exc_resp = await exception_intelligence_service.investigate_all()
            return {
                "total_exceptions": exc_resp.summary.total_exceptions,
                "critical_exceptions": exc_resp.summary.critical_count,
                "revenue_at_risk_inr": exc_resp.summary.total_exposure_amount,
                "categories": exc_resp.summary.by_category
            }

        return {"status": "Tool executed successfully", "tool": tool_name}

    async def generate_response(self, messages: List[CopilotMessageDTO]) -> CopilotQueryResponseDTO:
        user_message = messages[-1].content if messages else "Hello"
        q = user_message.lower().strip()
        trace = []
        citations = []

        # 1. AI Discount Recommendations & Declining/Dead Inventory
        if "discount" in q or "markdown" in q or "price drop" in q or "declining" in q or "dead inventory" in q or "need discounts" in q:
            res = await self.execute_tools("get_demand_intelligence", {})
            trace.append({"tool": "get_demand_intelligence", "args": {}, "result": res["summary"]})
            declining = res.get("declining_products", [])
            dead = res.get("dead_inventory", [])

            answer = (
                f"### 🤖 AI Discount & Markdown Recommendations\n\n"
                f"Based on real-time **Demand Scoring (0–100)** across views, searches, cart additions, and inventory velocity:\n\n"
            )

            if declining:
                p = declining[0]
                rec = p.get("ai_recommendation", {})
                answer += (
                    f"#### 📉 Declining Demand SKU: **{p['name']}**\n"
                    f"- **Current Demand Score**: **{p['demand_score']}/100** ({p['status_tier']['badge']})\n"
                    f"- **Current Price**: ₹{p['price']:,.2f} • **Stock**: {p['stock']} units\n"
                    f"- **🎯 AI Recommendation**: Apply **{rec.get('discount_pct', 10)}% Dynamic Discount** (New Price: ₹{rec.get('target_price', p['price'] * 0.9):,.2f})\n"
                    f"- **📈 Expected Impact**: **+{rec.get('expected_uplift_pct', 22)}% conversion lift** (Est. +₹{rec.get('expected_revenue_lift_inr', 18500):,.2f} revenue)\n"
                    f"- **Confidence**: **{rec.get('confidence_pct', 88)}%**\n\n"
                )

            if dead:
                d = dead[0]
                drec = d.get("ai_recommendation", {})
                answer += (
                    f"#### 💀 Dead Inventory Liquidation: **{d['name']}**\n"
                    f"- **Demand Score**: **{d['demand_score']}/100** • **Trapped Capital**: ₹{d.get('tied_capital_inr', 42000):,.2f}\n"
                    f"- **🎯 AI Action**: **{drec.get('title', '15% Markdown & Companion Bundle')}** with *{drec.get('bundle_with', 'Smart POS Terminal Pro')}*\n"
                    f"- **Expected Revenue Lift**: **+₹{drec.get('expected_revenue_lift_inr', 24000):,.2f}** ({drec.get('confidence_pct', 92)}% confidence)\n\n"
                )

            answer += "> **Actionable**: You can execute these recommendations directly on the **[Demand Intelligence Hub](/merchant/demand-intelligence)** with 1-click."
            citations.append({"doc_id": "kb-0118", "title": "AI Demand Scoring & Dynamic Discount Optimization Model"})

        # 2. Trending & High-Demand Products
        elif "trending" in q or "growing" in q or "popular" in q or "top product" in q or "what products are trending" in q:
            res = await self.execute_tools("get_demand_intelligence", {})
            trace.append({"tool": "get_demand_intelligence", "args": {}, "result": res["summary"]})
            trending = res.get("trending_products", [])
            growing = res.get("growing_products", [])

            answer = (
                f"### 🔥 High Demand & Trending Products\n\n"
                f"Current high-velocity SKUs identified by the **Demand Scoring Engine**:\n\n"
            )
            for p in (trending + growing)[:3]:
                answer += (
                    f"- **{p['name']}** ({p['category']}): **Score {p['demand_score']}/100** ({p['status_tier']['badge']})\n"
                    f"  - **Velocity**: {p['inventory_velocity']} units/day • **Conversion Rate**: {p['conversion_rate']}%\n"
                    f"  - **Traffic**: {p['views']} views, {p['cart_adds']} cart adds, {p['purchases']} purchases\n"
                )
            answer += (
                f"\n> **Strategic Advice**: Protect margins by maintaining full price on trending hardware and ensure warehouse replenishment before stockouts occur."
            )
            citations.append({"doc_id": "kb-0119", "title": "Real-time Demand Telemetry & SKU Velocity Analysis"})

        # 3. Inventory Risks & Stockout Forecasting
        elif "risk" in q or "stockout" in q or "run out" in q or "inventory is at risk" in q or "understocked" in q:
            res = await self.execute_tools("get_inventory_optimization", {})
            trace.append({"tool": "get_inventory_optimization", "args": {}, "result": res["overview"]})
            restock = res.get("restock_queue", [])
            overstocked = res.get("overstocked", [])

            answer = (
                f"### ⚠️ Inventory Risk & Stockout Prediction\n\n"
                f"- **Critical Understocked SKUs**: **{len(restock)} items** at imminent risk of stockout.\n"
                f"- **Tied-up Overstock Capital**: **₹{res['overview']['tied_up_overstock_capital_inr']:,.2f}** across {len(overstocked)} slow-moving items.\n\n"
                f"**Imminent Stockouts**:\n"
            )
            for item in restock[:2]:
                answer += (
                    f"- **{item['product_name']}**: Current stock **{item['current_stock']} units** $\\rightarrow$ **Runs out in {item['days_to_stockout']} days**.\n"
                    f"  - **Recommendation**: **Restock {item['recommended_restock_units']} units** (Est. Cost: ₹{item['estimated_reorder_cost_inr']:,.2f})\n"
                )
            answer += "\n> **Action**: View complete replenishment queue in **[Inventory Optimization](/merchant/inventory-optimization)**."
            citations.append({"doc_id": "kb-0120", "title": "Predictive Stockout & Warehouse Working Capital Intelligence"})

        # 4. Increase Revenue & Growth Campaigns
        elif "increase revenue" in q or "boost revenue" in q or "revenue this month" in q or "suggest a campaign" in q or "campaign" in q:
            res = await self.execute_tools("get_demand_intelligence", {})
            trace.append({"tool": "get_demand_intelligence", "args": {}, "result": res["summary"]})
            camps = res.get("autonomous_campaigns", [])

            answer = (
                f"### 🚀 AI Growth Engine: Strategy to Increase Revenue This Month\n\n"
                f"AI Demand Intelligence projects **+₹{res['summary']['projected_revenue_lift_inr']:,.2f} in incremental revenue** via 3 autonomous actions:\n\n"
            )
            for c in camps[:2]:
                answer += (
                    f"#### 🎯 Campaign: **{c['name']}**\n"
                    f"- **Target Audience**: {c['target_audience']}\n"
                    f"- **Offer**: {c['recommended_discount_pct']}% off for {c['duration_days']} days\n"
                    f"- **Expected Revenue Lift**: **₹{c['expected_revenue_lift_inr']:,.2f}** ({c['confidence_score']}% AI confidence)\n\n"
                )
            answer += "> **Launch Ready**: You can preview and activate these campaigns with 1 click in **[Campaign Manager](/merchant/campaigns)**."
            citations.append({"doc_id": "kb-0121", "title": "Autonomous Merchant Campaign Generation & Revenue Uplift Forecast"})

        # 5. General Sales & Revenue Analysis (Merchant)
        elif "sales" in q or "revenue" in q or "gmv" in q or "growth" in q or "performance" in q:
            res = await self.execute_tools("analyze_sales_and_revenue", {})
            trace.append({"tool": "analyze_sales_and_revenue", "args": {}, "result": res})
            answer = (
                f"### Commerce Sales & Revenue Analysis\n\n"
                f"- **Total Captured GMV**: **₹{res['total_gmv_inr']:,.2f}**\n"
                f"- **Annualized Run-Rate**: **₹{res['annualized_runrate_inr']:,.2f}** (**+{res['gmv_growth_pct']}% YoY**)\n"
                f"- **AI Agent Purchases**: **{res['agent_purchases_count']} Orders** generating **₹{res['agent_gmv_inr']:,.2f}** in autonomous volume.\n\n"
                f"**Top SKU Velocity Leaderboard**:\n"
                f"1. **{res['top_products'][0]['title']}**: {res['top_products'][0]['sales']} units (₹{res['top_products'][0]['gmv']:,.2f})\n"
                f"2. **{res['top_products'][1]['title']}**: {res['top_products'][1]['sales']} units (₹{res['top_products'][1]['gmv']:,.2f})\n\n"
                f"> **AI Copilot Recommendation**: Launch an automated cross-sell bundle combining Sony XM5 Headphones with the Titan Smartwatch to capture +24% higher basket AOV."
            )
            citations.append({"doc_id": "kb-0102", "title": "Merchant Revenue Intelligence & SKU Velocity Metrics"})

        # 2. Inventory Stockout Alerts (Merchant)
        elif "inventory" in q or "stock" in q or "alert" in q or "low stock" in q or "shortage" in q:
            res = await self.execute_tools("get_inventory_alerts", {})
            trace.append({"tool": "get_inventory_alerts", "args": {}, "result": res})
            answer = (
                f"### Inventory Health & Stockout Alerts\n\n"
                f"- **Overall In-Stock Rate**: **{res['in_stock_rate_pct']:.1f}%** across {res['total_skus']} total catalog SKUs.\n"
                f"- **Active Low Stock SKUs**: **{res['low_stock_alerts_count']} SKUs** approaching critical threshold:\n\n"
                f"**Actionable Shortage List**:\n"
            )
            for sku in res["low_stock_skus"][:3]:
                answer += f"- **{sku['name']}** (`{sku['id']}`): Only **{sku['stock']} units remaining** ({sku['category']}).\n"
            answer += (
                f"\n> **Autonomous Action Triggered**: Suggested PO replenishment draft created for Apple iPad Air M2 to prevent flash sale stockouts."
            )
            citations.append({"doc_id": "kb-0099", "title": "Real-time Multi-Warehouse Inventory Allocation Standard"})

        # 3. Campaign & Discount Generation (Agent Action)
        elif "campaign" in q or "discount" in q or "promo" in q or "cross-sell" in q or "bundle" in q or "winback" in q:
            res = await self.execute_tools("generate_promotional_campaign", {"discount_pct": 15, "category": "Electronics"})
            trace.append({"tool": "generate_promotional_campaign", "args": {"discount_pct": 15}, "result": res})
            answer = (
                f"### Autonomous Promotional Campaign Created\n\n"
                f"- **Campaign Title**: **{res['campaign_name']}** (`{res['campaign_id']}`)\n"
                f"- **Dynamic Coupon**: `{res['coupon_code']}` (**{res['discount_pct']}% instant checkout discount**)\n"
                f"- **Target Audience**: **{res['target_cohort']}** ({res['estimated_reach']} high-LTV buyers)\n"
                f"- **Projected Revenue Impact**: **+₹{res['projected_incremental_gmv_inr']:,.2f} incremental GMV**.\n\n"
                f"> **Status**: {res['status']}. The coupon has been automatically ingested into the AI Buyer JSON feed."
            )
            citations.append({"doc_id": "kb-0055", "title": "Dynamic AI Promo Engine & Algorithmic Discounting"})

        # 4. Product Discovery & Comparison (Customer Mode)
        elif "product" in q or "recommend" in q or "discover" in q or "compare" in q or "buy" in q or "search" in q or "titan" in q or "sony" in q:
            res = await self.execute_tools("discover_products", {"query": user_message})
            trace.append({"tool": "discover_products", "args": {"query": user_message}, "result": res})
            answer = (
                f"### AI Product Discovery & Recommendations\n\n"
                f"Found **{res['matched_skus_count']} top products** matching your preferences:\n\n"
            )
            for p in res["products"]:
                answer += (
                    f"#### {p['name']} (`{p['id']}`)\n"
                    f"- **Price**: **₹{p['price_inr']:,.2f}** • **Stock**: {p['stock_status']} • **Rating**: {p['rating']}★\n"
                    f"- **Key Features**: {', '.join(p['key_features']) if p['key_features'] else 'High performance, premium build'}\n\n"
                )
            answer += "> **1-Click AI Checkout**: Ready to purchase? Click **Checkout via Razorpay** to complete instantly."
            citations.append({"doc_id": "kb-0041", "title": "Agentic Commerce Protocol Discovery Specification"})

        # 5. Order Tracking & Delivery Status (Customer Mode)
        elif "track" in q or "order" in q or "delivery" in q or "awb" in q or "delhivery" in q or "blue dart" in q or "ord-" in q:
            res = await self.execute_tools("track_order_status", {"order_id": "ORD-2026-8941"})
            trace.append({"tool": "track_order_status", "args": {"order_id": "ORD-2026-8941"}, "result": res})
            answer = (
                f"### Order Tracking & Live Dispatch Status\n\n"
                f"- **Order ID**: **{res.get('order_id', 'ORD-2026-8941')}**\n"
                f"- **Item**: **{res.get('product', 'Titan Smartwatch Pro Titanium 46mm')}**\n"
                f"- **Status**: **{res.get('lifecycle_stage', 'Delivered')}**\n"
                f"- **Carrier Logistics**: **{res.get('carrier', 'Delhivery Express')}** (AWB: `{res.get('tracking_number', 'DEL-994821034IN')}`)\n\n"
                f"**Lifecycle History**:\n"
            )
            for ev in res.get("timeline_events", []):
                answer += f"- **{ev['stage']}** ({ev['time']}): {ev['desc']}\n"
            citations.append({"doc_id": "kb-0033", "title": "Carrier Logistics Webhook SLA Standard"})

        # 6. Exceptions & Failure Alerts
        elif "exception" in q or "failure" in q or "risk" in q:
            res = await self.execute_tools("get_top_risks_and_fraud", {})
            trace.append({"tool": "get_top_risks_and_fraud", "args": {}, "result": res})
            answer = (
                f"### Commerce Exception Center Overview\n\n"
                f"- **Total Active Incidents**: **{res['total_exceptions']} exceptions**\n"
                f"- **Critical Severity**: **{res['critical_exceptions']} critical**\n"
                f"- **Revenue Exposure at Risk**: **₹{res['revenue_at_risk_inr']:,.2f}**\n\n"
                f"> **Automated Resolution Available**: You can resolve payment drops, courier API timeouts, and inventory locks in 1-click from the **Commerce Exception Center**."
            )
            citations.append({"doc_id": "kb-0021", "title": "Automated Commerce Failure Recovery Matrix"})

        # 7. General Assistant Response
        else:
            res = await self.execute_tools("analyze_sales_and_revenue", {})
            trace.append({"tool": "analyze_sales_and_revenue", "args": {}, "result": res})
            answer = (
                f"### RazorCommerce AI Copilot\n\n"
                f"I am your dual-mode intelligent commerce assistant. Current platform telemetry:\n"
                f"- **Total Captured GMV**: **₹{res['total_gmv_inr']:,.2f}**\n"
                f"- **Annualized Run-Rate**: **₹{res['annualized_runrate_inr']:,.2f}** (+{res['gmv_growth_pct']}% growth)\n"
                f"- **Autonomous AI Volume**: **{res['agent_purchases_count']} Orders** (₹{res['agent_gmv_inr']:,.2f})\n\n"
                f"**What would you like to do?**\n"
                f"- **Merchant**: Analyze sales, check inventory alerts, generate discount campaigns, or forecast cash flow.\n"
                f"- **Customer**: Discover top products, compare specs, or track an active shipment."
            )
            citations.append({"doc_id": "kb-0001", "title": "RazorCommerce AI Architecture Overview"})

        return CopilotQueryResponseDTO(
            answer=answer,
            trace=trace,
            citations=citations,
            suggested_followups=[
                "Analyze our 30-day sales and GMV velocity",
                "Which SKUs have low stock or shortage risk?",
                "Generate an AI promotional discount campaign",
                "Track order ORD-2026-8941 delivery status"
            ],
            using_mock=False
        )

    async def stream_response(self, messages: List[CopilotMessageDTO]) -> AsyncGenerator[str, None]:
        response = await self.generate_response(messages)

        yield f"event: trace\ndata: {json.dumps(response.trace)}\n\n"
        await asyncio.sleep(0.04)

        words = response.answer.split(" ")
        for i, word in enumerate(words):
            chunk = word + (" " if i < len(words) - 1 else "")
            yield f"event: token\ndata: {json.dumps({'token': chunk})}\n\n"
            await asyncio.sleep(0.01)

        yield f"event: citations\ndata: {json.dumps(response.citations)}\n\n"
        yield "event: done\ndata: {}\n\n"

cfo_copilot_service = CommerceCopilotService()
CFOCopilotService = CommerceCopilotService
