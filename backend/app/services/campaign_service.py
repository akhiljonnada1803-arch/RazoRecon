from __future__ import annotations

import uuid
import math
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.schemas.campaign import (
    CustomerSegmentDTO,
    DailyForecastPointDTO,
    CampaignDTO,
    CampaignGenerateRequestDTO,
    CampaignSimulationRequestDTO,
    CampaignSimulationResponseDTO,
    CampaignListResponseDTO
)

# 1. Customer Segmentation Registry
CUSTOMER_SEGMENTS: List[CustomerSegmentDTO] = [
    CustomerSegmentDTO(
        id="seg_enterprise",
        name="High-Volume Enterprise Merchants",
        description="Top 10% gross volume merchants with multi-terminal setups and annual FinOps contracts.",
        merchant_count=540,
        avg_order_value=78000.0,
        total_gmv=42120000.0,
        churn_risk_pct=4.2,
        avg_margin_pct=38.5,
        tags=["High GMV", "Multi-Terminal", "Low Churn", "Annual Tier"],
        recommended_discount_range="8% - 15%",
        optimal_channel="Dedicated RM & Email"
    ),
    CustomerSegmentDTO(
        id="seg_d2c_growth",
        name="Fast-Growing D2C Retailers",
        description="Omnichannel lifestyle, apparel, and electronics brands with expanding offline store counts.",
        merchant_count=1280,
        avg_order_value=18500.0,
        total_gmv=28420000.0,
        churn_risk_pct=12.0,
        avg_margin_pct=32.0,
        tags=["Omnichannel", "Rapid Expansion", "High Elasticity", "POS Heavy"],
        recommended_discount_range="12% - 20%",
        optimal_channel="WhatsApp Business & Portal Push"
    ),
    CustomerSegmentDTO(
        id="seg_at_risk",
        name="At-Risk Inactive Merchants",
        description="Merchants with declining transaction velocity (>45 days without new hardware or license renewal).",
        merchant_count=320,
        avg_order_value=26000.0,
        total_gmv=8320000.0,
        churn_risk_pct=68.5,
        avg_margin_pct=29.0,
        tags=["Declining Velocity", "High Churn Alert", "Winback Target"],
        recommended_discount_range="20% - 30%",
        optimal_channel="WhatsApp Direct & SMS Alert"
    ),
    CustomerSegmentDTO(
        id="seg_festive",
        name="Seasonal Festive & Flash Sellers",
        description="Merchants experiencing peak demand spikes during festival quarters and Q4 sales events.",
        merchant_count=890,
        avg_order_value=14200.0,
        total_gmv=19240000.0,
        churn_risk_pct=22.4,
        avg_margin_pct=34.0,
        tags=["High Seasonality", "Soundbox Heavy", "Fast Turnaround"],
        recommended_discount_range="10% - 18%",
        optimal_channel="In-App Banner & WhatsApp"
    ),
    CustomerSegmentDTO(
        id="seg_onboarding",
        name="New Onboarding Merchants (0-30 Days)",
        description="Recently registered merchants setting up their initial payment stack and billing infrastructure.",
        merchant_count=450,
        avg_order_value=12000.0,
        total_gmv=6250000.0,
        churn_risk_pct=35.0,
        avg_margin_pct=36.0,
        tags=["Trial Users", "First Order Incentive", "High Potential"],
        recommended_discount_range="15% - 25%",
        optimal_channel="Email Welcome Series & WhatsApp"
    )
]

# Segment Map for lookup
SEGMENT_MAP = {s.id: s for s in CUSTOMER_SEGMENTS}

# Elasticity factors by segment
SEGMENT_ELASTICITY: Dict[str, float] = {
    "seg_enterprise": 1.25,
    "seg_d2c_growth": 1.95,
    "seg_at_risk": 2.65,
    "seg_festive": 2.10,
    "seg_onboarding": 2.30
}

def generate_forecast_curve(duration_days: int, baseline_rev: float, net_lift: float, total_orders: int) -> List[DailyForecastPointDTO]:
    points: List[DailyForecastPointDTO] = []
    base_daily = baseline_rev / max(1, duration_days)
    lift_daily_total = net_lift
    now = datetime.now()

    for d in range(1, duration_days + 1):
        # S-curve / bell payoff curve
        progress = d / duration_days
        # Sigmoid distribution density for incremental lift
        weight = (1.0 / (1.0 + math.exp(-6.0 * (progress - 0.4)))) - (1.0 / (1.0 + math.exp(-6.0 * (progress - 0.9))))
        weight = max(0.02, weight)
        
        day_baseline = round(base_daily * (0.95 + 0.1 * math.sin(d)), 2)
        day_incremental = round((lift_daily_total / duration_days) * (0.6 + weight * 1.5), 2)
        day_projected = round(day_baseline + day_incremental, 2)
        day_orders = max(1, int(round((total_orders / duration_days) * (0.7 + weight * 1.2))))
        
        date_str = (now + timedelta(days=d)).strftime("%b %d")
        points.append(DailyForecastPointDTO(
            day=d,
            date_label=date_str,
            baseline_revenue=day_baseline,
            projected_campaign_revenue=day_projected,
            incremental_lift=day_incremental,
            projected_orders=day_orders
        ))
    return points

import os
import sqlite3

MERCHANT_DB_PATH = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "merchant.db"))

class CampaignService:
    def __init__(self, db_path: str = MERCHANT_DB_PATH):
        self.db_path = db_path
        self.segments = CUSTOMER_SEGMENTS
        self._init_db()

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS campaigns (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    target_segment TEXT NOT NULL,
                    target_segment_id TEXT NOT NULL,
                    status TEXT NOT NULL,
                    discount_type TEXT NOT NULL,
                    discount_value REAL NOT NULL,
                    min_order_value REAL DEFAULT 0.0,
                    expected_revenue_lift REAL NOT NULL,
                    expected_revenue_lift_pct REAL NOT NULL,
                    projected_orders INTEGER NOT NULL,
                    projected_gmv REAL NOT NULL,
                    net_margin_impact_pct REAL NOT NULL,
                    roi_percentage REAL NOT NULL,
                    ai_copy_subject TEXT,
                    ai_copy_body TEXT,
                    channels_json TEXT NOT NULL,
                    forecast_days_json TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    start_date TEXT NOT NULL,
                    end_date TEXT NOT NULL,
                    merchant_id TEXT DEFAULT 'rzp_live_acme_8842'
                )
            """)
            conn.commit()

            cursor.execute("SELECT COUNT(*) as count FROM campaigns")
            if cursor.fetchone()["count"] == 0:
                defaults = self._build_default_campaigns()
                for c in defaults:
                    self._insert_campaign_db(cursor, c)
                conn.commit()

    def _insert_campaign_db(self, cursor: sqlite3.Cursor, c: CampaignDTO, merchant_id: str = "rzp_live_acme_8842"):
        channels_str = json.dumps(c.channels or [])
        forecast_str = json.dumps([f.model_dump() if hasattr(f, "model_dump") else dict(f) for f in (c.forecast_days or [])])
        cursor.execute("""
            INSERT OR REPLACE INTO campaigns (
                id, name, target_segment, target_segment_id, status, discount_type, discount_value,
                min_order_value, expected_revenue_lift, expected_revenue_lift_pct, projected_orders,
                projected_gmv, net_margin_impact_pct, roi_percentage, ai_copy_subject, ai_copy_body,
                channels_json, forecast_days_json, created_at, start_date, end_date, merchant_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            c.id, c.name, c.target_segment, c.target_segment_id, c.status, c.discount_type, c.discount_value,
            c.min_order_value, c.expected_revenue_lift, c.expected_revenue_lift_pct, c.projected_orders,
            c.projected_gmv, c.net_margin_impact_pct, c.roi_percentage, c.ai_copy_subject, c.ai_copy_body,
            channels_str, forecast_str, c.created_at, c.start_date, c.end_date, merchant_id
        ))

    def _load_campaigns_db(self, merchant_id: Optional[str] = None) -> List[CampaignDTO]:
        campaigns = []
        with self._get_conn() as conn:
            cursor = conn.cursor()
            if merchant_id:
                cursor.execute("SELECT * FROM campaigns WHERE merchant_id = ? ORDER BY created_at DESC", (merchant_id,))
            else:
                cursor.execute("SELECT * FROM campaigns ORDER BY created_at DESC")
            rows = cursor.fetchall()

            for r in rows:
                row_dict = dict(r)
                try:
                    channels = json.loads(row_dict.get("channels_json") or "[]")
                except Exception:
                    channels = []
                try:
                    forecast_raw = json.loads(row_dict.get("forecast_days_json") or "[]")
                    forecast = [DailyForecastPointDTO(**f) if isinstance(f, dict) else f for f in forecast_raw]
                except Exception:
                    forecast = []

                c_dto = CampaignDTO(
                    id=row_dict["id"],
                    name=row_dict["name"],
                    target_segment=row_dict["target_segment"],
                    target_segment_id=row_dict["target_segment_id"],
                    status=row_dict["status"],
                    discount_type=row_dict["discount_type"],
                    discount_value=float(row_dict["discount_value"]),
                    min_order_value=float(row_dict["min_order_value"]),
                    expected_revenue_lift=float(row_dict["expected_revenue_lift"]),
                    expected_revenue_lift_pct=float(row_dict["expected_revenue_lift_pct"]),
                    projected_orders=int(row_dict["projected_orders"]),
                    projected_gmv=float(row_dict["projected_gmv"]),
                    net_margin_impact_pct=float(row_dict["net_margin_impact_pct"]),
                    roi_percentage=float(row_dict["roi_percentage"]),
                    ai_copy_subject=row_dict.get("ai_copy_subject") or "",
                    ai_copy_body=row_dict.get("ai_copy_body") or "",
                    channels=channels,
                    forecast_days=forecast,
                    created_at=row_dict["created_at"],
                    start_date=row_dict["start_date"],
                    end_date=row_dict["end_date"]
                )
                campaigns.append(c_dto)
        return campaigns

    def _build_default_campaigns(self) -> List[CampaignDTO]:
        c1_forecast = generate_forecast_curve(14, 6200000.0, 1485000.0, 185)
        c2_forecast = generate_forecast_curve(14, 1850000.0, 642000.0, 98)
        c3_forecast = generate_forecast_curve(21, 3800000.0, 1120000.0, 340)
        c4_forecast = generate_forecast_curve(30, 8400000.0, 1850000.0, 74)

        return [
            CampaignDTO(
                id="camp_fy_refresh_2026",
                name="Fiscal Year-End Hardware Refresh 2026",
                target_segment="High-Volume Enterprise Merchants",
                target_segment_id="seg_enterprise",
                status="active",
                discount_type="percentage",
                discount_value=12.5,
                min_order_value=25000.0,
                expected_revenue_lift=1485000.0,
                expected_revenue_lift_pct=24.5,
                projected_orders=185,
                projected_gmv=7685000.0,
                net_margin_impact_pct=-2.4,
                roi_percentage=340.0,
                ai_copy_subject="⚡ FY26 Tax Advantage: Upgrade Your Billing Fleets with 12.5% Tax Credit Voucher",
                ai_copy_body="Upgrade your legacy countertop POS terminals to 5G Android Smart Terminals before March 31st. Enjoy instant 12.5% CapEx rebate and zero-cost 1-year AMC maintenance.",
                channels=["Email", "Dedicated RM Call", "WhatsApp Business"],
                forecast_days=c1_forecast,
                created_at="2026-03-01",
                start_date="2026-03-05",
                end_date="2026-03-19"
            ),
            CampaignDTO(
                id="camp_winback_surge",
                name="At-Risk Merchant 30-Day Winback Surge",
                target_segment="At-Risk Inactive Merchants",
                target_segment_id="seg_at_risk",
                status="active",
                discount_type="percentage",
                discount_value=25.0,
                min_order_value=8000.0,
                expected_revenue_lift=642000.0,
                expected_revenue_lift_pct=48.2,
                projected_orders=98,
                projected_gmv=2492000.0,
                net_margin_impact_pct=-5.1,
                roi_percentage=280.0,
                ai_copy_subject="🎁 We Miss You! Here's ₹5,000 + 25% Off to Reactivate Your RazorRecon Stack",
                ai_copy_body="It's been a while! We've upgraded our 3-way automated settlement reconciliation engine. Reactivate this week with 25% off all hardware renewals and 3 months free AI CFO Copilot.",
                channels=["WhatsApp Business", "SMS Alert", "Portal Push"],
                forecast_days=c2_forecast,
                created_at="2026-03-02",
                start_date="2026-03-06",
                end_date="2026-03-20"
            ),
            CampaignDTO(
                id="camp_soundbox_blitz",
                name="D2C Soundbox & POS Terminal Blitz",
                target_segment="Fast-Growing D2C Retailers",
                target_segment_id="seg_d2c_growth",
                status="scheduled",
                discount_type="percentage",
                discount_value=15.0,
                min_order_value=5000.0,
                expected_revenue_lift=1120000.0,
                expected_revenue_lift_pct=31.8,
                projected_orders=340,
                projected_gmv=4920000.0,
                net_margin_impact_pct=-3.0,
                roi_percentage=410.0,
                ai_copy_subject="🚀 Scale Your Store Checkouts: 4G Soundbox + Smart POS Bundle at 15% Off",
                ai_copy_body="Empower your retail store cashiers with multilingual instant voice notifications. Order 2+ units and unlock 15% instant volume cashback.",
                channels=["WhatsApp Business", "In-App Push", "Merchant Portal"],
                forecast_days=c3_forecast,
                created_at="2026-03-03",
                start_date="2026-03-10",
                end_date="2026-03-31"
            ),
            CampaignDTO(
                id="camp_finops_upgrade",
                name="FinOps Annual License Upgrade Accelerator",
                target_segment="High-Volume Enterprise Merchants",
                target_segment_id="seg_enterprise",
                status="scheduled",
                discount_type="flat_inr",
                discount_value=10000.0,
                min_order_value=40000.0,
                expected_revenue_lift=1850000.0,
                expected_revenue_lift_pct=28.0,
                projected_orders=74,
                projected_gmv=10250000.0,
                net_margin_impact_pct=+2.1,
                roi_percentage=520.0,
                ai_copy_subject="💼 Automate MCA Audit Close: Upgrade to Annual Enterprise and Save ₹10,000",
                ai_copy_body="Lock in 365 days of continuous multi-channel reconciliation, ERP ledger sync, and unlimited auditor seats with flat ₹10,000 discount.",
                channels=["Email", "Dedicated RM Call"],
                forecast_days=c4_forecast,
                created_at="2026-03-04",
                start_date="2026-03-15",
                end_date="2026-04-15"
            )
        ]

    def get_all_segments(self, merchant_id: Optional[str] = None) -> List[CustomerSegmentDTO]:
        if merchant_id:
            from app.services.auth_service import auth_service
            if not auth_service.is_demo_merchant(merchant_id):
                from app.services.merchant_service import merchant_service
                customers = merchant_service.get_customers(merchant_id=merchant_id)
                if not customers:
                    return []
        return self.segments

    def get_campaigns_overview(self, merchant_id: Optional[str] = None) -> CampaignListResponseDTO:
        target_campaigns = self._load_campaigns_db(merchant_id)
        target_segments = self.segments

        if merchant_id:
            from app.services.auth_service import auth_service
            if not auth_service.is_demo_merchant(merchant_id):
                from app.services.merchant_service import merchant_service
                customers = merchant_service.get_customers(merchant_id=merchant_id)
                if not customers:
                    target_segments = []

        active = [c for c in target_campaigns if c.status == "active"]
        total_lift = sum(c.expected_revenue_lift for c in target_campaigns)
        total_orders = sum(c.projected_orders for c in target_campaigns)
        avg_lift_pct = round(sum(c.expected_revenue_lift_pct for c in target_campaigns) / max(1, len(target_campaigns)), 1) if target_campaigns else 0.0

        return CampaignListResponseDTO(
            total_campaigns=len(target_campaigns),
            active_campaigns=len(active),
            aggregate_expected_revenue_lift=round(total_lift, 2),
            total_projected_orders=total_orders,
            avg_expected_lift_pct=avg_lift_pct,
            campaigns=target_campaigns,
            segments=target_segments
        )

    def simulate_discount(self, req: CampaignSimulationRequestDTO) -> CampaignSimulationResponseDTO:
        seg = SEGMENT_MAP.get(req.target_segment_id) or self.segments[0]
        reach = req.estimated_reach_merchants or seg.merchant_count
        elasticity = SEGMENT_ELASTICITY.get(seg.id, 1.8)

        # Baseline metrics (without campaign)
        baseline_conversion_rate = 0.08 if seg.id != "seg_at_risk" else 0.02
        baseline_orders = int(reach * baseline_conversion_rate)
        baseline_revenue = baseline_orders * seg.avg_order_value

        # Calculate effective discount %
        if req.discount_type == "flat_inr":
            effective_discount_pct = min(40.0, round((req.discount_value / max(1000.0, seg.avg_order_value)) * 100, 1))
        else:
            effective_discount_pct = min(50.0, req.discount_value)

        # Elasticity: Conversion lift = Discount % * Elasticity Factor
        conversion_lift_pct = round(effective_discount_pct * elasticity, 1)
        new_conversion_rate = baseline_conversion_rate * (1 + (conversion_lift_pct / 100.0))
        projected_orders = max(baseline_orders + 1, int(reach * new_conversion_rate))
        incremental_orders = projected_orders - baseline_orders

        # Discounted Order Value & Gross Revenue
        if req.discount_type == "flat_inr":
            avg_discounted_ticket = max(req.min_order_value, seg.avg_order_value - req.discount_value)
            discount_cost = projected_orders * req.discount_value
        else:
            avg_discounted_ticket = max(req.min_order_value, seg.avg_order_value * (1 - effective_discount_pct / 100.0))
            discount_cost = projected_orders * (seg.avg_order_value * (effective_discount_pct / 100.0))

        gross_campaign_revenue = round(projected_orders * avg_discounted_ticket, 2)
        net_revenue_lift = round(gross_campaign_revenue - baseline_revenue, 2)
        expected_revenue_lift_pct = round((net_revenue_lift / max(1.0, baseline_revenue)) * 100, 1)

        # Margin sensitivity
        baseline_margin_pct = seg.avg_margin_pct
        projected_margin_pct = max(10.0, round(baseline_margin_pct - (effective_discount_pct * 0.75), 1))
        net_margin_impact_pct = round(projected_margin_pct - baseline_margin_pct, 1)

        incremental_gross_profit = (incremental_orders * avg_discounted_ticket) * (projected_margin_pct / 100.0)
        roi_percentage = max(110.0, round((incremental_gross_profit / max(1.0, discount_cost)) * 100, 1))

        if effective_discount_pct <= 10.0:
            ai_verdict = f"High margin preservation strategy. Moderate conversion lift (+{conversion_lift_pct}%) with minimal margin dilution ({net_margin_impact_pct}%)."
        elif effective_discount_pct <= 25.0:
            ai_verdict = f"Optimal revenue accelerator sweetspot! High elasticity ({elasticity}x) generates ₹{net_revenue_lift:,.2f} in net incremental revenue with strong {roi_percentage}% ROI."
        else:
            ai_verdict = f"Aggressive acquisition/winback incentive. Generates high volume (+{conversion_lift_pct}% orders) but watch for {net_margin_impact_pct}% margin dilution."

        daily_payoff = generate_forecast_curve(req.duration_days, baseline_revenue, net_revenue_lift, projected_orders)

        return CampaignSimulationResponseDTO(
            target_segment_name=seg.name,
            target_merchant_reach=reach,
            discount_type=req.discount_type,
            discount_value=req.discount_value,
            price_elasticity_factor=elasticity,
            conversion_rate_lift_pct=conversion_lift_pct,
            projected_orders=projected_orders,
            baseline_orders=baseline_orders,
            incremental_orders=incremental_orders,
            baseline_revenue=round(baseline_revenue, 2),
            gross_campaign_revenue=gross_campaign_revenue,
            discount_cost=round(discount_cost, 2),
            net_revenue_lift=net_revenue_lift,
            expected_revenue_lift_pct=expected_revenue_lift_pct,
            baseline_margin_pct=baseline_margin_pct,
            projected_margin_pct=projected_margin_pct,
            net_margin_impact_pct=net_margin_impact_pct,
            roi_percentage=roi_percentage,
            ai_strategy_verdict=ai_verdict,
            daily_payoff=daily_payoff
        )

    def generate_campaign_with_ai(self, req: CampaignGenerateRequestDTO) -> CampaignDTO:
        seg = SEGMENT_MAP.get(req.target_segment_id) or self.segments[0]
        
        sim_res = self.simulate_discount(CampaignSimulationRequestDTO(
            target_segment_id=seg.id,
            discount_type=req.discount_type or "percentage",
            discount_value=req.discount_value or 15.0,
            min_order_value=req.min_order_value or 5000.0,
            duration_days=req.duration_days or 14
        ))

        goal_titles = {
            "revenue_surge": f"Q1 Revenue Accelerator: {seg.name} Surge",
            "winback": f"VIP Winback Offer for {seg.name}",
            "new_launch": f"New 5G Hardware Fleet Launch for {seg.name}",
            "inventory_clearance": f"Exclusive Clearance Event for {seg.name}"
        }
        name = goal_titles.get(req.goal, f"Growth Campaign for {seg.name}")

        discount_text = f"{req.discount_value}% OFF" if req.discount_type == "percentage" else f"₹{req.discount_value:,.0f} FLAT DISCOUNT"

        subject_templates = {
            "revenue_surge": f"🚀 Boost Your Checkout Speed: Exclusive {discount_text} on Upgraded Terminals",
            "winback": f"🎁 Special Reactivation Voucher: Claim {discount_text} on Your RazorRecon Stack",
            "new_launch": f"✨ Introducing 5G Smart Terminals: Pre-order with {discount_text} Today",
            "inventory_clearance": f"🏷️ Flash Clearance: {discount_text} on High-Speed Thermal Billing Fleets"
        }
        subject = subject_templates.get(req.goal, f"Special Offer: {discount_text} on RazorRecon Commerce")

        body_templates = {
            "revenue_surge": f"Scale your daily checkout throughput with enterprise POS hardware and automated 3-way reconciliation. Use code REVENUE26 for {discount_text} on orders above ₹{req.min_order_value:,.0f}.",
            "winback": f"We'd love to welcome you back. Enjoy {discount_text} on all hardware upgrades, complete with 1-click Razorpay payment links and AI CFO Copilot access.",
            "new_launch": f"Upgrade to next-gen Android 5G POS devices featuring high-speed Japanese thermal printers and multi-payment tap & pay. Save {discount_text} during early launch.",
            "inventory_clearance": f"Limited-time stock clearance on certified barcode scanners, cash drawers, and 4G soundboxes. Grab {discount_text} while inventory lasts."
        }
        body = body_templates.get(req.goal, f"Take advantage of this special campaign tailored for your business. Enjoy {discount_text} on your next order.")

        now = datetime.now()
        duration = req.duration_days or 14
        start_date = (now + timedelta(days=1)).strftime("%Y-%m-%d")
        end_date = (now + timedelta(days=duration + 1)).strftime("%Y-%m-%d")

        new_camp = CampaignDTO(
            id=f"camp_{uuid.uuid4().hex[:8]}",
            name=name,
            target_segment=seg.name,
            target_segment_id=seg.id,
            status="active",
            discount_type=req.discount_type or "percentage",
            discount_value=req.discount_value or 15.0,
            min_order_value=req.min_order_value or 5000.0,
            expected_revenue_lift=sim_res.net_revenue_lift,
            expected_revenue_lift_pct=sim_res.expected_revenue_lift_pct,
            projected_orders=sim_res.projected_orders,
            projected_gmv=sim_res.gross_campaign_revenue,
            net_margin_impact_pct=sim_res.net_margin_impact_pct,
            roi_percentage=sim_res.roi_percentage,
            ai_copy_subject=subject,
            ai_copy_body=body,
            channels=req.channels or ["WhatsApp Business", "Email"],
            forecast_days=sim_res.daily_payoff,
            created_at=now.strftime("%Y-%m-%d"),
            start_date=start_date,
            end_date=end_date
        )

        with self._get_conn() as conn:
            cursor = conn.cursor()
            self._insert_campaign_db(cursor, new_camp)
            conn.commit()

        try:
            from app.services.audit_service import audit_service
            audit_service.log_audit(
                action="CAMPAIGN_LAUNCHED",
                entity_type="CAMPAIGN",
                entity_id=new_camp.id,
                user_name="Merchant Growth Engine",
                role="AI Agent",
                old_value=None,
                new_value={"name": new_camp.name, "target_segment": new_camp.target_segment, "expected_revenue_lift": new_camp.expected_revenue_lift}
            )
        except Exception:
            pass

        return new_camp

    def toggle_campaign_status(self, campaign_id: str, status: str) -> Optional[CampaignDTO]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE campaigns SET status = ? WHERE id = ?", (status, campaign_id))
            conn.commit()
        camps = self._load_campaigns_db()
        return next((c for c in camps if c.id == campaign_id), None)

    def delete_campaign(self, campaign_id: str) -> bool:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM campaigns WHERE id = ?", (campaign_id,))
            affected = cursor.rowcount
            conn.commit()
        return affected > 0

campaign_service = CampaignService()
