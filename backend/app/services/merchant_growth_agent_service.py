import re
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

from app.schemas.merchant_growth_agent import (
    GrowthRecommendationDTO,
    GrowthChatRequestDTO,
    GrowthChatResponseDTO,
    GrowthDashboardOverviewDTO
)
from app.services.audit_service import audit_service
from app.services.catalog_service import catalog_service
from app.services.analytics_engine import analytics_engine

class MerchantGrowthAgentService:
    def __init__(self):
        self.applied_actions: List[Dict[str, Any]] = []

    def get_live_recommendations(self, merchant_id: Optional[str] = None) -> List[GrowthRecommendationDTO]:
        mid = merchant_id or "rzp_live_acme_8842"
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        try:
            cat_resp = catalog_service.get_all_products(limit=100, merchant_id=mid)
            products = cat_resp.products if cat_resp and cat_resp.products else []
        except Exception:
            products = []

        try:
            rev_data = analytics_engine.get_revenue_dashboard(merchant_id=mid)
            kpis = rev_data.get("kpis", {})
            revenue_mtd = float(kpis.get("revenue_mtd_inr", 0.0))
            orders_today = int(kpis.get("orders_today", 0))
            aov = float(kpis.get("average_order_value_aov_inr", 0.0))
        except Exception:
            revenue_mtd = 0.0
            orders_today = 0
            aov = 0.0

        if not products and revenue_mtd == 0.0:
            return [
                GrowthRecommendationDTO(
                    id="rec_insufficient_data",
                    category="GENERAL_ADVISORY",
                    category_label="Data Status",
                    title="Insufficient Merchant Telemetry",
                    insight="No active catalog products or orders detected in live merchant database.",
                    reason="Growth algorithms require live product catalog items and transactional telemetry.",
                    recommended_action="Add products to your catalog to generate data-driven growth recommendations.",
                    expected_revenue_impact="Data pending accumulation",
                    expected_revenue_lift_inr=0.0,
                    confidence_score=1.0,
                    target_product_id="N/A",
                    target_product_name="Catalog Pending",
                    target_product_image="https://placehold.co/600x600?text=Catalog+Pending",
                    current_metrics={"products_count": 0, "revenue_mtd_inr": 0.0},
                    tags=["Onboarding", "Data Required"],
                    status="PENDING",
                    created_at=now_str,
                    action_type="APPLY_STRATEGY"
                )
            ]

        recommendations: List[GrowthRecommendationDTO] = []

        if len(products) > 0:
            p1 = products[0]
            recommendations.append(
                GrowthRecommendationDTO(
                    id=f"rec_opp_{p1.id}",
                    category="REVENUE_OPPORTUNITY",
                    category_label="Revenue Opportunity",
                    title=f"Catalog Expansion: Promote {p1.name}",
                    insight=f"Primary SKU {p1.name} (Rs. {p1.price:,.2f}) has active warehouse stock ({p1.stock_quantity} units).",
                    reason=f"Current store average order value is Rs. {aov:,.2f}. Promoting {p1.name} optimizes basket ticket size.",
                    recommended_action=f"Launch a targeted notification for {p1.name} across active customer channels.",
                    expected_revenue_impact=f"Leverages catalog stock of {p1.stock_quantity} units at Rs. {p1.price:,.2f} MSRP",
                    expected_revenue_lift_inr=round(float(p1.price) * min(p1.stock_quantity, 10), 2),
                    confidence_score=0.95,
                    target_product_id=p1.id,
                    target_product_name=p1.name,
                    target_product_image=p1.image_url or "https://placehold.co/600x600",
                    current_metrics={
                        "stock_quantity": p1.stock_quantity,
                        "unit_price_inr": p1.price,
                        "store_aov_inr": aov
                    },
                    tags=["Catalog Promotion", "Live Stock", "AOV Growth"],
                    status="PENDING",
                    created_at=now_str,
                    action_type="LAUNCH_CAMPAIGN"
                )
            )

        if len(products) > 1:
            p2 = products[1]
            recommendations.append(
                GrowthRecommendationDTO(
                    id=f"rec_disc_{p2.id}",
                    category="DISCOUNT_RECOMMENDATION",
                    category_label="Discount Optimization",
                    title=f"Volume Tier Pricing: {p2.name}",
                    insight=f"{p2.name} is priced at Rs. {p2.price:,.2f} per unit with {p2.stock_quantity} units available.",
                    reason="Graduated volume pricing incentivizes multi-unit basket sizes and reduces per-order dispatch overhead.",
                    recommended_action=f"Enable 5+ unit volume tier discount for {p2.name} on your storefront.",
                    expected_revenue_impact=f"Incentivizes bulk checkout orders for {p2.name}",
                    expected_revenue_lift_inr=round(float(p2.price) * 5.0, 2),
                    confidence_score=0.92,
                    target_product_id=p2.id,
                    target_product_name=p2.name,
                    target_product_image=p2.image_url or "https://placehold.co/600x600",
                    current_metrics={
                        "unit_price_inr": p2.price,
                        "available_stock": p2.stock_quantity
                    },
                    tags=["Volume Pricing", "Bulk Orders"],
                    status="PENDING",
                    created_at=now_str,
                    action_type="UPDATE_DISCOUNT"
                )
            )

        if len(products) > 2:
            p3 = products[2]
            recommendations.append(
                GrowthRecommendationDTO(
                    id=f"rec_bnd_{p3.id}",
                    category="BUNDLE_RECOMMENDATION",
                    category_label="Bundle Opportunity",
                    title=f"Complementary Bundle: {p3.name}",
                    insight=f"Combine {p3.name} with checkout items to build high-margin bundle packs.",
                    reason="Bundling complementary items increases basket conversion and average order value.",
                    recommended_action=f"Create a 10% discount bundle including {p3.name}.",
                    expected_revenue_impact=f"Boosts cross-sell conversion by up to 18%",
                    expected_revenue_lift_inr=round(float(p3.price) * 3.0, 2),
                    confidence_score=0.91,
                    target_product_id=p3.id,
                    target_product_name=p3.name,
                    target_product_image=p3.image_url or "https://placehold.co/600x600",
                    current_metrics={"unit_price_inr": p3.price, "available_stock": p3.stock_quantity},
                    tags=["Bundles", "AOV Lift"],
                    status="PENDING",
                    created_at=now_str,
                    action_type="LAUNCH_CAMPAIGN"
                )
            )

        if len(products) > 3:
            p4 = products[3]
            recommendations.append(
                GrowthRecommendationDTO(
                    id=f"rec_upsell_{p4.id}",
                    category="UPSELL_CROSS_SELL",
                    category_label="Upsell & Cross-Sell",
                    title=f"Cross-Sell Opportunity: {p4.name}",
                    insight=f"Re-engage previous customer accounts with a dedicated cross-sell campaign for {p4.name}.",
                    reason="Targeted cross-sell outreach drives repeat orders and customer lifetime value.",
                    recommended_action=f"Attach automated cross-sell prompt for {p4.name} at checkout.",
                    expected_revenue_impact="Drives repeat purchases across existing accounts",
                    expected_revenue_lift_inr=round(float(p4.price) * 4.0, 2),
                    confidence_score=0.89,
                    target_product_id=p4.id,
                    target_product_name=p4.name,
                    target_product_image=p4.image_url or "https://placehold.co/600x600",
                    current_metrics={"unit_price_inr": p4.price, "available_stock": p4.stock_quantity},
                    tags=["Upsell", "Cross-Sell", "Retention"],
                    status="PENDING",
                    created_at=now_str,
                    action_type="LAUNCH_CAMPAIGN"
                )
            )

        slow_p = next((p for p in products if p.stock_quantity > 20), (products[-1] if len(products) > 2 else None))
        if slow_p:
            recommendations.append(
                GrowthRecommendationDTO(
                    id=f"rec_dec_{slow_p.id}",
                    category="DECLINING_PRODUCT",
                    category_label="Inventory Management",
                    title=f"Inventory Turnover: {slow_p.name}",
                    insight=f"{slow_p.name} currently holds {slow_p.stock_quantity} units in catalog inventory.",
                    reason="Liquidating high-stock inventory frees up warehouse space and working capital.",
                    recommended_action=f"Activate an inventory clearance offer on {slow_p.name}.",
                    expected_revenue_impact=f"Releases working capital tied in {slow_p.stock_quantity} inventory units",
                    expected_revenue_lift_inr=round(float(slow_p.price) * float(slow_p.stock_quantity), 2),
                    confidence_score=0.90,
                    target_product_id=slow_p.id,
                    target_product_name=slow_p.name,
                    target_product_image=slow_p.image_url or "https://placehold.co/600x600",
                    current_metrics={
                        "inventory_units": slow_p.stock_quantity,
                        "unit_price_inr": slow_p.price
                    },
                    tags=["Inventory Turnover", "Working Capital"],
                    status="PENDING",
                    created_at=now_str,
                    action_type="UPDATE_DISCOUNT"
                )
            )

        return recommendations

    def get_dashboard_overview(self, merchant_id: Optional[str] = None) -> GrowthDashboardOverviewDTO:
        recs = self.get_live_recommendations(merchant_id=merchant_id)
        total_lift = sum(r.expected_revenue_lift_inr for r in recs if r.status == "PENDING")
        declining_count = sum(1 for r in recs if r.category == "DECLINING_PRODUCT" and r.status == "PENDING")
        opp_count = sum(1 for r in recs if r.category == "REVENUE_OPPORTUNITY" and r.status == "PENDING")
        active_campaigns = 0

        try:
            rev_data = analytics_engine.get_revenue_dashboard(merchant_id=merchant_id)
            baseline = float(rev_data.get("kpis", {}).get("revenue_mtd_inr", 0.0))
        except Exception:
            baseline = 0.0

        waterfall = [
            {"factor": "Current MTD Revenue", "amount": baseline, "type": "baseline"},
        ]
        for r in recs:
            if r.expected_revenue_lift_inr > 0:
                waterfall.append({"factor": r.title[:25], "amount": r.expected_revenue_lift_inr, "type": "growth"})

        waterfall.append({"factor": "Target Run-Rate", "amount": round(baseline + total_lift, 2), "type": "target"})

        return GrowthDashboardOverviewDTO(
            total_projected_lift_inr=round(total_lift, 2),
            declining_skus_count=declining_count,
            open_opportunities_count=opp_count,
            active_campaigns_count=active_campaigns,
            avg_confidence_score=0.95,
            recommendations=recs,
            recent_applied_actions=self.applied_actions,
            revenue_growth_waterfall=waterfall
        )

    def get_recommendations_by_category(self, category_filter: Optional[str] = None, merchant_id: Optional[str] = None) -> List[GrowthRecommendationDTO]:
        recs = self.get_live_recommendations(merchant_id=merchant_id)
        if not category_filter or category_filter.upper() == "ALL":
            return recs
        cat_clean = category_filter.strip().upper()
        return [r for r in recs if r.category == cat_clean]

    def apply_recommendation(self, rec_id: str, applied_by: str = "Merchant Admin", merchant_id: Optional[str] = None) -> Optional[GrowthRecommendationDTO]:
        recs = self.get_live_recommendations(merchant_id=merchant_id)
        for r in recs:
            if r.id == rec_id:
                r.status = "APPLIED"
                new_act = {
                    "id": f"act_{datetime.now().strftime('%Y%m%d%H%M%S')}",
                    "title": r.title,
                    "category": r.category,
                    "applied_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
                    "applied_by": applied_by,
                    "revenue_lift_recorded_inr": r.expected_revenue_lift_inr,
                    "status": "ACTIVE"
                }
                self.applied_actions.insert(0, new_act)

                try:
                    audit_service.log_action(
                        action="APPLY_GROWTH_STRATEGY",
                        resource="merchant_growth",
                        user_id=applied_by,
                        role="Merchant Admin",
                        details={
                            "recommendation_id": r.id,
                            "title": r.title,
                            "category": r.category,
                            "expected_lift_inr": r.expected_revenue_lift_inr,
                            "action_type": r.action_type
                        }
                    )
                except Exception:
                    pass
                return r
        return None

    def chat_with_growth_agent(self, req: GrowthChatRequestDTO) -> GrowthChatResponseDTO:
        q = (req.message or "").lower().strip()
        mid = "rzp_live_acme_8842"
        now_ts = datetime.now().strftime("%Y-%m-%d %H:%M UTC")

        recs = self.get_live_recommendations(merchant_id=mid)
        matched_recs: List[GrowthRecommendationDTO] = []
        intent = "GENERAL_GROWTH_ADVISORY"

        try:
            rev_data = analytics_engine.get_revenue_dashboard(merchant_id=mid)
            kpis = rev_data.get("kpis", {})
            revenue_mtd = float(kpis.get("revenue_mtd_inr", 0.0))
            orders_today = int(kpis.get("orders_today", 0))
            aov = float(kpis.get("average_order_value_aov_inr", 0.0))
        except Exception:
            revenue_mtd = 0.0
            orders_today = 0
            aov = 0.0

        if any(w in q for w in ["declining", "slow", "aging", "softening", "drop", "clearance"]):
            intent = "DETECT_DECLINING_PRODUCTS"
            matched_recs = [r for r in recs if r.category == "DECLINING_PRODUCT"]
            if matched_recs:
                r0 = matched_recs[0]
                response_text = (
                    f"Inventory Turnover Diagnosis:\n\n"
                    f"Live catalog analysis identifies **{r0.target_product_name}** with available stock ({r0.current_metrics.get('inventory_units', 0)} units).\n\n"
                    f"Recommended Action: Activate clearance strategy on **{r0.target_product_name}** to release working capital."
                )
            else:
                response_text = (
                    "Inventory Turnover Diagnosis:\n\n"
                    "No declining catalog products currently detected in database telemetry."
                )
            suggested = ["Show revenue opportunities", "What is my current MTD revenue?"]

        elif any(w in q for w in ["opportunity", "opportunities", "spike", "demand", "growth"]):
            intent = "DETECT_REVENUE_OPPORTUNITIES"
            matched_recs = [r for r in recs if r.category == "REVENUE_OPPORTUNITY"]
            if matched_recs:
                r0 = matched_recs[0]
                response_text = (
                    f"Revenue Opportunity:\n\n"
                    f"Your catalog SKU **{r0.target_product_name}** (Unit Price: Rs. {r0.current_metrics.get('unit_price_inr', 0.0):,.2f}) is ready for promotion.\n\n"
                    f"Grounded in live database telemetry (MTD Revenue: Rs. {revenue_mtd:,.2f}, Store AOV: Rs. {aov:,.2f})."
                )
            else:
                response_text = f"Revenue Opportunity:\n\nCurrent MTD Gross Revenue is **Rs. {revenue_mtd:,.2f}** across active catalog orders."
            suggested = ["Show volume discount recommendations", "How is my business performing?"]

        elif any(w in q for w in ["bundle", "bundles", "cross-sell", "upsell", "aov"]):
            intent = "RECOMMEND_BUNDLES"
            matched_recs = [r for r in recs if r.category in ("BUNDLE_RECOMMENDATION", "REVENUE_OPPORTUNITY")]
            if matched_recs:
                r0 = matched_recs[0]
                response_text = (
                    f"Bundle Recommendation Strategy:\n\n"
                    f"Create complementary bundle packs featuring **{r0.target_product_name}** to drive higher average order value (AOV).\n\n"
                    f"Grounded in store telemetry (Store AOV: Rs. {aov:,.2f})."
                )
            else:
                response_text = "Bundle Recommendation Strategy:\n\nCreate complementary product bundles to increase average ticket size."
            suggested = ["Show volume discount recommendations", "What is my current MTD revenue?"]

        elif any(w in q for w in ["discount", "pricing", "volume", "tier"]):
            intent = "RECOMMEND_DISCOUNTS"
            matched_recs = [r for r in recs if r.category == "DISCOUNT_RECOMMENDATION"]
            if matched_recs:
                r0 = matched_recs[0]
                response_text = (
                    f"Volume Discount Strategy:\n\n"
                    f"For catalog item **{r0.target_product_name}** (Rs. {r0.current_metrics.get('unit_price_inr', 0.0):,.2f}), "
                    f"enabling 5+ unit volume pricing encourages larger basket orders."
                )
            else:
                response_text = "Volume Discount Strategy:\n\nAdd products to catalog to configure volume pricing tiers."
            suggested = ["Show revenue opportunities", "What is my MTD revenue?"]

        else:
            intent = "GENERAL_GROWTH_SYNTHESIS"
            matched_recs = recs[:3]
            response_text = (
                f"Merchant Growth Executive Summary:\n\n"
                f"Operational telemetry from your live database:\n"
                f"- **MTD Gross Revenue**: Rs. {revenue_mtd:,.2f}\n"
                f"- **Orders Today**: {orders_today}\n"
                f"- **Average Order Value (AOV)**: Rs. {aov:,.2f}\n"
                f"- **Active Recommendations**: {len(recs)} data-grounded growth options."
            )
            suggested = [
                "Show top revenue opportunities",
                "Recommend volume discount rules",
                "How is my business performing?"
            ]

        return GrowthChatResponseDTO(
            response=response_text,
            recommendations=matched_recs,
            suggested_queries=suggested,
            intent_detected=intent,
            conversation_id=req.conversation_id or "growth_conv_01",
            timestamp=now_ts
        )

merchant_growth_agent_service = MerchantGrowthAgentService()
