import re
import json
import random
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

class MerchantGrowthAgentService:
    def __init__(self):
        self._init_recommendations()
        self.applied_actions: List[Dict[str, Any]] = [
            {
                "id": "act_001",
                "title": "Automated Thermal Paper 15% Volume Tier Applied",
                "category": "DISCOUNT_RECOMMENDATION",
                "applied_at": (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d %H:%M"),
                "applied_by": "Autonomous Growth Agent",
                "revenue_lift_recorded_inr": 84500.0,
                "status": "ACTIVE"
            },
            {
                "id": "act_002",
                "title": "Retail Counter Pro Bundle Live on Storefront",
                "category": "BUNDLE_RECOMMENDATION",
                "applied_at": (datetime.now() - timedelta(days=5)).strftime("%Y-%m-%d %H:%M"),
                "applied_by": "Merchant Admin",
                "revenue_lift_recorded_inr": 194000.0,
                "status": "ACTIVE"
            }
        ]

    def _init_recommendations(self):
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.recommendations: List[GrowthRecommendationDTO] = [
            # 1. DECLINING PRODUCT
            GrowthRecommendationDTO(
                id="rec_dec_pos_v1_legacy",
                category="DECLINING_PRODUCT",
                category_label="Declining Product",
                title="Clearance Action: Android POS Terminal V2 Lite Velocity Softening",
                insight="Sales velocity for POS V2 Lite decreased by 38.4% over the last 14 days, with 142 units aging past 60 days of warehouse holding.",
                reason="Customer demand has shifted toward the newer POS V3 Pro. Holding costs and capital lock-in are eroding gross margin by ₹42,000/month.",
                recommended_action="Activate a 12% Flash Clearance Discount bundled with 6 months of free Razorpay AutoPay voice alerts to liquidate remaining inventory.",
                expected_revenue_impact="+₹2,14,000 in unlocked working capital within 21 days",
                expected_revenue_lift_inr=214000.0,
                confidence_score=0.94,
                target_product_id="prod_rzp_pos_mini_x",
                target_product_name="Razorpay Android POS Terminal V2 Lite",
                target_product_image="https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600&auto=format&fit=crop&q=80",
                current_metrics={
                    "velocity_drop_pct": -38.4,
                    "inventory_holding_units": 142,
                    "holding_cost_monthly_inr": 42000.0,
                    "historical_conversion_rate_pct": 2.1
                },
                tags=["Inventory Liquidation", "Aging Stock", "Working Capital"],
                status="PENDING",
                created_at=now_str,
                action_type="UPDATE_DISCOUNT"
            ),

            # 2. REVENUE OPPORTUNITY
            GrowthRecommendationDTO(
                id="rec_opp_soundbox_tier2",
                category="REVENUE_OPPORTUNITY",
                category_label="Revenue Opportunity",
                title="Surging Demand: Audio Soundbox 4G Voice Alert Spike in Tier-2 Metros",
                insight="Storefront search queries for 'Voice Soundbox' and 'QR Speaker' surged 142% this week, with 88% of high-volume merchants purchasing POS without voice verification.",
                reason="Retail merchants experiencing UPI counter disputes seek instant auditory payment confirmations to prevent cashier queue fraud.",
                recommended_action="Deploy an autonomous WhatsApp AutoPay replenishment campaign targeting 850 active POS owners offering Soundbox 4G with 1-click mandate checkout.",
                expected_revenue_impact="+₹3,85,000 monthly recurring gross revenue",
                expected_revenue_lift_inr=385000.0,
                confidence_score=0.96,
                target_product_id="prod_rzp_soundbox_v2",
                target_product_name="Razorpay Audio Soundbox 4G Voice Alert",
                target_product_image="https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&auto=format&fit=crop&q=80",
                current_metrics={
                    "search_surge_pct": +142.0,
                    "target_audience_merchants": 850,
                    "projected_conversion_rate_pct": 18.5,
                    "unit_mrp_inr": 2499.0
                },
                tags=["Search Spike", "AOV Expansion", "Cross-Sell Campaign"],
                status="PENDING",
                created_at=now_str,
                action_type="LAUNCH_CAMPAIGN"
            ),

            # 3. DISCOUNT RECOMMENDATION
            GrowthRecommendationDTO(
                id="rec_disc_paper_volume_tier",
                category="DISCOUNT_RECOMMENDATION",
                category_label="Discount Optimization",
                title="Dynamic Volume Tier Pricing: Thermal Receipt Paper Rolls",
                insight="74% of merchants purchase single paper packs (₹1,998) every month instead of buying bulk cartons, generating elevated per-unit courier overhead.",
                reason="Tier-based price elasticity modeling indicates a 15% discount on 10+ packs increases reorder quantity by 3.2x while saving ₹180/order in shipping consolidation.",
                recommended_action="Implement graduated volume discount: 1-4 packs = 0% off, 5-9 packs = 8% off, 10+ packs = 15% off + Free Express Shipping.",
                expected_revenue_impact="+₹1,92,000 / month in net retained margin via bulk logistics savings",
                expected_revenue_lift_inr=192000.0,
                confidence_score=0.92,
                target_product_id="prod_paper_rolls_20",
                target_product_name="Thermal POS Receipt Paper Rolls (Pack of 20)",
                target_product_image="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80",
                current_metrics={
                    "single_pack_buyer_share_pct": 74.0,
                    "avg_reorder_interval_days": 28,
                    "shipping_cost_saving_per_unit_inr": 180.0
                },
                tags=["Volume Pricing", "Logistics Savings", "Reorder Retention"],
                status="PENDING",
                created_at=now_str,
                action_type="UPDATE_DISCOUNT"
            ),

            # 4. BUNDLE RECOMMENDATION
            GrowthRecommendationDTO(
                id="rec_bnd_retail_pro_counter",
                category="BUNDLE_RECOMMENDATION",
                category_label="Bundle Builder",
                title="High-Converting Bundle: 'Complete Retail Pro Counter Station'",
                insight="Market basket analysis reveals an Apriori Lift of 2.84 and 82.4% co-purchase confidence between POS Terminals, Soundboxes, and Thermal Paper.",
                reason="Merchants purchasing components separately experience setup delays and 14% cart abandonment at the accessories step.",
                recommended_action="Publish 'Complete Retail Pro Counter Station' (POS V3 Pro + Soundbox 4G + 20 Rolls + 1-Year Rapid Warranty) at ₹18,999 (saving customer ₹3,496).",
                expected_revenue_impact="+₹4,60,000 / month gross revenue lift (+22.4% AOV expansion)",
                expected_revenue_lift_inr=460000.0,
                confidence_score=0.95,
                target_product_id="prod_rzp_pos_v3_pro",
                target_product_name="Complete Retail Pro Counter Station",
                target_product_image="https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600&auto=format&fit=crop&q=80",
                current_metrics={
                    "basket_lift_score": 2.84,
                    "co_purchase_confidence_pct": 82.4,
                    "individual_components_sum_inr": 22495.0,
                    "bundle_price_inr": 18999.0
                },
                tags=["Market Basket", "AOV Growth", "1-Click Checkout"],
                status="PENDING",
                created_at=now_str,
                action_type="CREATE_BUNDLE"
            ),

            # 5. CROSS-SELL & UPSELL
            GrowthRecommendationDTO(
                id="rec_upsell_field_installation",
                category="UPSELL_CROSS_SELL",
                category_label="Cross-Sell & Upsell",
                title="Service Cross-Sell: Attach Certified Field Installation at Checkout",
                insight="High-value terminal buyers have a 68% attach willingness for on-site technician installation, but currently must navigate a separate service catalog.",
                reason="Self-installation leads to 6.8% setup friction returns. Attaching Certified Installation (₹499) at checkout slashes returns by 72% and adds instant high-margin service revenue.",
                recommended_action="Inject 1-click 'Razorpay Certified Installation' checkbox on terminal product pages and cart drawer with instant AutoPay authorization.",
                expected_revenue_impact="+₹1,45,000 monthly pure-margin services revenue + ₹82,000 saved return overhead",
                expected_revenue_lift_inr=227000.0,
                confidence_score=0.97,
                target_product_id="serv_pos_std",
                target_product_name="Razorpay Certified Field Installation Service",
                target_product_image="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
                current_metrics={
                    "attach_intent_pct": 68.0,
                    "service_fee_inr": 499.0,
                    "return_rate_reduction_pct": 72.0,
                    "margin_contribution_pct": 85.0
                },
                tags=["Zero-Cost Revenue", "Return Risk Reduction", "Customer Delight"],
                status="PENDING",
                created_at=now_str,
                action_type="APPLY_STRATEGY"
            )
        ]

    def get_dashboard_overview(self) -> GrowthDashboardOverviewDTO:
        total_lift = sum(r.expected_revenue_lift_inr for r in self.recommendations if r.status == "PENDING")
        declining_count = sum(1 for r in self.recommendations if r.category == "DECLINING_PRODUCT" and r.status == "PENDING")
        opp_count = sum(1 for r in self.recommendations if r.category == "REVENUE_OPPORTUNITY" and r.status == "PENDING")
        active_campaigns = 4

        waterfall = [
            {"factor": "Current Monthly Gross", "amount": 1845000.0, "type": "baseline"},
            {"factor": "Bundle Optimization", "amount": 460000.0, "type": "growth"},
            {"factor": "Soundbox Demand Capture", "amount": 385000.0, "type": "growth"},
            {"factor": "Installation Cross-Sell", "amount": 227000.0, "type": "growth"},
            {"factor": "Aging Stock Clearance", "amount": 214000.0, "type": "growth"},
            {"factor": "Volume Tier Margin", "amount": 192000.0, "type": "growth"},
            {"factor": "Target Projected Run-Rate", "amount": 3323000.0, "type": "target"}
        ]

        return GrowthDashboardOverviewDTO(
            total_projected_lift_inr=total_lift,
            declining_skus_count=declining_count,
            open_opportunities_count=opp_count,
            active_campaigns_count=active_campaigns,
            avg_confidence_score=0.948,
            recommendations=self.recommendations,
            recent_applied_actions=self.applied_actions,
            revenue_growth_waterfall=waterfall
        )

    def get_recommendations_by_category(self, category_filter: Optional[str] = None) -> List[GrowthRecommendationDTO]:
        if not category_filter or category_filter.upper() == "ALL":
            return self.recommendations
        cat_clean = category_filter.strip().upper()
        return [r for r in self.recommendations if r.category == cat_clean]

    def apply_recommendation(self, rec_id: str, applied_by: str = "Merchant Admin") -> Optional[GrowthRecommendationDTO]:
        for r in self.recommendations:
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
                return r
        return None

    def chat_with_growth_agent(self, req: GrowthChatRequestDTO) -> GrowthChatResponseDTO:
        q = (req.message or "").lower().strip()
        matched_recs: List[GrowthRecommendationDTO] = []
        intent = "GENERAL_GROWTH_ADVISORY"
        now_ts = datetime.now().strftime("%Y-%m-%d %H:%M UTC")

        if any(w in q for w in ["declining", "slow", "aging", "softening", "drop", "losing sales", "clearance"]):
            intent = "DETECT_DECLINING_PRODUCTS"
            matched_recs = [r for r in self.recommendations if r.category == "DECLINING_PRODUCT"]
            response_text = (
                "📉 **Declining Products Diagnosis:**\n\n"
                "I detected softening velocity on the **Android POS Terminal V2 Lite** (-38.4% velocity over 14 days, 142 units aging in storage).\n\n"
                "Holding costs are locking up **₹42,000/month** in working capital. "
                "I recommend launching an autonomous **12% Flash Clearance Sale** bundled with AutoPay Voice Alerts to liquidate all aging stock within 21 days."
            )
            suggested = [
                "Apply the 12% clearance discount now",
                "Show revenue opportunities instead",
                "How much working capital is locked up?"
            ]

        elif any(w in q for w in ["opportunity", "opportunities", "spike", "demand", "surge", "growth"]):
            intent = "DETECT_REVENUE_OPPORTUNITIES"
            matched_recs = [r for r in self.recommendations if r.category == "REVENUE_OPPORTUNITY"]
            response_text = (
                "🚀 **Top Revenue Opportunity Detected:**\n\n"
                "Storefront demand for **Voice Alert Soundboxes** is up **142% this week** in Tier-2 retail markets! "
                "Currently, 88% of your terminal owners do not have auditory voice verification.\n\n"
                "By launching an automated WhatsApp AutoPay replenishment offer for 850 verified merchants, "
                "we predict an immediate **+₹3,85,000 monthly gross revenue lift**."
            )
            suggested = [
                "Launch the WhatsApp Soundbox campaign",
                "Show bundle recommendations",
                "What is the expected conversion rate?"
            ]

        elif any(w in q for w in ["discount", "discounts", "pricing", "volume", "tier", "price"]):
            intent = "RECOMMEND_DISCOUNTS"
            matched_recs = [r for r in self.recommendations if r.category == "DISCOUNT_RECOMMENDATION"]
            response_text = (
                "🏷️ **Smart Volume Discount Strategy:**\n\n"
                "Currently, 74% of merchants purchase single paper packs every month, racking up individual shipping costs. "
                "I recommend a graduated **Volume Tier Pricing Rule**:\n\n"
                "• **1-4 units**: Standard price\n"
                "• **5-9 units**: 8% off\n"
                "• **10+ units**: 15% off + Free Delhivery Express\n\n"
                "This consolidates dispatches, saves ₹180/order in freight, and yields **+₹1,92,000/month** net retained margin."
            )
            suggested = [
                "Enable 15% volume discount tier",
                "Suggest cross-sell products",
                "Show declining products"
            ]

        elif any(w in q for w in ["bundle", "bundles", "pack", "kit", "basket", "aov"]):
            intent = "RECOMMEND_BUNDLES"
            matched_recs = [r for r in self.recommendations if r.category == "BUNDLE_RECOMMENDATION"]
            response_text = (
                "📦 **High-Converting Bundle Recommendation:**\n\n"
                "Using Apriori association mining, I identified a high lift factor (**2.84x**) between POS Terminals, Soundboxes, and Paper Rolls.\n\n"
                "I have generated the **'Complete Retail Pro Counter Station'** bundle:\n"
                "• POS V3 Pro + Soundbox 4G + 20 Paper Rolls + 1-Year Rapid Warranty\n"
                "• Bundle Price: **₹18,999** (Saves customer ₹3,496 vs individual)\n\n"
                "Expected lift: **+₹4,60,000 / month** with a projected **22.4% AOV expansion**."
            )
            suggested = [
                "Publish Retail Pro Bundle to storefront",
                "Show cross-sell add-ons",
                "What is the bundle profit margin?"
            ]

        elif any(w in q for w in ["cross-sell", "cross sell", "upsell", "up-sell", "service", "installation", "addon"]):
            intent = "SUGGEST_UPSELL_CROSS_SELL"
            matched_recs = [r for r in self.recommendations if r.category == "UPSELL_CROSS_SELL"]
            response_text = (
                "🎯 **High-Margin Upsell & Cross-Sell Engine:**\n\n"
                "Terminal buyers have a **68% willingness** to purchase certified on-site installation, yet currently face configuration friction alone.\n\n"
                "Attaching **Razorpay Certified Field Installation (₹499)** directly on product pages and in the cart:\n"
                "• Generates **+₹1,45,000/mo** in 85% pure margin services revenue\n"
                "• Slashes hardware setup returns by **72%** (saving ₹82,000/mo in RTO overhead)"
            )
            suggested = [
                "Activate 1-click installation checkout add-on",
                "Show all open opportunities",
                "Which products are declining?"
            ]

        else:
            intent = "GENERAL_GROWTH_SYNTHESIS"
            matched_recs = self.recommendations[:3]
            response_text = (
                "🤖 **Merchant Growth Agent Online:**\n\n"
                "I am continuously monitoring your sales velocity, order patterns, inventory turnover, customer cohorts, and campaign performance.\n\n"
                f"Currently, I have identified **{len(self.recommendations)} actionable growth levers** representing a projected **+₹14,78,000 monthly revenue lift**.\n\n"
                "Select any recommendation below to inspect explainable reasons or apply 1-click execution."
            )
            suggested = [
                "Which products are declining this week?",
                "Show top revenue opportunities",
                "Recommend high-converting bundles",
                "Suggest volume discount rules"
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
