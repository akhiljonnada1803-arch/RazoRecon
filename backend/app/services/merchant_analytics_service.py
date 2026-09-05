import sqlite3
import os
import json
import math
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "merchant.db")

MERCHANTS_REGISTRY = [
    {
        "id": "all",
        "name": "All Merchants (Aggregated Platform)",
        "badge": "Platform Aggregate",
        "category": "Cross-Platform",
        "currency": "INR",
        "multiplier": 1.0,
        "primary_focus": "Enterprise POS, AI Commerce & Cloud"
    },
    {
        "id": "mcht_acme_pos",
        "name": "Acme FinTech Hardware & POS",
        "badge": "POS Terminals",
        "category": "Point of Sale & Terminals",
        "currency": "INR",
        "multiplier": 0.38,
        "primary_focus": "Smart POS V3, Android POS Lite & Charging Docks"
    },
    {
        "id": "mcht_bharat_audio",
        "name": "BharatVoice Audio Labs",
        "badge": "Audio Devices",
        "category": "Payment Soundbox & Audio",
        "currency": "INR",
        "multiplier": 0.22,
        "primary_focus": "4G Voice Soundbox, Bluetooth Audio Alerts"
    },
    {
        "id": "mcht_dahua_sec",
        "name": "Dahua & Hikvision Security",
        "badge": "Security & Vision",
        "category": "Retail Security & Surveillance",
        "currency": "INR",
        "multiplier": 0.16,
        "primary_focus": "Store IP Cameras, Cloud NVR & Edge AI"
    },
    {
        "id": "mcht_epson_pos",
        "name": "Epson Systems & Printers",
        "badge": "Printers & Paper",
        "category": "Consumables & Thermal Printers",
        "currency": "INR",
        "multiplier": 0.14,
        "primary_focus": "Thermal Bill Printers & 80mm Paper Rolls"
    },
    {
        "id": "mcht_novus_cloud",
        "name": "Novus Cloud & FinOps SaaS",
        "badge": "SaaS & APIs",
        "category": "FinOps Software & Subscriptions",
        "currency": "INR",
        "multiplier": 0.10,
        "primary_focus": "RazorRecon Growth Licenses, AutoPay Mandate APIs"
    }
]

CATEGORY_PALETTE = {
    "Payment Terminals": "#3B82F6",
    "Voice Audio Alerts": "#10B981",
    "Retail Surveillance": "#8B5CF6",
    "Consumables & Paper": "#F59E0B",
    "FinOps Software": "#EC4899",
    "Workstation Hardware": "#06B6D4",
}

class MerchantAnalyticsService:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path

    def get_merchants(self) -> List[Dict[str, Any]]:
        return MERCHANTS_REGISTRY

    def get_advanced_analytics(
        self,
        merchant_id: str = "all",
        date_range: str = "30d",
        from_date: Optional[str] = None,
        to_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate telemetry for all 7 required Recharts charts:
        1. Revenue Trend (Line Chart)
        2. Daily Orders (Bar Chart)
        3. Category Revenue (Pie Chart)
        4. Top Selling Products (Horizontal Bar)
        5. Agent Orders vs Human Orders (Donut Chart)
        6. Revenue Forecast (Line Graph)
        7. Customer Lifetime Value (Histogram)
        """
        # Check if merchant is demo or registered multi-tenant merchant
        from app.services.auth_service import auth_service
        is_demo = (
            merchant_id in ["all", "mcht_acme_pos", "mcht_bharat_audio", "mcht_dahua_sec", "mcht_epson_pos", "mcht_novus_cloud", "rzp_live_acme_8842"]
            or auth_service.is_demo_merchant(merchant_id)
        )

        if not is_demo:
            from app.services.analytics_engine import analytics_engine
            return analytics_engine.get_advanced_analytics(
                merchant_id=merchant_id,
                date_range=date_range,
                from_date=from_date,
                to_date=to_date
            )

        # Resolve merchant profile & scaling multiplier
        selected_mcht = next((m for m in MERCHANTS_REGISTRY if m["id"] == merchant_id), MERCHANTS_REGISTRY[0])
        multiplier = selected_mcht.get("multiplier", 1.0)
        if selected_mcht["id"] == "all":
            multiplier = 1.0

        # Determine day count for date_range
        days = 30
        if date_range == "today":
            days = 1
        elif date_range == "7d":
            days = 7
        elif date_range == "30d":
            days = 30
        elif date_range == "90d":
            days = 90
        elif date_range in ["1y", "ytd"]:
            days = 365
        elif date_range == "custom" and from_date and to_date:
            try:
                d1 = datetime.strptime(from_date, "%Y-%m-%d")
                d2 = datetime.strptime(to_date, "%Y-%m-%d")
                days = max(1, min(365, (d2 - d1).days + 1))
            except Exception:
                days = 30

        today = datetime.now()
        start_date = today - timedelta(days=days - 1)

        # -------------------------------------------------------------
        # 1. REVENUE TREND (Line Chart)
        # -------------------------------------------------------------
        revenue_trend: List[Dict[str, Any]] = []
        base_daily_rev = 145000.0 * multiplier
        base_daily_orders = int(max(1, round(38 * multiplier)))

        # Determine interval grouping if range is long
        step = 1
        if days > 90:
            step = 7 # weekly points
        elif days > 30:
            step = 3

        for i in range(0, days, step):
            point_date = start_date + timedelta(days=i)
            day_str = point_date.strftime("%b %d") if days <= 90 else point_date.strftime("%Y-%m-%d")
            
            # Realistic business day cyclicity + upward trend
            cycle_factor = 1.0 + 0.18 * math.sin(i * 0.45) + (i / max(1, days)) * 0.25
            weekend_dip = 0.82 if point_date.weekday() >= 5 else 1.05
            
            actual_rev = round(base_daily_rev * cycle_factor * weekend_dip * step, 2)
            target_rev = round(base_daily_rev * 1.12 * step, 2)
            orders_count = max(1, int(base_daily_orders * cycle_factor * weekend_dip * step))

            revenue_trend.append({
                "date": day_str,
                "full_date": point_date.strftime("%Y-%m-%d"),
                "revenue": actual_rev,
                "target": target_rev,
                "orders": orders_count
            })

        # -------------------------------------------------------------
        # 2. DAILY ORDERS (Bar Chart)
        # -------------------------------------------------------------
        daily_orders: List[Dict[str, Any]] = []
        sample_days = min(days, 30) # For clean bar visibility, cap at last 30 intervals
        bar_start = today - timedelta(days=sample_days - 1)

        for i in range(sample_days):
            cur_date = bar_start + timedelta(days=i)
            weekday_mult = 0.85 if cur_date.weekday() >= 5 else 1.08
            var_factor = 1.0 + 0.15 * math.sin(i * 0.6)
            
            orders = max(2, int(round(base_daily_orders * weekday_mult * var_factor)))
            units = int(round(orders * (1.8 + 0.2 * (i % 3))))
            day_rev = round(orders * (3800.0 + (i % 4) * 450.0), 2)
            aov = round(day_rev / orders, 2)

            daily_orders.append({
                "date": cur_date.strftime("%d %b"),
                "orders_count": orders,
                "units_sold": units,
                "revenue": day_rev,
                "avg_order_value": aov
            })

        # -------------------------------------------------------------
        # 3. CATEGORY REVENUE (Pie Chart)
        # -------------------------------------------------------------
        category_weights = {
            "Payment Terminals": 36.5,
            "Voice Audio Alerts": 24.2,
            "Retail Surveillance": 16.8,
            "Consumables & Paper": 12.5,
            "FinOps Software": 10.0,
        }
        
        # If specific merchant selected, alter weights to match their domain
        if selected_mcht["id"] == "mcht_acme_pos":
            category_weights = {"Payment Terminals": 72.0, "Consumables & Paper": 20.0, "FinOps Software": 8.0}
        elif selected_mcht["id"] == "mcht_bharat_audio":
            category_weights = {"Voice Audio Alerts": 85.0, "Consumables & Paper": 15.0}
        elif selected_mcht["id"] == "mcht_dahua_sec":
            category_weights = {"Retail Surveillance": 88.0, "Payment Terminals": 12.0}
        elif selected_mcht["id"] == "mcht_epson_pos":
            category_weights = {"Consumables & Paper": 65.0, "Payment Terminals": 35.0}
        elif selected_mcht["id"] == "mcht_novus_cloud":
            category_weights = {"FinOps Software": 90.0, "Payment Terminals": 10.0}

        total_rev_pool = sum(pt["revenue"] for pt in revenue_trend) or (1500000.0 * multiplier)
        category_revenue: List[Dict[str, Any]] = []

        for cat, pct in category_weights.items():
            cat_val = round((total_rev_pool * pct) / 100.0, 2)
            category_revenue.append({
                "name": cat,
                "value": cat_val,
                "percentage": pct,
                "color": CATEGORY_PALETTE.get(cat, "#64748B")
            })

        # -------------------------------------------------------------
        # 4. TOP SELLING PRODUCTS (Horizontal Bar)
        # -------------------------------------------------------------
        all_products_catalog = [
            {"name": "Razorpay Smart POS Terminal V3 Pro", "short_name": "Smart POS V3", "cat": "Payment Terminals", "base_price": 14999.0, "base_units": 245},
            {"name": "Dynamic UPI Voice Alert Soundbox 4G", "short_name": "Voice Soundbox 4G", "cat": "Voice Audio Alerts", "base_price": 2499.0, "base_units": 412},
            {"name": "Thermal POS Receipt Paper (Box of 50)", "short_name": "Thermal Paper 50x", "cat": "Consumables & Paper", "base_price": 2490.0, "base_units": 380},
            {"name": "Dahua AI Smart 4K Bullet Camera", "short_name": "AI 4K Camera", "cat": "Retail Surveillance", "base_price": 8990.0, "base_units": 118},
            {"name": "RazorRecon Growth Quarterly SaaS", "short_name": "RazorRecon SaaS", "cat": "FinOps Software", "base_price": 19999.0, "base_units": 68},
            {"name": "Android POS Terminal V2 Lite", "short_name": "POS V2 Lite", "cat": "Payment Terminals", "base_price": 9999.0, "base_units": 134},
            {"name": "Epson 80mm High-Speed Bill Printer", "short_name": "Epson Bill Printer", "cat": "Consumables & Paper", "base_price": 11500.0, "base_units": 94}
        ]

        # Filter by merchant specialization if not 'all'
        if selected_mcht["id"] != "all":
            filtered_prods = [p for p in all_products_catalog if p["cat"] in category_weights]
            if not filtered_prods:
                filtered_prods = all_products_catalog[:4]
        else:
            filtered_prods = all_products_catalog

        top_products: List[Dict[str, Any]] = []
        for p in filtered_prods:
            units = max(5, int(round(p["base_units"] * multiplier * (days / 30.0))))
            rev = round(units * p["base_price"], 2)
            top_products.append({
                "name": p["name"],
                "short_name": p["short_name"],
                "category": p["cat"],
                "sales_count": units,
                "revenue": rev,
                "unit_price": p["base_price"]
            })
        
        # Sort descending by revenue
        top_products.sort(key=lambda x: x["revenue"], reverse=True)
        top_products = top_products[:6]

        # -------------------------------------------------------------
        # 5. AGENT ORDERS VS HUMAN ORDERS (Donut Chart)
        # -------------------------------------------------------------
        total_orders_count = sum(pt["orders"] for pt in revenue_trend) or 480
        agent_pct = 38.4 if selected_mcht["id"] in ["all", "mcht_acme_pos"] else 32.6
        human_pct = round(100.0 - agent_pct, 1)

        agent_orders_count = int(round((total_orders_count * agent_pct) / 100.0))
        human_orders_count = total_orders_count - agent_orders_count

        agent_revenue = round(total_rev_pool * (agent_pct / 100.0), 2)
        human_revenue = round(total_rev_pool - agent_revenue, 2)

        agent_vs_human = [
            {
                "name": "Autonomous AI Agents",
                "value": agent_orders_count,
                "revenue": agent_revenue,
                "percentage": agent_pct,
                "avg_decision_sec": 14.8,
                "color": "#8B5CF6"
            },
            {
                "name": "Human Manual Shoppers",
                "value": human_orders_count,
                "revenue": human_revenue,
                "percentage": human_pct,
                "avg_decision_sec": 780.0,
                "color": "#0B72E7"
            }
        ]

        # -------------------------------------------------------------
        # 6. REVENUE FORECAST (Line Graph: Past 14d Actual + Next 14d Forecast)
        # -------------------------------------------------------------
        forecast_points: List[Dict[str, Any]] = []
        forecast_base = base_daily_rev * 1.05

        # 14 days of history
        for i in range(14, 0, -1):
            hist_date = today - timedelta(days=i)
            hist_val = round(forecast_base * (0.95 + 0.12 * math.sin(i * 0.8)), 2)
            forecast_points.append({
                "date": hist_date.strftime("%d %b"),
                "actual_revenue": hist_val,
                "forecasted_revenue": hist_val,
                "upper_bound": hist_val,
                "lower_bound": hist_val,
                "is_forecast": False
            })

        # Transition point (today)
        today_val = round(forecast_base * 1.08, 2)
        forecast_points.append({
            "date": today.strftime("%d %b"),
            "actual_revenue": today_val,
            "forecasted_revenue": today_val,
            "upper_bound": today_val,
            "lower_bound": today_val,
            "is_forecast": False
        })

        # 14 days of projected AI growth
        growth_step = 0.015
        for i in range(1, 15):
            future_date = today + timedelta(days=i)
            trend_val = today_val * (1.0 + (growth_step * i)) + (1500.0 * math.sin(i * 0.5))
            uncertainty = trend_val * (0.04 + (0.005 * i))
            
            proj_val = round(trend_val, 2)
            upper = round(trend_val + uncertainty, 2)
            lower = round(trend_val - uncertainty, 2)

            forecast_points.append({
                "date": future_date.strftime("%d %b"),
                "actual_revenue": None,
                "forecasted_revenue": proj_val,
                "upper_bound": upper,
                "lower_bound": lower,
                "is_forecast": True
            })

        # -------------------------------------------------------------
        # 7. CUSTOMER LIFETIME VALUE (Histogram)
        # -------------------------------------------------------------
        clv_bins = [
            {"bin": "₹0 - 5k", "range_min": 0, "range_max": 5000, "weight": 0.28, "avg": 3400.0},
            {"bin": "₹5k - 15k", "range_min": 5001, "range_max": 15000, "weight": 0.32, "avg": 9800.0},
            {"bin": "₹15k - 30k", "range_min": 15001, "range_max": 30000, "weight": 0.20, "avg": 22400.0},
            {"bin": "₹30k - 60k", "range_min": 30001, "range_max": 60000, "weight": 0.12, "avg": 44500.0},
            {"bin": "₹60k - 100k", "range_min": 60001, "range_max": 100000, "weight": 0.05, "avg": 78000.0},
            {"bin": "₹100k+", "range_min": 100001, "range_max": 500000, "weight": 0.03, "avg": 185000.0},
        ]

        total_customer_base = int(round(1240 * multiplier))
        if total_customer_base < 50:
            total_customer_base = 50

        clv_histogram: List[Dict[str, Any]] = []
        cumulative_pct = 0.0

        for b in clv_bins:
            cnt = int(round(total_customer_base * b["weight"]))
            pct = round(b["weight"] * 100.0, 1)
            cumulative_pct += pct
            clv_histogram.append({
                "bin": b["bin"],
                "customer_count": cnt,
                "avg_spend": b["avg"],
                "pct_of_customers": pct,
                "cumulative_pct": round(min(100.0, cumulative_pct), 1)
            })

        # -------------------------------------------------------------
        # EXECUTIVE SUMMARY KPIS
        # -------------------------------------------------------------
        gross_rev = round(total_rev_pool, 2)
        total_orders = total_orders_count
        aov = round(gross_rev / max(1, total_orders), 2)
        projected_monthly_run_rate = round(base_daily_rev * 30.0 * 1.15, 2)

        return {
            "active_filter": {
                "merchant_id": selected_mcht["id"],
                "merchant_name": selected_mcht["name"],
                "badge": selected_mcht["badge"],
                "date_range": date_range,
                "days_count": days,
                "from_date": revenue_trend[0]["full_date"] if revenue_trend else "",
                "to_date": revenue_trend[-1]["full_date"] if revenue_trend else ""
            },
            "summary_kpis": {
                "gross_revenue": gross_rev,
                "total_orders": total_orders,
                "average_order_value": aov,
                "agent_order_pct": agent_pct,
                "projected_monthly_run_rate": projected_monthly_run_rate,
                "total_active_customers": total_customer_base,
                "yoy_growth_pct": 34.8,
                "autopay_success_rate_pct": 98.6
            },
            "charts": {
                "revenue_trend": revenue_trend,
                "daily_orders": daily_orders,
                "category_revenue": category_revenue,
                "top_products": top_products,
                "agent_vs_human": agent_vs_human,
                "revenue_forecast": forecast_points,
                "clv_histogram": clv_histogram
            },
            "merchants": MERCHANTS_REGISTRY
        }

merchant_analytics_service = MerchantAnalyticsService()
