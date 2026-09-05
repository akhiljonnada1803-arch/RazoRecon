from __future__ import annotations

import uuid
import math
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

from app.schemas.campaign_optimizer import (
    SalesCategoryTrendDTO,
    CampaignOpportunityDTO,
    DailyTrajectoryPointDTO,
    ChannelPerformanceDTO,
    CampaignImprovementDTO,
    OptimizedCampaignDTO,
    GenerateOptimizedCampaignRequestDTO,
    CampaignOptimizerOverviewDTO,
)
from app.services.audit_service import audit_service

# 1. Historical Sales Data
HISTORICAL_SALES: List[SalesCategoryTrendDTO] = [
    SalesCategoryTrendDTO(
        category="Smart POS Terminals",
        historical_revenue=48250000.0,
        order_volume=3420,
        yoy_growth_pct=34.8,
        avg_margin_pct=36.5,
        sales_velocity="HIGH",
        top_selling_sku="Razorpay Android Smart POS"
    ),
    SalesCategoryTrendDTO(
        category="Voice Soundboxes",
        historical_revenue=28400000.0,
        order_volume=18900,
        yoy_growth_pct=142.0,
        avg_margin_pct=28.0,
        sales_velocity="ACCELERATING",
        top_selling_sku="Razorpay Soundbox 4G"
    ),
    SalesCategoryTrendDTO(
        category="Billing Accessories & Paper",
        historical_revenue=6200000.0,
        order_volume=12400,
        yoy_growth_pct=-14.2,
        avg_margin_pct=42.0,
        sales_velocity="DECLINING",
        top_selling_sku="Thermal Paper Rolls 50-Pack"
    ),
    SalesCategoryTrendDTO(
        category="Barcode Scanners & Hardware",
        historical_revenue=14800000.0,
        order_volume=4150,
        yoy_growth_pct=18.4,
        avg_margin_pct=34.0,
        sales_velocity="MODERATE",
        top_selling_sku="Barcode Scanner 2D High Speed"
    ),
    SalesCategoryTrendDTO(
        category="QR Payment Stands",
        historical_revenue=4100000.0,
        order_volume=8900,
        yoy_growth_pct=26.5,
        avg_margin_pct=48.0,
        sales_velocity="HIGH",
        top_selling_sku="Razorpay QR Stand Acrylic"
    )
]

# 2. Campaign Opportunities Identified by AI
IDENTIFIED_OPPORTUNITIES: List[CampaignOpportunityDTO] = [
    CampaignOpportunityDTO(
        id="opp_fy26_hardware_refresh",
        title="Fiscal Year-End Hardware Tax Shield",
        category="Smart POS Terminals",
        target_segment="Enterprise Multi-Store Merchants",
        rationale="Historical sales show an 82% surge in Q4 CapEx asset purchasing before March 31st for Section 32 depreciation benefits.",
        recommended_discount_pct=12.5,
        estimated_revenue_potential=1485000.0,
        confidence_score=0.92,
        target_skus=["Razorpay Android Smart POS", "Barcode Scanner 2D High Speed"]
    ),
    CampaignOpportunityDTO(
        id="opp_soundbox_festive_surge",
        title="Voice Soundbox Regional Blitz",
        category="Voice Soundboxes",
        target_segment="Fast-Growing D2C Retailers",
        rationale="142% YoY surge in instant audio alert hardware demand with 92% sell-through rate among retail storefronts.",
        recommended_discount_pct=15.0,
        estimated_revenue_potential=1120000.0,
        confidence_score=0.95,
        target_skus=["Razorpay Soundbox 4G", "Thermal Paper Rolls 50-Pack"]
    ),
    CampaignOpportunityDTO(
        id="opp_aged_rolls_clearance",
        title="Slow-Moving Paper Roll Volume Clearance",
        category="Billing Accessories & Paper",
        target_segment="High-Frequency Retail Merchants",
        rationale="Stock aging at 62 days tying up ₹8.4L in capital; single-pack shipping costs erode margins by 18%.",
        recommended_discount_pct=22.0,
        estimated_revenue_potential=384000.0,
        confidence_score=0.88,
        target_skus=["Thermal Paper Rolls 50-Pack", "POS Terminal Roll 10-Pack"]
    ),
    CampaignOpportunityDTO(
        id="opp_dormant_winback",
        title="30-Day Dormant Merchant Reactivation",
        category="Smart POS Terminals",
        target_segment="At-Risk Inactive Merchants",
        rationale="320 merchants dormant >45 days with 68.5% churn risk; reactivation yield is 3.8x cheaper than fresh merchant acquisition.",
        recommended_discount_pct=25.0,
        estimated_revenue_potential=642000.0,
        confidence_score=0.86,
        target_skus=["Razorpay Smart POS Mini", "Razorpay QR Stand Acrylic"]
    )
]

def generate_trajectory(duration_days: int, baseline: float, incremental: float, orders: int) -> List[DailyTrajectoryPointDTO]:
    points: List[DailyTrajectoryPointDTO] = []
    base_daily = baseline / max(1, duration_days)
    lift_daily = incremental / max(1, duration_days)
    now = datetime.now()

    for d in range(1, duration_days + 1):
        progress = d / duration_days
        bell = (1.0 / (1.0 + math.exp(-6.0 * (progress - 0.35)))) - (1.0 / (1.0 + math.exp(-6.0 * (progress - 0.88))))
        bell = max(0.05, bell)

        day_base = round(base_daily * (0.95 + 0.1 * math.sin(d)), 2)
        day_inc = round(lift_daily * (0.6 + bell * 1.6), 2)
        day_camp = round(day_base + day_inc, 2)
        conv_rate = round(8.4 + bell * 4.8, 1)
        day_orders = max(1, int(round((orders / duration_days) * (0.7 + bell * 1.3))))

        points.append(DailyTrajectoryPointDTO(
            day=d,
            date_label=(now + timedelta(days=d)).strftime("%b %d"),
            baseline_revenue=day_base,
            campaign_revenue=day_camp,
            incremental_lift=day_inc,
            conversion_rate_pct=conv_rate,
            orders_count=day_orders
        ))
    return points

CHANNEL_BENCHMARKS: List[ChannelPerformanceDTO] = [
    ChannelPerformanceDTO(
        channel="WhatsApp Business",
        sent_count=18400,
        open_rate_pct=88.5,
        click_through_rate_pct=19.4,
        conversion_rate_pct=8.2,
        revenue_generated=1845000.0,
        roas=6.8
    ),
    ChannelPerformanceDTO(
        channel="Email Direct",
        sent_count=32000,
        open_rate_pct=28.2,
        click_through_rate_pct=4.1,
        conversion_rate_pct=2.4,
        revenue_generated=820000.0,
        roas=3.2
    ),
    ChannelPerformanceDTO(
        channel="In-App Banner",
        sent_count=45000,
        open_rate_pct=92.0,
        click_through_rate_pct=11.6,
        conversion_rate_pct=5.8,
        revenue_generated=1120000.0,
        roas=5.4
    ),
    ChannelPerformanceDTO(
        channel="SMS Gateway",
        sent_count=12500,
        open_rate_pct=64.0,
        click_through_rate_pct=3.8,
        conversion_rate_pct=1.9,
        revenue_generated=310000.0,
        roas=2.6
    )
]

class CampaignOptimizerService:
    def __init__(self):
        self.sales_trends = HISTORICAL_SALES
        self.opportunities = IDENTIFIED_OPPORTUNITIES
        self.channel_metrics = CHANNEL_BENCHMARKS
        self.campaigns: List[OptimizedCampaignDTO] = self._init_default_campaigns()
        self.improvements: List[CampaignImprovementDTO] = self._init_default_improvements()

    def _init_default_campaigns(self) -> List[OptimizedCampaignDTO]:
        c1_traj = generate_trajectory(14, 6200000.0, 1485000.0, 185)
        c2_traj = generate_trajectory(14, 3800000.0, 1120000.0, 340)
        c3_traj = generate_trajectory(10, 1200000.0, 384000.0, 142)
        c4_traj = generate_trajectory(21, 1850000.0, 642000.0, 98)

        now = datetime.now()
        return [
            OptimizedCampaignDTO(
                id="camp_fy_refresh_2026",
                name="Fiscal Year-End Hardware Refresh 2026",
                target_products=[
                    "Razorpay Android Smart POS",
                    "Barcode Scanner 2D High Speed"
                ],
                campaign_objective="Drive FY26 Year-End Hardware Upgrades & MCA Tax Compliance",
                predicted_roi=340.0,
                predicted_roi_display="340% ROI",
                estimated_revenue_increase=1485000.0,
                estimated_revenue_increase_display="+₹14,85,000 (+24.5%)",
                confidence_score=0.92,
                suggested_discount_pct=12.5,
                discount_code="FY26TAXREFRESH",
                target_segment="Enterprise Multi-Store Merchants",
                target_segment_id="seg_enterprise",
                status="active",
                channels=["WhatsApp Business", "Email Direct"],
                campaign_spend_budget=45000.0,
                baseline_revenue=6200000.0,
                projected_total_gmv=7685000.0,
                projected_orders=185,
                conversion_lift_pct=28.4,
                price_elasticity=1.35,
                net_margin_impact_pct=-2.4,
                ai_copy_subject="⚡ FY26 Tax Advantage: Upgrade Your Billing Fleets with 12.5% Tax Credit Voucher",
                ai_copy_body="Upgrade legacy countertop POS terminals to 5G Android Smart Terminals before March 31st. Enjoy instant 12.5% CapEx rebate and zero-cost 1-year AMC maintenance.",
                start_date=(now - timedelta(days=2)).strftime("%Y-%m-%d"),
                end_date=(now + timedelta(days=12)).strftime("%Y-%m-%d"),
                duration_days=14,
                created_at="2026-03-01",
                trajectory=c1_traj,
                channel_performance=self.channel_metrics
            ),
            OptimizedCampaignDTO(
                id="camp_soundbox_blitz",
                name="D2C Soundbox & POS Terminal Blitz",
                target_products=[
                    "Razorpay Soundbox 4G",
                    "Thermal Paper Rolls 50-Pack"
                ],
                campaign_objective="Capture Regional Festive Surge & Expand Countertop Soundbox Footprint",
                predicted_roi=410.0,
                predicted_roi_display="410% ROI",
                estimated_revenue_increase=1120000.0,
                estimated_revenue_increase_display="+₹11,20,000 (+31.8%)",
                confidence_score=0.95,
                suggested_discount_pct=15.0,
                discount_code="SOUNDBOX15",
                target_segment="Fast-Growing D2C Retailers",
                target_segment_id="seg_d2c_growth",
                status="active",
                channels=["WhatsApp Business", "In-App Banner"],
                campaign_spend_budget=38000.0,
                baseline_revenue=3800000.0,
                projected_total_gmv=4920000.0,
                projected_orders=340,
                conversion_lift_pct=34.2,
                price_elasticity=2.10,
                net_margin_impact_pct=-3.0,
                ai_copy_subject="🚀 Scale Your Store Checkouts: 4G Soundbox + Smart POS Bundle at 15% Off",
                ai_copy_body="Empower retail cashiers with multilingual instant voice notifications. Order 2+ units and unlock 15% instant volume cashback.",
                start_date=(now - timedelta(days=1)).strftime("%Y-%m-%d"),
                end_date=(now + timedelta(days=13)).strftime("%Y-%m-%d"),
                duration_days=14,
                created_at="2026-03-02",
                trajectory=c2_traj,
                channel_performance=self.channel_metrics
            ),
            OptimizedCampaignDTO(
                id="camp_aged_rolls_clearance",
                name="Aged Thermal Roll Clearance Surge",
                target_products=[
                    "Thermal Paper Rolls 50-Pack",
                    "POS Terminal Roll 10-Pack"
                ],
                campaign_objective="Clear 60+ Days Aged Stock & Unlock Working Capital",
                predicted_roi=260.0,
                predicted_roi_display="260% ROI",
                estimated_revenue_increase=384000.0,
                estimated_revenue_increase_display="+₹3,84,000 (+32.0%)",
                confidence_score=0.88,
                suggested_discount_pct=22.0,
                discount_code="ROLLSCLEAR22",
                target_segment="High-Frequency Retail Merchants",
                target_segment_id="seg_festive",
                status="scheduled",
                channels=["In-App Banner", "WhatsApp Business"],
                campaign_spend_budget=15000.0,
                baseline_revenue=1200000.0,
                projected_total_gmv=1584000.0,
                projected_orders=142,
                conversion_lift_pct=42.0,
                price_elasticity=2.45,
                net_margin_impact_pct=-6.2,
                ai_copy_subject="🏷️ Flash Clearance: 22% Off Certified High-Speed Thermal Paper Bulk Bundles",
                ai_copy_body="Stock up your store for the quarter. Enjoy 22% volume discount on 50-pack thermal rolls with guaranteed next-day dispatch.",
                start_date=(now + timedelta(days=3)).strftime("%Y-%m-%d"),
                end_date=(now + timedelta(days=13)).strftime("%Y-%m-%d"),
                duration_days=10,
                created_at="2026-03-03",
                trajectory=c3_traj,
                channel_performance=self.channel_metrics
            ),
            OptimizedCampaignDTO(
                id="camp_winback_surge",
                name="At-Risk Merchant 30-Day Winback",
                target_products=[
                    "Razorpay Smart POS Mini",
                    "Razorpay QR Stand Acrylic"
                ],
                campaign_objective="Reactivate Inactive Merchants (>45 Days Dormant) with Free AI Copilot",
                predicted_roi=280.0,
                predicted_roi_display="280% ROI",
                estimated_revenue_increase=642000.0,
                estimated_revenue_increase_display="+₹6,42,000 (+48.2%)",
                confidence_score=0.86,
                suggested_discount_pct=25.0,
                discount_code="WELCOMEBACK25",
                target_segment="At-Risk Inactive Merchants",
                target_segment_id="seg_at_risk",
                status="active",
                channels=["WhatsApp Business", "SMS Gateway"],
                campaign_spend_budget=28000.0,
                baseline_revenue=1850000.0,
                projected_total_gmv=2492000.0,
                projected_orders=98,
                conversion_lift_pct=51.2,
                price_elasticity=2.65,
                net_margin_impact_pct=-5.1,
                ai_copy_subject="🎁 We Miss You! Claim 25% Off + 3 Months Free AI Copilot",
                ai_copy_body="Reactivate your RazorRecon merchant terminal this week. Enjoy 25% discount on all hardware renewals and instant 3-way reconciliation.",
                start_date=(now - timedelta(days=3)).strftime("%Y-%m-%d"),
                end_date=(now + timedelta(days=18)).strftime("%Y-%m-%d"),
                duration_days=21,
                created_at="2026-03-02",
                trajectory=c4_traj,
                channel_performance=self.channel_metrics
            )
        ]

    def _init_default_improvements(self) -> List[CampaignImprovementDTO]:
        return [
            CampaignImprovementDTO(
                id="rec_imp_01",
                campaign_id="camp_soundbox_blitz",
                campaign_name="D2C Soundbox & POS Terminal Blitz",
                recommendation_type="CHANNEL_REALLOCATION",
                insight="WhatsApp Business click-through rate (19.4%) is 4.7x higher than Email (4.1%), yielding 6.8x ROAS.",
                recommended_improvement="Shift 65% of the allocated email ad budget directly to WhatsApp Business broadcast.",
                expected_additional_lift="+₹1,85,000 GMV (+16.5%)",
                expected_lift_inr=185000.0,
                confidence_score=0.94,
                status="PENDING"
            ),
            CampaignImprovementDTO(
                id="rec_imp_02",
                campaign_id="camp_fy_refresh_2026",
                campaign_name="Fiscal Year-End Hardware Refresh 2026",
                recommendation_type="MIN_ORDER_TWEAK",
                insight="Average enterprise order size is ₹78,000, but min order threshold is set to ₹25,000.",
                recommended_improvement="Raise minimum order threshold to ₹45,000 to defend 2.4% gross margin while capturing multi-terminal orders.",
                expected_additional_lift="+₹2,10,000 Net Margin (+14.1%)",
                expected_lift_inr=210000.0,
                confidence_score=0.91,
                status="PENDING"
            ),
            CampaignImprovementDTO(
                id="rec_imp_03",
                campaign_id="camp_winback_surge",
                campaign_name="At-Risk Merchant 30-Day Winback",
                recommendation_type="BUNDLE_ATTACHMENT",
                insight="Dormant merchants purchasing Smart POS Mini show a 72% setup friction drop-off without certified field installation.",
                recommended_improvement="Bundle certified on-site POS installation (₹499 value) into the voucher instead of expanding cash discount.",
                expected_additional_lift="+₹95,000 LTV Retention (+22%)",
                expected_lift_inr=95000.0,
                confidence_score=0.89,
                status="PENDING"
            )
        ]

    def get_overview(self) -> CampaignOptimizerOverviewDTO:
        active = [c for c in self.campaigns if c.status == "active"]
        total_rev_lift = sum(c.estimated_revenue_increase for c in self.campaigns)
        avg_roi = round(sum(c.predicted_roi for c in self.campaigns) / max(1, len(self.campaigns)), 1)
        avg_conf = round(sum(c.confidence_score for c in self.campaigns) / max(1, len(self.campaigns)), 2)

        return CampaignOptimizerOverviewDTO(
            total_campaigns=len(self.campaigns),
            active_campaigns=len(active),
            total_projected_revenue_increase=round(total_rev_lift, 2),
            avg_predicted_roi=avg_roi,
            avg_confidence_score=avg_conf,
            top_performing_channel="WhatsApp Business (ROAS 6.8x)",
            historical_sales_trends=self.sales_trends,
            identified_opportunities=self.opportunities,
            campaigns=self.campaigns,
            active_improvements=self.improvements,
            channel_attribution_summary=self.channel_metrics
        )

    def get_opportunities(self) -> List[CampaignOpportunityDTO]:
        return self.opportunities

    def generate_optimized_campaign(self, req: GenerateOptimizedCampaignRequestDTO) -> OptimizedCampaignDTO:
        # Elasticity modeling:
        # baseline discount 15% -> 30% order lift
        discount = req.suggested_discount_pct or 15.0
        elasticity = 1.95
        conv_lift = round(discount * elasticity, 1)

        baseline_rev = 4500000.0
        projected_orders = int(120 * (1 + conv_lift / 100.0))
        net_lift = round(baseline_rev * (conv_lift / 100.0) * 0.45, 2)
        campaign_budget = 30000.0
        
        # Predicted ROI = (Gross Profit Lift - Spend) / Spend * 100
        gross_profit_lift = net_lift * 0.35
        predicted_roi = max(180.0, round((gross_profit_lift / campaign_budget) * 100, 1))
        confidence = 0.91

        now = datetime.now()
        duration = req.duration_days or 14
        start_date = (now + timedelta(days=1)).strftime("%Y-%m-%d")
        end_date = (now + timedelta(days=duration + 1)).strftime("%Y-%m-%d")

        clean_name = f"AI Optimized: {req.campaign_objective[:36]}"
        discount_code = f"AIOPT{int(discount)}"

        trajectory = generate_trajectory(duration, baseline_rev, net_lift, projected_orders)

        new_camp = OptimizedCampaignDTO(
            id=f"camp_opt_{uuid.uuid4().hex[:8]}",
            name=clean_name,
            target_products=req.target_products,
            campaign_objective=req.campaign_objective,
            predicted_roi=predicted_roi,
            predicted_roi_display=f"{predicted_roi:.0f}% ROI",
            estimated_revenue_increase=net_lift,
            estimated_revenue_increase_display=f"+₹{net_lift:,.0f} (+{conv_lift}%)",
            confidence_score=confidence,
            suggested_discount_pct=discount,
            discount_code=discount_code,
            target_segment=req.target_segment_id,
            target_segment_id=req.target_segment_id,
            status="active",
            channels=req.channels or ["WhatsApp Business", "Email Direct"],
            campaign_spend_budget=campaign_budget,
            baseline_revenue=baseline_rev,
            projected_total_gmv=baseline_rev + net_lift,
            projected_orders=projected_orders,
            conversion_lift_pct=conv_lift,
            price_elasticity=elasticity,
            net_margin_impact_pct=-round(discount * 0.2, 1),
            ai_copy_subject=f"🚀 Special Opportunity: Save {discount:.0f}% on {', '.join(req.target_products[:2])}",
            ai_copy_body=f"Deploy industry-leading hardware and checkout tools with an exclusive {discount:.0f}% voucher code {discount_code}. Includes priority shipping and setup.",
            start_date=start_date,
            end_date=end_date,
            duration_days=duration,
            created_at=now.strftime("%Y-%m-%d"),
            trajectory=trajectory,
            channel_performance=self.channel_metrics
        )

        self.campaigns.insert(0, new_camp)

        # Audit log creation
        audit_service.log_action(
            action="AI_CAMPAIGN_OPTIMIZER_CREATED",
            resource="CAMPAIGN_OPTIMIZER",
            user_id="system_growth_agent",
            role="AGENT",
            details={
                "campaign_id": new_camp.id,
                "campaign_objective": new_camp.campaign_objective,
                "target_products": new_camp.target_products,
                "predicted_roi": new_camp.predicted_roi,
                "estimated_revenue_increase": new_camp.estimated_revenue_increase,
                "confidence_score": new_camp.confidence_score,
                "suggested_discount_pct": new_camp.suggested_discount_pct
            }
        )

        return new_camp

    def apply_improvement(self, rec_id: str, actor_id: str = "merchant_admin") -> Optional[CampaignImprovementDTO]:
        for imp in self.improvements:
            if imp.id == rec_id:
                imp.status = "APPLIED"
                imp.applied_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                # Also update corresponding campaign if matched
                for cmp in self.campaigns:
                    if cmp.id == imp.campaign_id:
                        cmp.estimated_revenue_increase += imp.expected_lift_inr
                        cmp.estimated_revenue_increase_display = f"+₹{cmp.estimated_revenue_increase:,.0f} (Optimized)"
                        cmp.predicted_roi += 15.0
                        cmp.predicted_roi_display = f"{cmp.predicted_roi:.0f}% ROI"

                audit_service.log_action(
                    action="CAMPAIGN_IMPROVEMENT_APPLIED",
                    resource="CAMPAIGN_OPTIMIZER",
                    user_id=actor_id,
                    role="MERCHANT",
                    details={
                        "improvement_id": imp.id,
                        "campaign_id": imp.campaign_id,
                        "recommendation_type": imp.recommendation_type,
                        "additional_lift_inr": imp.expected_lift_inr
                    }
                )
                return imp
        return None

campaign_optimizer_service = CampaignOptimizerService()
