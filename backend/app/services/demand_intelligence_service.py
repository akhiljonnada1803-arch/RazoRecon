import os
import json
import random
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

class DemandIntelligenceService:
    def __init__(self):
        self._initialize_catalog_data()

    def _initialize_catalog_data(self):
        # Product demand metrics dataset
        self.products = [
            {
                "id": "prod_pos_pro_v3",
                "name": "Razorpay Smart POS Terminal Pro V3",
                "category": "Fintech Hardware",
                "price": 12999.0,
                "cost_price": 8500.0,
                "stock": 18,
                "views": 3840,
                "searches": 1920,
                "cart_adds": 740,
                "purchases": 390,
                "conversion_rate": 10.15,
                "inventory_velocity": 4.8, # units/day
                "supplier_lead_time_days": 4,
            },
            {
                "id": "prod_soundbox_4g",
                "name": "Razorpay Voice Soundbox Pro 4G",
                "category": "Soundboxes",
                "price": 2499.0,
                "cost_price": 1400.0,
                "stock": 142,
                "views": 4920,
                "searches": 2840,
                "cart_adds": 1120,
                "purchases": 680,
                "conversion_rate": 13.82,
                "inventory_velocity": 8.2,
                "supplier_lead_time_days": 3,
            },
            {
                "id": "prod_trading_workstation",
                "name": "Developer & Trading Desk Workstation Pro",
                "category": "Workstations",
                "price": 64999.0,
                "cost_price": 48000.0,
                "stock": 12,
                "views": 2150,
                "searches": 980,
                "cart_adds": 310,
                "purchases": 115,
                "conversion_rate": 5.35,
                "inventory_velocity": 1.4,
                "supplier_lead_time_days": 7,
            },
            {
                "id": "prod_thermal_printer",
                "name": "High-Speed 80mm Thermal Receipt Printer",
                "category": "Peripherals",
                "price": 4999.0,
                "cost_price": 3100.0,
                "stock": 64,
                "views": 620,
                "searches": 210,
                "cart_adds": 48,
                "purchases": 14,
                "conversion_rate": 2.25,
                "inventory_velocity": 0.4,
                "supplier_lead_time_days": 5,
            },
            {
                "id": "prod_barcode_scanner",
                "name": "Omnidirectional 2D QR & Barcode Scanner",
                "category": "Peripherals",
                "price": 3499.0,
                "cost_price": 2000.0,
                "stock": 8,
                "views": 2890,
                "searches": 1450,
                "cart_adds": 520,
                "purchases": 260,
                "conversion_rate": 8.99,
                "inventory_velocity": 3.6,
                "supplier_lead_time_days": 6,
            },
            {
                "id": "prod_nfc_pinpad",
                "name": "Contactless NFC Card Reader & PIN Pad",
                "category": "Payment Terminals",
                "price": 3999.0,
                "cost_price": 2400.0,
                "stock": 35,
                "views": 1820,
                "searches": 840,
                "cart_adds": 290,
                "purchases": 130,
                "conversion_rate": 7.14,
                "inventory_velocity": 1.9,
                "supplier_lead_time_days": 4,
            },
            {
                "id": "prod_thermal_paper_pack",
                "name": "BPA-Free Thermal Paper Rolls (50-pack)",
                "category": "Accessories",
                "price": 1499.0,
                "cost_price": 650.0,
                "stock": 210,
                "views": 3100,
                "searches": 1900,
                "cart_adds": 890,
                "purchases": 540,
                "conversion_rate": 17.41,
                "inventory_velocity": 7.5,
                "supplier_lead_time_days": 2,
            },
            {
                "id": "prod_biometric_scanner",
                "name": "Optical Fingerprint & Biometric Auth Reader",
                "category": "Security Hardware",
                "price": 5499.0,
                "cost_price": 3800.0,
                "stock": 85,
                "views": 310,
                "searches": 95,
                "cart_adds": 18,
                "purchases": 4,
                "conversion_rate": 1.29,
                "inventory_velocity": 0.1,
                "supplier_lead_time_days": 10,
            },
            {
                "id": "prod_curved_monitor",
                "name": "4K Curved Financial Trading & Analytics Monitor",
                "category": "Workstations",
                "price": 38999.0,
                "cost_price": 28500.0,
                "stock": 16,
                "views": 2480,
                "searches": 1120,
                "cart_adds": 380,
                "purchases": 140,
                "conversion_rate": 5.64,
                "inventory_velocity": 1.8,
                "supplier_lead_time_days": 8,
            },
            {
                "id": "prod_yubikey_nfc",
                "name": "YubiKey 5 NFC Enterprise Security Key",
                "category": "Security Hardware",
                "price": 4999.0,
                "cost_price": 3200.0,
                "stock": 78,
                "views": 1980,
                "searches": 920,
                "cart_adds": 340,
                "purchases": 180,
                "conversion_rate": 9.09,
                "inventory_velocity": 2.4,
                "supplier_lead_time_days": 4,
            },
            {
                "id": "prod_legacy_magstripe",
                "name": "Legacy USB Magstripe Track 1/2 Reader",
                "category": "Peripherals",
                "price": 1899.0,
                "cost_price": 1200.0,
                "stock": 115,
                "views": 140,
                "searches": 40,
                "cart_adds": 6,
                "purchases": 1,
                "conversion_rate": 0.71,
                "inventory_velocity": 0.03,
                "supplier_lead_time_days": 14,
            }
        ]

    def _calculate_demand_score(self, item: Dict[str, Any]) -> int:
        """
        Demand Score (0-100) Formula:
        Demand Score = 30% Views (normalized) 
                     + 20% Searches (normalized) 
                     + 20% Cart Adds (normalized) 
                     + 20% Purchases (normalized) 
                     + 10% Conversion Rate (normalized)
        """
        # Normalization baselines: Max expected per SKU
        norm_views = min(100.0, (item["views"] / 5000.0) * 100.0)
        norm_searches = min(100.0, (item["searches"] / 3000.0) * 100.0)
        norm_cart = min(100.0, (item["cart_adds"] / 1200.0) * 100.0)
        norm_purchases = min(100.0, (item["purchases"] / 700.0) * 100.0)
        norm_cr = min(100.0, (item["conversion_rate"] / 20.0) * 100.0)

        score = (
            0.30 * norm_views +
            0.20 * norm_searches +
            0.20 * norm_cart +
            0.20 * norm_purchases +
            0.10 * norm_cr
        )
        return int(round(max(5.0, min(98.0, score))))

    def _get_status_tier(self, score: int) -> Dict[str, str]:
        if score >= 80:
            return {"key": "TRENDING", "label": "Trending", "badge": "🔥 Trending", "color": "text-rose-500 bg-rose-50 border-rose-200"}
        elif score >= 60:
            return {"key": "GROWING", "label": "Growing", "badge": "📈 Growing", "color": "text-emerald-600 bg-emerald-50 border-emerald-200"}
        elif score >= 40:
            return {"key": "STABLE", "label": "Stable", "badge": "➖ Stable", "color": "text-blue-600 bg-blue-50 border-blue-200"}
        elif score >= 20:
            return {"key": "DECLINING", "label": "Declining", "badge": "📉 Declining", "color": "text-amber-600 bg-amber-50 border-amber-200"}
        else:
            return {"key": "DEAD_INVENTORY", "label": "Dead Inventory", "badge": "💀 Dead Inventory", "color": "text-slate-600 bg-slate-100 border-slate-300"}

    def _generate_trend_history(self, base_score: int) -> Dict[str, List[Dict[str, Any]]]:
        # Generate trend historical datapoints for 7d, 30d, 90d
        def create_points(days: int, start_ratio: float, volatility: float):
            points = []
            today = datetime.now()
            start_val = base_score * start_ratio
            step = (base_score - start_val) / max(1, days - 1)
            for i in range(days):
                d = today - timedelta(days=(days - 1 - i))
                noise = (random.random() - 0.5) * volatility
                val = max(5, min(100, int(round(start_val + (step * i) + noise))))
                points.append({
                    "date": d.strftime("%d %b"),
                    "score": val
                })
            return points

        if base_score >= 80:
            return {
                "7d": create_points(7, 0.78, 4.0),
                "30d": create_points(30, 0.55, 6.0),
                "90d": create_points(90, 0.40, 8.0),
            }
        elif base_score >= 60:
            return {
                "7d": create_points(7, 0.88, 3.0),
                "30d": create_points(30, 0.70, 5.0),
                "90d": create_points(90, 0.52, 7.0),
            }
        elif base_score >= 40:
            return {
                "7d": create_points(7, 0.98, 3.0),
                "30d": create_points(30, 0.95, 4.0),
                "90d": create_points(90, 0.92, 5.0),
            }
        elif base_score >= 20:
            return {
                "7d": create_points(7, 1.25, 4.0),
                "30d": create_points(30, 1.55, 6.0),
                "90d": create_points(90, 1.85, 8.0),
            }
        else:
            return {
                "7d": create_points(7, 1.40, 3.0),
                "30d": create_points(30, 2.10, 5.0),
                "90d": create_points(90, 3.20, 6.0),
            }

    def get_demand_intelligence(self) -> Dict[str, Any]:
        enriched_products = []
        trending_list = []
        growing_list = []
        stable_list = []
        declining_list = []
        dead_list = []

        total_dead_tied_capital = 0.0
        projected_total_lift = 0.0

        for p in self.products:
            score = self._calculate_demand_score(p)
            tier = self._get_status_tier(score)
            trends = self._generate_trend_history(score)
            
            # Days to stockout
            days_to_stockout = max(1, int(round(p["stock"] / max(0.05, p["inventory_velocity"]))))
            
            item = {
                **p,
                "demand_score": score,
                "status_tier": tier,
                "days_to_stockout": days_to_stockout,
                "trend_history": trends,
            }

            # AI Discount / Action Generation
            if tier["key"] == "DECLINING":
                recommended_discount = 10 if score > 28 else 12
                conversion_uplift = 22 if recommended_discount == 10 else 27
                confidence = 88 if score > 28 else 85
                item["ai_recommendation"] = {
                    "type": "DYNAMIC_DISCOUNT",
                    "title": f"Apply {recommended_discount}% Dynamic Markdown",
                    "discount_pct": recommended_discount,
                    "target_price": round(p["price"] * (1 - recommended_discount / 100.0), 2),
                    "expected_uplift_pct": conversion_uplift,
                    "expected_revenue_lift_inr": round(p["price"] * p["stock"] * 0.35 * (conversion_uplift / 100.0), 2),
                    "confidence_pct": confidence,
                    "reasoning": f"Demand velocity dropped -{int(round(35 - score * 0.4))}% over 30 days. Lowering price stimulates checkout conversions without breaking gross margin."
                }
                projected_total_lift += item["ai_recommendation"]["expected_revenue_lift_inr"]
                declining_list.append(item)

            elif tier["key"] == "DEAD_INVENTORY":
                tied_capital = p["cost_price"] * p["stock"]
                total_dead_tied_capital += tied_capital
                item["tied_capital_inr"] = tied_capital
                item["ai_recommendation"] = {
                    "type": "LIQUIDATION_BUNDLE",
                    "title": "15% Markdown & Companion Bundle",
                    "discount_pct": 15,
                    "bundle_with": "Razorpay Smart POS Terminal Pro V3",
                    "expected_uplift_pct": 38,
                    "expected_revenue_lift_inr": round(tied_capital * 0.45, 2),
                    "confidence_pct": 92,
                    "reasoning": f"High inventory hold ({p['stock']} units) with sub-1% conversions. Bundle as a zero-friction checkout add-on with Smart POS to unlock ₹{int(tied_capital):,} trapped capital."
                }
                projected_total_lift += item["ai_recommendation"]["expected_revenue_lift_inr"]
                dead_list.append(item)

            elif tier["key"] == "TRENDING":
                trending_list.append(item)
                if days_to_stockout <= 6:
                    item["restock_alert"] = {
                        "severity": "CRITICAL",
                        "days_left": days_to_stockout,
                        "recommended_units": int(round(p["inventory_velocity"] * 25)),
                        "expected_stockout_date": (datetime.now() + timedelta(days=days_to_stockout)).strftime("%d %b %Y"),
                        "message": f"High demand velocity ({p['inventory_velocity']} units/day). Stock will deplete in {days_to_stockout} days."
                    }

            elif tier["key"] == "GROWING":
                growing_list.append(item)
            else:
                stable_list.append(item)

            enriched_products.append(item)

        # Autonomous AI Campaigns proposals
        autonomous_campaigns = [
            {
                "id": "cmp_revival_01",
                "name": "Thermal Printer & Peripherals Revival Blitz",
                "target_audience": "Merchants with Smart POS Devices & Active Counters",
                "recommended_discount_pct": 10,
                "duration_days": 7,
                "featured_products": ["High-Speed 80mm Thermal Receipt Printer", "BPA-Free Thermal Paper Rolls (50-pack)"],
                "expected_revenue_lift_inr": 154000.0,
                "projected_orders": 34,
                "status": "READY_FOR_LAUNCH",
                "strategy_type": "CLEARANCE_ACCELERATOR",
                "confidence_score": 91
            },
            {
                "id": "cmp_pos_bundle_02",
                "name": "Omni-Commerce POS Power Combo",
                "target_audience": "Retail, D2C & Supermarket Chains",
                "recommended_discount_pct": 8,
                "duration_days": 14,
                "featured_products": ["Razorpay Smart POS Terminal Pro V3", "Razorpay Voice Soundbox Pro 4G", "Omnidirectional 2D QR & Barcode Scanner"],
                "expected_revenue_lift_inr": 345000.0,
                "projected_orders": 68,
                "status": "READY_FOR_LAUNCH",
                "strategy_type": "HIGH_GMV_CROSS_SELL",
                "confidence_score": 94
            },
            {
                "id": "cmp_biometric_flash_03",
                "name": "Biometric Compliance & Security Flash Sale",
                "target_audience": "Fintech Developers & Enterprise SaaS Admins",
                "recommended_discount_pct": 15,
                "duration_days": 3,
                "featured_products": ["Optical Fingerprint & Biometric Auth Reader", "YubiKey 5 NFC Enterprise Security Key"],
                "expected_revenue_lift_inr": 92000.0,
                "projected_orders": 22,
                "status": "READY_FOR_LAUNCH",
                "strategy_type": "DEAD_STOCK_LIQUIDATION",
                "confidence_score": 87
            }
        ]

        # Top real-time Growth Insight bullets
        growth_insights = [
            {
                "id": "ins_01",
                "icon": "Zap",
                "type": "SURGE",
                "title": "Demand Surge in POS Core",
                "description": "Demand for POS devices increased 34% this week across tier-1 merchant hubs.",
                "badge": "+34% Demand",
                "color": "text-rose-600 bg-rose-50 border-rose-200",
                "action_route": "/merchant/demand-intelligence"
            },
            {
                "id": "ins_02",
                "icon": "AlertTriangle",
                "type": "STOCKOUT_RISK",
                "title": "Barcode Scanner Stockout Risk",
                "description": "Barcode Scanner inventory (8 units) may run out in 6 days. Restock 50 units recommended.",
                "badge": "6 Days Left",
                "color": "text-amber-600 bg-amber-50 border-amber-200",
                "action_route": "/merchant/inventory-optimization"
            },
            {
                "id": "ins_03",
                "icon": "TrendingDown",
                "type": "PRICE_OPPORTUNITY",
                "title": "Thermal Printer Discount Opportunity",
                "description": "Thermal Printer demand dropped 18%. AI recommends 10% discount for +22% conversions.",
                "badge": "+22% Lift",
                "color": "text-blue-600 bg-blue-50 border-blue-200",
                "action_route": "/merchant/demand-intelligence"
            },
            {
                "id": "ins_04",
                "icon": "Sparkles",
                "type": "REVENUE_FORECAST",
                "title": "Autonomous Campaign Revenue Lift",
                "description": "AI predicts ₹2.3L additional gross revenue through 3 targeted campaign optimizations.",
                "badge": "₹2.3L Projected",
                "color": "text-emerald-600 bg-emerald-50 border-emerald-200",
                "action_route": "/merchant/campaigns"
            }
        ]

        # Category Demand Heatmap
        category_heatmap = [
            {"category": "Soundboxes", "avg_score": 92, "trend": "+18.4%", "active_skus": 4, "status": "SURGING"},
            {"category": "Fintech Hardware", "avg_score": 86, "trend": "+12.1%", "active_skus": 8, "status": "HIGH_GROWTH"},
            {"category": "Workstations", "avg_score": 74, "trend": "+6.8%", "active_skus": 6, "status": "STABLE_HIGH"},
            {"category": "Security Hardware", "avg_score": 62, "trend": "+2.4%", "active_skus": 5, "status": "STABLE"},
            {"category": "Accessories", "avg_score": 58, "trend": "-1.5%", "active_skus": 12, "status": "MATURE"},
            {"category": "Peripherals", "avg_score": 38, "trend": "-14.2%", "active_skus": 15, "status": "DECLINING_RISK"},
        ]

        avg_score = int(round(sum(p["demand_score"] for p in enriched_products) / len(enriched_products)))

        return {
            "summary": {
                "average_demand_score": avg_score,
                "total_products_tracked": len(enriched_products),
                "trending_count": len(trending_list),
                "growing_count": len(growing_list),
                "stable_count": len(stable_list),
                "declining_count": len(declining_list),
                "dead_inventory_count": len(dead_list),
                "dead_inventory_tied_capital_inr": total_dead_tied_capital,
                "projected_revenue_lift_inr": projected_total_lift,
                "active_campaign_recommendations_count": len(autonomous_campaigns),
            },
            "products": enriched_products,
            "trending_products": trending_list,
            "growing_products": growing_list,
            "declining_products": declining_list,
            "dead_inventory": dead_list,
            "autonomous_campaigns": autonomous_campaigns,
            "growth_insights": growth_insights,
            "category_heatmap": category_heatmap,
        }

    def get_inventory_optimization(self) -> Dict[str, Any]:
        data = self.get_demand_intelligence()
        products = data["products"]

        fast_movers = [p for p in products if p["inventory_velocity"] >= 3.0]
        slow_movers = [p for p in products if p["inventory_velocity"] < 0.5]
        understocked = [p for p in products if p["days_to_stockout"] <= 7]
        overstocked = [p for p in products if p["stock"] > 50 and p["inventory_velocity"] < 1.0]

        total_overstock_capital = sum(p["cost_price"] * p["stock"] for p in overstocked)

        restock_queue = []
        for p in understocked:
            recommended_units = int(round(p["inventory_velocity"] * 30))
            restock_queue.append({
                "product_id": p["id"],
                "product_name": p["name"],
                "category": p["category"],
                "current_stock": p["stock"],
                "daily_velocity": p["inventory_velocity"],
                "days_to_stockout": p["days_to_stockout"],
                "recommended_restock_units": recommended_units,
                "estimated_reorder_cost_inr": p["cost_price"] * recommended_units,
                "supplier_lead_time_days": p["supplier_lead_time_days"],
                "urgency": "CRITICAL" if p["days_to_stockout"] <= 4 else "HIGH"
            })

        return {
            "overview": {
                "fast_movers_count": len(fast_movers),
                "slow_movers_count": len(slow_movers),
                "understocked_count": len(understocked),
                "overstocked_count": len(overstocked),
                "tied_up_overstock_capital_inr": total_overstock_capital,
                "total_skus": len(products)
            },
            "fast_movers": fast_movers,
            "slow_movers": slow_movers,
            "understocked": understocked,
            "overstocked": overstocked,
            "restock_queue": restock_queue
        }

    def apply_discount(self, product_id: str, discount_pct: float) -> Dict[str, Any]:
        for p in self.products:
            if p["id"] == product_id:
                old_price = p["price"]
                new_price = round(old_price * (1.0 - (discount_pct / 100.0)), 2)
                p["discount_applied"] = discount_pct
                p["discounted_price"] = new_price
                return {
                    "success": True,
                    "product_id": product_id,
                    "product_name": p["name"],
                    "old_price": old_price,
                    "new_price": new_price,
                    "discount_pct": discount_pct,
                    "message": f"Successfully applied {discount_pct}% discount on {p['name']}. New price: ₹{new_price:,.2f}"
                }
        return {"success": False, "message": f"Product with ID '{product_id}' not found."}


demand_intelligence_service = DemandIntelligenceService()
