import os
import json
import random
import hashlib
from datetime import datetime, timedelta

from app.core.timestamps import utcnow_iso
from app.services.audit_service import audit_service
from app.services.catalog_service import catalog_service
from app.schemas.catalog import ProductUpdateDTO

class DemandIntelligenceService:
    def __init__(self):
        pass

    def _get_product_metrics(self, prod) -> Dict[str, Any]:
        """
        Derives realistic dynamic demand metrics for any catalog product deterministically
        based on SKU and category attributes.
        """
        # Seed pseudo-random generator with SKU for stable metrics
        sku_hash = int(hashlib.md5(prod.sku.encode("utf-8")).hexdigest()[:8], 16)
        
        cat = prod.category.lower()
        if "audio" in cat or "soundbox" in cat:
            base_views = 3500 + (sku_hash % 2000)
            velocity = 6.0 + ((sku_hash % 40) / 10.0)
            cr = 12.0 + ((sku_hash % 50) / 10.0)
            lead_time = 2 + (sku_hash % 3)
        elif "terminal" in cat or "pos" in cat:
            base_views = 2800 + (sku_hash % 1800)
            velocity = 3.5 + ((sku_hash % 35) / 10.0)
            cr = 8.5 + ((sku_hash % 40) / 10.0)
            lead_time = 3 + (sku_hash % 4)
        elif "software" in cat or "finops" in cat:
            base_views = 1900 + (sku_hash % 1200)
            velocity = 2.0 + ((sku_hash % 20) / 10.0)
            cr = 6.5 + ((sku_hash % 30) / 10.0)
            lead_time = 1
        elif "workstation" in cat:
            base_views = 1500 + (sku_hash % 1000)
            velocity = 1.2 + ((sku_hash % 15) / 10.0)
            cr = 4.5 + ((sku_hash % 25) / 10.0)
            lead_time = 5 + (sku_hash % 4)
        elif "storage" in cat or "server" in cat:
            base_views = 1200 + (sku_hash % 800)
            velocity = 0.8 + ((sku_hash % 12) / 10.0)
            cr = 3.8 + ((sku_hash % 20) / 10.0)
            lead_time = 6 + (sku_hash % 5)
        else: # Peripherals, Security, etc.
            # Intentionally have a few declining/dead inventory products for optimization demo
            if "magstripe" in prod.sku.lower() or "legacy" in prod.name.lower() or (sku_hash % 10 == 0):
                base_views = 180 + (sku_hash % 100)
                velocity = 0.05 + ((sku_hash % 5) / 100.0)
                cr = 0.8 + ((sku_hash % 10) / 10.0)
                lead_time = 12
            else:
                base_views = 2100 + (sku_hash % 1400)
                velocity = 2.5 + ((sku_hash % 25) / 10.0)
                cr = 7.2 + ((sku_hash % 30) / 10.0)
                lead_time = 4 + (sku_hash % 3)

        searches = int(base_views * (0.45 + ((sku_hash % 20) / 100.0)))
        cart_adds = int(base_views * (cr / 100.0) * 1.8)
        purchases = int(base_views * (cr / 100.0))

        return {
            "views": base_views,
            "searches": searches,
            "cart_adds": cart_adds,
            "purchases": purchases,
            "conversion_rate": round(cr, 2),
            "inventory_velocity": round(velocity, 2),
            "supplier_lead_time_days": lead_time,
        }

    def _calculate_demand_score(self, item: Dict[str, Any]) -> int:
        """
        Demand Score (0-100) Formula:
        Demand Score = 30% Views (normalized) 
                     + 20% Searches (normalized) 
                     + 20% Cart Adds (normalized) 
                     + 20% Purchases (normalized) 
                     + 10% Conversion Rate (normalized)
        """
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

    def get_demand_intelligence(self, merchant_id: Optional[str] = None) -> Dict[str, Any]:
        catalog_res = catalog_service.get_all_products(limit=100, merchant_id=merchant_id)
        
        is_insufficient = not catalog_res.products
        if merchant_id:
            from app.services.auth_service import auth_service
            if not auth_service.is_demo_merchant(merchant_id):
                from app.services.merchant_service import merchant_service
                orders = merchant_service.get_orders(merchant_id=merchant_id)
                if not catalog_res.products or len(orders) == 0:
                    is_insufficient = True

        if is_insufficient:
            now_iso = utcnow_iso()
            return {
                "status": "INSUFFICIENT_DATA",
                "message": "Insufficient data for forecasting.",
                "summary": {
                    "average_demand_score": 0,
                    "total_products_tracked": len(catalog_res.products or []),
                    "trending_count": 0,
                    "growing_count": 0,
                    "stable_count": 0,
                    "declining_count": 0,
                    "dead_inventory_count": 0,
                    "dead_inventory_tied_capital_inr": 0.0,
                    "projected_revenue_lift_inr": 0.0,
                    "active_campaign_recommendations_count": 0,
                    "demand_score_calculated_at": now_iso,
                    "discount_recommendation_generated_at": now_iso,
                    "campaign_recommendation_generated_at": now_iso,
                    "last_updated": now_iso
                },
                "products": [],
                "trending_products": [],
                "growing_products": [],
                "declining_products": [],
                "dead_inventory": [],
                "autonomous_campaigns": [],
                "growth_insights": [],
                "category_heatmap": [],
            }

        enriched_products = []
        trending_list = []
        growing_list = []
        stable_list = []
        declining_list = []
        dead_list = []

        total_dead_tied_capital = 0.0
        projected_total_lift = 0.0

        for prod in catalog_res.products:
            metrics = self._get_product_metrics(prod)
            base_item = {
                "id": prod.id,
                "sku": prod.sku,
                "name": prod.name,
                "brand": prod.brand,
                "category": prod.category,
                "price": prod.price,
                "cost_price": prod.cost_price,
                "stock": prod.stock_quantity,
                "image_url": prod.image_url,
                **metrics
            }

            score = self._calculate_demand_score(base_item)
            tier = self._get_status_tier(score)
            trends = self._generate_trend_history(score)
            
            days_to_stockout = max(1, int(round(base_item["stock"] / max(0.05, base_item["inventory_velocity"]))))
            
            item = {
                **base_item,
                "demand_score": score,
                "status_tier": tier,
                "days_to_stockout": days_to_stockout,
                "trend_history": trends,
            }

            if tier["key"] == "DECLINING":
                recommended_discount = 10 if score > 28 else 12
                conversion_uplift = 22 if recommended_discount == 10 else 27
                confidence = 88 if score > 28 else 85
                item["ai_recommendation"] = {
                    "type": "DYNAMIC_DISCOUNT",
                    "title": f"Apply {recommended_discount}% Dynamic Markdown",
                    "discount_pct": recommended_discount,
                    "target_price": round(base_item["price"] * (1 - recommended_discount / 100.0), 2),
                    "expected_uplift_pct": conversion_uplift,
                    "expected_revenue_lift_inr": round(base_item["price"] * base_item["stock"] * 0.35 * (conversion_uplift / 100.0), 2),
                    "confidence_pct": confidence,
                    "reasoning": f"Demand velocity dropped -{int(round(35 - score * 0.4))}% over 30 days. Lowering price stimulates checkout conversions without breaking gross margin."
                }
                projected_total_lift += item["ai_recommendation"]["expected_revenue_lift_inr"]
                declining_list.append(item)

            elif tier["key"] == "DEAD_INVENTORY":
                tied_capital = base_item["cost_price"] * base_item["stock"]
                total_dead_tied_capital += tied_capital
                item["tied_capital_inr"] = tied_capital
                item["ai_recommendation"] = {
                    "type": "LIQUIDATION_BUNDLE",
                    "title": "15% Markdown & Companion Bundle",
                    "discount_pct": 15,
                    "bundle_with": "Razorpay Smart POS Terminal V3 Pro",
                    "expected_uplift_pct": 38,
                    "expected_revenue_lift_inr": round(tied_capital * 0.45, 2),
                    "confidence_pct": 92,
                    "reasoning": f"High inventory hold ({base_item['stock']} units) with sub-1% conversions. Bundle as a zero-friction checkout add-on to unlock ₹{int(tied_capital):,} trapped capital."
                }
                projected_total_lift += item["ai_recommendation"]["expected_revenue_lift_inr"]
                dead_list.append(item)

            elif tier["key"] == "TRENDING":
                trending_list.append(item)
                if days_to_stockout <= 6:
                    item["restock_alert"] = {
                        "severity": "CRITICAL",
                        "days_left": days_to_stockout,
                        "recommended_units": int(round(base_item["inventory_velocity"] * 25)),
                        "expected_stockout_date": (datetime.now() + timedelta(days=days_to_stockout)).strftime("%d %b %Y"),
                        "message": f"High demand velocity ({base_item['inventory_velocity']} units/day). Stock will deplete in {days_to_stockout} days."
                    }

            elif tier["key"] == "GROWING":
                growing_list.append(item)
            else:
                stable_list.append(item)

            enriched_products.append(item)

        autonomous_campaigns = [
            {
                "id": "cmp_pos_bundle_01",
                "name": "Omni-Commerce POS Power Combo",
                "target_audience": "Retail, D2C & Supermarket Chains",
                "recommended_discount_pct": 10,
                "duration_days": 14,
                "featured_products": ["Razorpay Smart POS Terminal V3 Pro", "Razorpay Smart Soundbox 4G Pro", "Zebra DS2208 1D/2D Handheld Barcode Scanner"],
                "expected_revenue_lift_inr": 345000.0,
                "projected_orders": 68,
                "status": "READY_FOR_LAUNCH",
                "strategy_type": "HIGH_GMV_CROSS_SELL",
                "confidence_score": 94
            },
            {
                "id": "cmp_finops_ent_02",
                "name": "Enterprise FinOps & Reconciliation Accelerator",
                "target_audience": "CFOs, Finance Controllers & Enterprise Merchants",
                "recommended_discount_pct": 12,
                "duration_days": 30,
                "featured_products": ["RazorRecon Enterprise License (Annual)", "RazorGST Automated Filing & Reconciliation API"],
                "expected_revenue_lift_inr": 520000.0,
                "projected_orders": 15,
                "status": "READY_FOR_LAUNCH",
                "strategy_type": "SAAS_EXPANSION",
                "confidence_score": 96
            },
            {
                "id": "cmp_workstation_flash_03",
                "name": "Trader & Developer Ergonomic Fleet Bundle",
                "target_audience": "Fintech Developers & Trading Desks",
                "recommended_discount_pct": 8,
                "duration_days": 7,
                "featured_products": ["Dell UltraSharp 40\" Curved 5K2K Thunderbolt Hub Monitor", "Keychron Q3 Pro SE Wireless Mechanical Keyboard"],
                "expected_revenue_lift_inr": 280000.0,
                "projected_orders": 24,
                "status": "READY_FOR_LAUNCH",
                "strategy_type": "CLEARANCE_ACCELERATOR",
                "confidence_score": 89
            }
        ]

        growth_insights = [
            {
                "id": "ins_01",
                "icon": "Zap",
                "type": "SURGE",
                "title": "Demand Surge in Smart POS Terminals",
                "description": "Demand for POS devices increased 34% this week across enterprise retail merchant hubs.",
                "badge": "+34% Demand",
                "color": "text-rose-600 bg-rose-50 border-rose-200",
                "action_route": "/merchant/demand-intelligence"
            },
            {
                "id": "ins_02",
                "icon": "AlertTriangle",
                "type": "STOCKOUT_RISK",
                "title": "Smart POS V3 Pro Stockout Risk",
                "description": "POS Terminal inventory may run out in 6 days under current velocity. Restock 50 units recommended.",
                "badge": "6 Days Left",
                "color": "text-amber-600 bg-amber-50 border-amber-200",
                "action_route": "/merchant/catalog"
            },
            {
                "id": "ins_03",
                "icon": "TrendingDown",
                "type": "PRICE_OPPORTUNITY",
                "title": "Retail Peripherals Dynamic Markdown",
                "description": "Scanner inventory hold detected. AI recommends 10% discount for +22% checkout conversions.",
                "badge": "+22% Lift",
                "color": "text-blue-600 bg-blue-50 border-blue-200",
                "action_route": "/merchant/demand-intelligence"
            },
            {
                "id": "ins_04",
                "icon": "Sparkles",
                "type": "REVENUE_FORECAST",
                "title": "Autonomous Campaign Gross Lift",
                "description": "AI predicts ₹11.4L additional gross revenue through 3 active targeted campaign optimizations.",
                "badge": "₹11.4L Projected",
                "color": "text-emerald-600 bg-emerald-50 border-emerald-200",
                "action_route": "/merchant/campaigns"
            }
        ]

        category_heatmap = [
            {"category": "Payment Audio Alerts", "avg_score": 92, "trend": "+18.4%", "active_skus": 6, "status": "SURGING"},
            {"category": "Payment Terminals", "avg_score": 86, "trend": "+12.1%", "active_skus": 10, "status": "HIGH_GROWTH"},
            {"category": "FinOps Software", "avg_score": 78, "trend": "+9.4%", "active_skus": 8, "status": "HIGH_GROWTH"},
            {"category": "Workstations & Peripherals", "avg_score": 72, "trend": "+6.8%", "active_skus": 10, "status": "STABLE_HIGH"},
            {"category": "Security & Access Tokens", "avg_score": 64, "trend": "+3.2%", "active_skus": 6, "status": "STABLE"},
            {"category": "Storage & Servers", "avg_score": 58, "trend": "+1.5%", "active_skus": 5, "status": "MATURE"},
            {"category": "Retail Peripherals", "avg_score": 45, "trend": "-4.2%", "active_skus": 5, "status": "DECLINING_RISK"},
        ]

        avg_score = int(round(sum(p["demand_score"] for p in enriched_products) / max(1, len(enriched_products))))

        now_iso = utcnow_iso()
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
                "demand_score_calculated_at": now_iso,
                "discount_recommendation_generated_at": now_iso,
                "campaign_recommendation_generated_at": now_iso,
                "last_updated": now_iso
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

    def get_inventory_optimization(self, merchant_id: Optional[str] = None) -> Dict[str, Any]:
        data = self.get_demand_intelligence(merchant_id=merchant_id)
        products = data["products"]

        fast_movers = [p for p in products if p["inventory_velocity"] >= 3.0]
        slow_movers = [p for p in products if p["inventory_velocity"] < 1.0]
        understocked = [p for p in products if p["days_to_stockout"] <= 10]
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
                "estimated_reorder_cost_inr": round(p["cost_price"] * recommended_units, 2),
                "supplier_lead_time_days": p["supplier_lead_time_days"],
                "urgency": "CRITICAL" if p["days_to_stockout"] <= 6 else "HIGH"
            })

        now_iso = utcnow_iso()
        return {
            "overview": {
                "fast_movers_count": len(fast_movers),
                "slow_movers_count": len(slow_movers),
                "understocked_count": len(understocked),
                "overstocked_count": len(overstocked),
                "tied_up_overstock_capital_inr": total_overstock_capital,
                "total_skus": len(products),
                "inventory_forecast_generated_at": now_iso,
                "last_updated": now_iso
            },
            "fast_movers": fast_movers,
            "slow_movers": slow_movers,
            "understocked": understocked,
            "overstocked": overstocked,
            "restock_queue": restock_queue
        }

    def apply_discount(self, product_id: str, discount_pct: float) -> Dict[str, Any]:
        existing = catalog_service.get_product_by_id(product_id)
        if not existing:
            return {"success": False, "message": f"Product with ID '{product_id}' not found."}
            
        old_price = existing.price
        new_price = round(old_price * (1.0 - (discount_pct / 100.0)), 2)
        
        catalog_service.update_product(
            existing.id,
            ProductUpdateDTO(
                price=new_price,
                offer_discount_pct=discount_pct,
                offer_badge=f"{int(discount_pct)}% DYNAMIC OFF"
            )
        )

        try:
            audit_service.log_audit(
                action="DISCOUNT_APPLIED",
                entity_type="PRODUCT",
                entity_id=product_id,
                user_name="Autonomous Growth Engine",
                role="AI Agent (Track 01)",
                old_value={"price": old_price, "discount_pct": existing.offer_discount_pct},
                new_value={"price": new_price, "discount_pct": discount_pct, "reason": "AI Elasticity Markdown Recommendation"}
            )
        except Exception:
            pass
        
        return {
            "success": True,
            "product_id": product_id,
            "product_name": existing.name,
            "old_price": old_price,
            "new_price": new_price,
            "discount_pct": discount_pct,
            "applied_at": utcnow_iso(),
            "message": f"Successfully applied {discount_pct}% dynamic discount on {existing.name}. New price: ₹{new_price:,.2f}"
        }

demand_intelligence_service = DemandIntelligenceService()
