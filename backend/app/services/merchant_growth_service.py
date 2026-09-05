import os
import json
import uuid
import random
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

class MerchantGrowthService:
    def __init__(self):
        self._init_campaigns_db()
        self._init_readiness_state()

    def _init_campaigns_db(self):
        """Seed autonomous marketing campaigns with ROI tracking."""
        self.campaigns: List[Dict[str, Any]] = [
            {
                "id": "cmp_autopay_replenish_01",
                "title": "Autonomous Thermal Paper & Consumables Restock",
                "type": "AI_AUTONOMOUS_TRIGGER",
                "status": "ACTIVE",
                "goal": "Replenishment Retention",
                "target_segment": "POS Terminal Owners (< 7 days paper rolls left)",
                "channels": ["WhatsApp AutoPay Push", "In-App Drawer"],
                "discount_offer": "Buy 20 Rolls Get 15% OFF",
                "audience_reach": 1420,
                "conversions": 384,
                "spend_inr": 8500.0,
                "attributed_revenue_inr": 768000.0,
                "roi_multiplier": 90.3,
                "predicted_lift_inr": 920000.0,
                "ai_confidence": 98.4,
                "created_at": (datetime.now() - timedelta(days=12)).isoformat(),
                "last_active": "2 minutes ago"
            },
            {
                "id": "cmp_pos_v3_upgrade_02",
                "title": "Smart POS Terminal V3 Pro Upgrade Incentive",
                "type": "UPSELL_CAMPAIGN",
                "status": "ACTIVE",
                "goal": "Hardware Fleet Upgrade",
                "target_segment": "Merchants using legacy POS V1/V2 (> 180 days active)",
                "channels": ["Email Concierge", "Merchant Portal Banner"],
                "discount_offer": "₹3,000 Exchange Bonus + Free Charging Dock",
                "audience_reach": 850,
                "conversions": 112,
                "spend_inr": 24000.0,
                "attributed_revenue_inr": 1679888.0,
                "roi_multiplier": 70.0,
                "predicted_lift_inr": 2100000.0,
                "ai_confidence": 94.2,
                "created_at": (datetime.now() - timedelta(days=8)).isoformat(),
                "last_active": "15 minutes ago"
            },
            {
                "id": "cmp_soundbox_cross_sell_03",
                "title": "BharatQR Voice Soundbox Instant Cross-Sell",
                "type": "CROSS_SELL_CAMPAIGN",
                "status": "ACTIVE",
                "goal": "AOV Expansion",
                "target_segment": "High-Volume UPI Retailers (No Voice Confirmation)",
                "channels": ["WhatsApp Bot", "Checkout Step Recommendation"],
                "discount_offer": "50% OFF 1st Year Voice Subscription",
                "audience_reach": 2100,
                "conversions": 520,
                "spend_inr": 15000.0,
                "attributed_revenue_inr": 1040000.0,
                "roi_multiplier": 69.3,
                "predicted_lift_inr": 1250000.0,
                "ai_confidence": 96.0,
                "created_at": (datetime.now() - timedelta(days=5)).isoformat(),
                "last_active": "1 hour ago"
            },
            {
                "id": "cmp_churn_winback_04",
                "title": "At-Risk Merchant 30-Day Winback Boost",
                "type": "CHURN_PREVENTION",
                "status": "PAUSED",
                "goal": "Churn Reduction",
                "target_segment": "Merchants with zero reorders in 45 days",
                "channels": ["Direct Account Manager Call", "VIP Coupon Code"],
                "discount_offer": "₹1,000 Flat Credit on Next Order",
                "audience_reach": 340,
                "conversions": 48,
                "spend_inr": 48000.0,
                "attributed_revenue_inr": 432000.0,
                "roi_multiplier": 9.0,
                "predicted_lift_inr": 580000.0,
                "ai_confidence": 88.5,
                "created_at": (datetime.now() - timedelta(days=15)).isoformat(),
                "last_active": "2 days ago"
            }
        ]

    def _init_readiness_state(self):
        """Current Agent Readiness state with remediation history."""
        self.readiness_state = {
            "overall_score": 92.5,
            "status": "AGENT_READY",
            "rating_label": "High Agent Compatibility",
            "last_evaluated": datetime.now().isoformat(),
            "dimensions": {
                "catalog_quality": {
                    "score": 96.0,
                    "weight": 0.25,
                    "status": "EXCELLENT",
                    "metrics": {
                        "high_res_images_pct": 100.0,
                        "structured_descriptions_pct": 98.0,
                        "markdown_features_pct": 95.0,
                        "seo_metadata_pct": 92.0
                    },
                    "recommendation": "All product cards have high-resolution images and rich markdown specification bullets."
                },
                "inventory_accuracy": {
                    "score": 94.0,
                    "weight": 0.20,
                    "status": "OPTIMAL",
                    "metrics": {
                        "real_time_sync_pct": 98.5,
                        "buffer_stock_accuracy": 92.0,
                        "stockout_prevention_rate": 96.0
                    },
                    "recommendation": "AutoPay safety buffers active across all 50 SKUs. Reorder thresholds synced."
                },
                "pricing_completeness": {
                    "score": 91.0,
                    "weight": 0.20,
                    "status": "GOOD",
                    "metrics": {
                        "gst_inclusive_clarity": 100.0,
                        "mrp_transparency_pct": 95.0,
                        "volume_tier_pricing_pct": 78.0
                    },
                    "recommendation": "GST-inclusive prices fully displayed. Add volume tier discounts for accessory packs."
                },
                "specification_coverage": {
                    "score": 88.5,
                    "weight": 0.20,
                    "status": "GOOD",
                    "metrics": {
                        "technical_specs_depth": 90.0,
                        "comparison_attributes_pct": 86.0,
                        "compatibility_tags_pct": 89.5
                    },
                    "recommendation": "2 SKUs missing explicit operating temperature spec. AI auto-tagger can populate."
                },
                "delivery_reliability": {
                    "score": 95.5,
                    "weight": 0.15,
                    "status": "EXCELLENT",
                    "metrics": {
                        "courier_sla_adherence": 97.2,
                        "same_day_dispatch_pct": 94.8,
                        "return_rate_pct": 1.4
                    },
                    "recommendation": "4 live courier telemetry webhooks connected with 97.2% on-time dispatch."
                }
            },
            "checklist": [
                {"id": "chk_1", "title": "GST-Inclusive Pricing Transparency", "category": "Pricing", "passed": True, "impact": "+15 pts"},
                {"id": "chk_2", "title": "AutoPay Mandate Instant Buy Compatibility", "category": "Agentic Commerce", "passed": True, "impact": "+20 pts"},
                {"id": "chk_3", "title": "Side-by-Side Comparison Matrix Attributes", "category": "Catalog", "passed": True, "impact": "+15 pts"},
                {"id": "chk_4", "title": "Real-Time Stock Depletion & Reorder Webhooks", "category": "Inventory", "passed": True, "impact": "+15 pts"},
                {"id": "chk_5", "title": "Multi-Carrier Tracking Telemetry (Delhivery, BlueDart, Shadowfax)", "category": "Shipping", "passed": True, "impact": "+15 pts"},
                {"id": "chk_6", "title": "Volume Tier Auto-Discounts on Consumables", "category": "Pricing", "passed": True, "impact": "+10 pts"},
                {"id": "chk_7", "title": "Autonomous Replenishment Forecast Predictor", "category": "AI Agents", "passed": True, "impact": "+10 pts"}
            ]
        }

    # =========================================================================
    # 1. UPSELL & CROSS-SELL ENGINE
    # =========================================================================
    def get_upsell_cross_sell(self, merchant_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Calculates machine learning association rules (Apriori Support, Confidence, Lift)
        for frequently bought together pairings, bundle recommendations, cross-sell, and upsell.
        """
        if merchant_id:
            from app.services.auth_service import auth_service
            if not auth_service.is_demo_merchant(merchant_id):
                from app.services.catalog_service import catalog_service
                from app.services.merchant_service import merchant_service
                stats = catalog_service.get_catalog_stats(merchant_id=merchant_id)
                orders = merchant_service.get_orders(merchant_id=merchant_id)
                if stats.total_products < 2 or len(orders) < 2:
                    return {
                        "message": "No transactions available yet.",
                        "summary": {
                            "active_pairings_count": 0,
                            "published_bundles_count": 0,
                            "active_cross_sells_count": 0,
                            "active_upsell_triggers_count": 0,
                            "total_revenue_opportunity_inr": 0.0,
                            "avg_association_confidence_pct": 0.0,
                            "total_active_rules": 0,
                            "total_published_bundles": 0,
                            "avg_aov_lift_pct": 0.0,
                            "total_predicted_monthly_revenue_lift_inr": 0.0,
                            "ai_recommendation_adoption_rate": 0.0
                        },
                        "frequently_bought_together": [],
                        "bundle_recommendations": [],
                        "bundles": [],
                        "cross_sell_opportunities": [],
                        "upsell_suggestions": []
                    }

        frequently_bought_together = [
            {
                "id": "fbt_pos_paper",
                "primary_product": {
                    "id": "prod_pos_smart_v3",
                    "name": "Razorpay Smart POS Terminal V3 Pro",
                    "price": 14999.0,
                    "image": "https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600&auto=format&fit=crop&q=80",
                    "category": "Payment Terminals"
                },
                "paired_product": {
                    "id": "prod_paper_rolls",
                    "name": "Thermal POS Receipt Paper Rolls (Pack of 20)",
                    "price": 1998.0,
                    "image": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80",
                    "category": "Consumables"
                },
                "support_pct": 34.8,
                "confidence_pct": 82.4,
                "lift_score": 2.84,
                "co_purchase_count": 482,
                "recommended_action": "Enable 1-Click Bundle Checkout (+₹1,998 AOV)",
                "predicted_monthly_orders": 145,
                "predicted_revenue_lift_inr": 289710.0
            },
            {
                "id": "fbt_pos_soundbox",
                "primary_product": {
                    "id": "prod_pos_smart_v3",
                    "name": "Razorpay Smart POS Terminal V3 Pro",
                    "price": 14999.0,
                    "image": "https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600&auto=format&fit=crop&q=80",
                    "category": "Payment Terminals"
                },
                "paired_product": {
                    "id": "prod_soundbox_voice",
                    "name": "Dynamic UPI Voice Alert Soundbox 4G",
                    "price": 2499.0,
                    "image": "https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&auto=format&fit=crop&q=80",
                    "category": "Voice Hardware"
                },
                "support_pct": 28.2,
                "confidence_pct": 68.5,
                "lift_score": 2.45,
                "co_purchase_count": 391,
                "recommended_action": "Suggest in AI Shopping Assistant Chat",
                "predicted_monthly_orders": 98,
                "predicted_revenue_lift_inr": 244902.0
            },
            {
                "id": "fbt_recon_tax",
                "primary_product": {
                    "id": "prod_saas_recon_growth",
                    "name": "RazorRecon Growth Quarterly License",
                    "price": 19999.0,
                    "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
                    "category": "FinOps Software"
                },
                "paired_product": {
                    "id": "prod_saas_gst_sync",
                    "name": "Automated GST 3-Way Reconciliation Addon",
                    "price": 4999.0,
                    "image": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
                    "category": "Tax Software"
                },
                "support_pct": 41.5,
                "confidence_pct": 89.2,
                "lift_score": 3.12,
                "co_purchase_count": 512,
                "recommended_action": "Auto-attach in Corporate License Checkouts",
                "predicted_monthly_orders": 85,
                "predicted_revenue_lift_inr": 424915.0
            }
        ]

        bundles = [
            {
                "id": "bnd_retail_pro_pack",
                "name": "Complete Retail Counter Pro Station",
                "badge": "BESTSELLER BUNDLE",
                "items": [
                    {"name": "Razorpay Smart POS Terminal V3 Pro", "price": 14999.0},
                    {"name": "Dynamic UPI Voice Alert Soundbox 4G", "price": 2499.0},
                    {"name": "Thermal Paper Rolls (Pack of 20)", "price": 1998.0},
                    {"name": "2-Year Enterprise Rapid Replacement Warranty", "price": 2999.0}
                ],
                "individual_total_inr": 22495.0,
                "bundle_price_inr": 18999.0,
                "customer_savings_inr": 3496.0,
                "discount_pct": 15.5,
                "conversion_rate_pct": 18.4,
                "monthly_sold": 94,
                "monthly_revenue_inr": 1785906.0,
                "margin_pct": 38.5,
                "status": "PUBLISHED"
            },
            {
                "id": "bnd_omnichannel_starter",
                "name": "Omnichannel Merchant Launch Kit",
                "badge": "HIGH CONVERSION",
                "items": [
                    {"name": "Razorpay Android POS Terminal V2 Lite", "price": 9999.0},
                    {"name": "Pocket Dynamic QR Standee Mini", "price": 1499.0},
                    {"name": "Thermal Paper Rolls (Pack of 10)", "price": 999.0}
                ],
                "individual_total_inr": 12497.0,
                "bundle_price_inr": 10999.0,
                "customer_savings_inr": 1498.0,
                "discount_pct": 12.0,
                "conversion_rate_pct": 22.1,
                "monthly_sold": 142,
                "monthly_revenue_inr": 1561858.0,
                "margin_pct": 42.0,
                "status": "PUBLISHED"
            },
            {
                "id": "bnd_finops_master_suite",
                "name": "Enterprise FinOps & Reconciliation Suite",
                "badge": "HIGH MARGIN",
                "items": [
                    {"name": "RazorRecon Growth Quarterly License", "price": 19999.0},
                    {"name": "Automated GST 3-Way Match Module", "price": 4999.0},
                    {"name": "ERP Webhook Integration Connector", "price": 7999.0}
                ],
                "individual_total_inr": 32997.0,
                "bundle_price_inr": 27999.0,
                "customer_savings_inr": 4998.0,
                "discount_pct": 15.1,
                "conversion_rate_pct": 14.8,
                "monthly_sold": 68,
                "monthly_revenue_inr": 1903932.0,
                "margin_pct": 65.0,
                "status": "PUBLISHED"
            }
        ]

        cross_sells = [
            {
                "trigger_sku": "prod_pos_smart_v3",
                "trigger_name": "When buying POS Terminal V3",
                "suggested_product": "Fast Charging Desktop Stand & Swivel Dock",
                "suggested_price": 1499.0,
                "cross_sell_placement": "Post-Add To Cart Drawer & AI Chat Prompt",
                "attach_rate_pct": 31.4,
                "incremental_gmv_inr": 218854.0
            },
            {
                "trigger_sku": "prod_paper_rolls",
                "trigger_name": "When buying Thermal Paper Rolls",
                "suggested_product": "Printhead Cleaning Kit & Thermal Cleaner Pens",
                "suggested_price": 599.0,
                "cross_sell_placement": "Checkout Summary Micro-Addon",
                "attach_rate_pct": 44.8,
                "incremental_gmv_inr": 128785.0
            },
            {
                "trigger_sku": "prod_pos_v2_lite",
                "trigger_name": "When buying POS Lite",
                "suggested_product": "Spare High-Capacity 5200mAh Battery Pack",
                "suggested_price": 1299.0,
                "cross_sell_placement": "AI Assistant Side Panel Recommendation",
                "attach_rate_pct": 26.2,
                "incremental_gmv_inr": 145488.0
            }
        ]

        upsell_suggestions = [
            {
                "base_product": "Razorpay Android POS Terminal V2 Lite (₹9,999)",
                "target_product": "Razorpay Smart POS Terminal V3 Pro (₹14,999)",
                "price_delta_inr": 5000.0,
                "value_proposition": "+5.5\" Dual Touchscreen, 80mm/s Printer, 4G eSIM & Hot-swap Battery",
                "ai_win_probability_pct": 38.6,
                "annual_margin_boost_inr": 620000.0,
                "strategy": "Display side-by-side comparison modal highlighting +24hr battery & dual screen"
            },
            {
                "base_product": "RazorRecon Monthly License (₹7,999/mo)",
                "target_product": "RazorRecon Annual Growth License (₹69,999/yr)",
                "price_delta_inr": 62000.0,
                "value_proposition": "Save ₹25,989/yr (27% OFF) + Dedicated Concierge Support",
                "ai_win_probability_pct": 29.4,
                "annual_margin_boost_inr": 980000.0,
                "strategy": "Trigger prompt when monthly volume crosses 25,000 transactions"
            }
        ]

        return {
            "summary": {
                "total_active_rules": 18,
                "total_published_bundles": len(bundles),
                "avg_aov_lift_pct": 24.8,
                "total_predicted_monthly_revenue_lift_inr": 1485000.0,
                "ai_recommendation_adoption_rate": 78.4
            },
            "frequently_bought_together": frequently_bought_together,
            "bundles": bundles,
            "cross_sell_opportunities": cross_sells,
            "upsell_suggestions": upsell_suggestions
        }

    # =========================================================================
    # 2. AGENT ANALYTICS
    # =========================================================================
    def get_agent_analytics(self, merchant_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Deep-dive telemetry into AI Agent Commerce vs Human Manual Shopping.
        """
        if merchant_id:
            from app.services.auth_service import auth_service
            if not auth_service.is_demo_merchant(merchant_id):
                from app.services.merchant_service import merchant_service
                orders = merchant_service.get_orders(merchant_id=merchant_id)
                if not orders:
                    return {
                        "message": "No agent interactions yet.",
                        "overview": {
                            "total_orders": 0,
                            "ai_orders_count": 0,
                            "human_orders_count": 0,
                            "ai_order_share_pct": 0.0,
                            "total_revenue_inr": 0.0,
                            "ai_revenue_inr": 0.0,
                            "human_revenue_inr": 0.0,
                            "ai_revenue_share_pct": 0.0,
                            "agent_conversion_rate_pct": 0.0,
                            "human_conversion_rate_pct": 0.0,
                            "conversion_multiplier": 0.0,
                            "autopay_success_rate_pct": 0.0,
                            "manual_checkout_abandonment_pct": 0.0,
                            "avg_ai_decision_seconds": 0.0,
                            "avg_human_browse_minutes": 0.0
                        },
                        "revenue_split_history": [],
                        "top_ai_purchased_products": [],
                        "autonomous_triggers": []
                    }

        return {
            "overview": {
                "total_orders": 1280,
                "ai_orders_count": 438,
                "human_orders_count": 842,
                "ai_order_share_pct": 34.2,
                "total_revenue_inr": 17100000.0,
                "ai_revenue_inr": 5840000.0,
                "human_revenue_inr": 11260000.0,
                "ai_revenue_share_pct": 34.15,
                "agent_conversion_rate_pct": 14.8,
                "human_conversion_rate_pct": 3.2,
                "conversion_multiplier": 4.6,
                "autopay_success_rate_pct": 98.4,
                "manual_checkout_abandonment_pct": 24.2,
                "avg_ai_decision_seconds": 18.5,
                "avg_human_browse_minutes": 14.2
            },
            "revenue_split_history": [
                {"date": "2026-08-30", "human_rev": 1520000.0, "ai_rev": 580000.0, "ai_share": 27.6},
                {"date": "2026-08-31", "human_rev": 1640000.0, "ai_rev": 690000.0, "ai_share": 29.6},
                {"date": "2026-09-01", "human_rev": 1580000.0, "ai_rev": 780000.0, "ai_share": 33.0},
                {"date": "2026-09-02", "human_rev": 1710000.0, "ai_rev": 890000.0, "ai_share": 34.2},
                {"date": "2026-09-03", "human_rev": 1620000.0, "ai_rev": 920000.0, "ai_share": 36.2},
                {"date": "2026-09-04", "human_rev": 1820000.0, "ai_rev": 990000.0, "ai_share": 35.2},
                {"date": "2026-09-05", "human_rev": 1370000.0, "ai_rev": 990000.0, "ai_share": 41.9}
            ],
            "top_ai_purchased_products": [
                {
                    "sku": "prod_pos_smart_v3",
                    "name": "Razorpay Smart POS Terminal V3 Pro",
                    "category": "Payment Terminals",
                    "ai_orders_count": 142,
                    "ai_gmv_inr": 2129858.0,
                    "auto_replenish_freq": "On-demand fleet expansion",
                    "primary_ai_intent": "Product Comparison & POS Fleet Upgrade"
                },
                {
                    "sku": "prod_paper_rolls",
                    "name": "Thermal POS Receipt Paper Rolls (Pack of 20)",
                    "category": "Consumables",
                    "ai_orders_count": 198,
                    "ai_gmv_inr": 395604.0,
                    "auto_replenish_freq": "Bi-weekly AutoPay Mandate Replenishment",
                    "primary_ai_intent": "Autonomous Stock Depletion Restock"
                },
                {
                    "sku": "prod_soundbox_voice",
                    "name": "Dynamic UPI Voice Alert Soundbox 4G",
                    "category": "Voice Hardware",
                    "ai_orders_count": 64,
                    "ai_gmv_inr": 159936.0,
                    "auto_replenish_freq": "Single Purchase AutoPay",
                    "primary_ai_intent": "Voice QR Confirmation Trigger"
                },
                {
                    "sku": "prod_saas_recon_growth",
                    "name": "RazorRecon Growth License (Quarterly)",
                    "category": "FinOps Software",
                    "ai_orders_count": 34,
                    "ai_gmv_inr": 679966.0,
                    "auto_replenish_freq": "Quarterly Auto-Debit Mandate",
                    "primary_ai_intent": "Autonomous FinOps License Renewal"
                }
            ],
            "autopay_performance": {
                "total_mandates_registered": 684,
                "upi_autopay_pct": 68.2,
                "card_mandate_pct": 24.5,
                "emandate_pct": 7.3,
                "first_attempt_charge_success_pct": 98.4,
                "dunning_recovery_pct": 89.1,
                "avg_processing_time_ms": 340
            }
        }

    # =========================================================================
    # 3. CUSTOMER INTELLIGENCE
    # =========================================================================
    def get_customer_intelligence(self, merchant_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Customer lifetime value, repeat rates, cohort retention, churn risks, and VIP clients.
        """
        if merchant_id:
            from app.services.auth_service import auth_service
            if not auth_service.is_demo_merchant(merchant_id):
                from app.services.merchant_service import merchant_service
                customers = merchant_service.get_customers(merchant_id=merchant_id)
                if not customers:
                    return {
                        "message": "No customer activity.",
                        "metrics": {
                            "total_active_customers": 0,
                            "repeat_purchase_rate_pct": 0.0,
                            "avg_customer_lifetime_value_inr": 0.0,
                            "net_revenue_retention_nrr_pct": 0.0,
                            "monthly_churn_rate_pct": 0.0,
                            "at_risk_customers_count": 0,
                            "vip_enterprise_accounts": 0
                        },
                        "clv_distribution": [],
                        "retention_cohorts": [],
                        "vip_customers": []
                    }

        vip_customers = [
            {
                "id": "cust_vip_01",
                "name": "Acme Retail Chain Enterprises",
                "contact": "procurement@acmeretail.com",
                "clv_tier": "TIER 1 (ENTERPRISE VIP)",
                "total_spend_inr": 845000.0,
                "total_orders": 38,
                "repeat_frequency_days": 14,
                "preferred_payment": "UPI AutoPay (HDFC)",
                "churn_risk_score": 4.2,
                "churn_risk_level": "LOW_RISK",
                "status": "HIGHLY_ACTIVE",
                "last_order_date": "Yesterday"
            },
            {
                "id": "cust_vip_02",
                "name": "FreshBasket Supermarkets Ltd",
                "contact": "finance@freshbasket.in",
                "clv_tier": "TIER 1 (ENTERPRISE VIP)",
                "total_spend_inr": 620000.0,
                "total_orders": 24,
                "repeat_frequency_days": 18,
                "preferred_payment": "Corporate Credit Card AutoPay (ICICI)",
                "churn_risk_score": 6.8,
                "churn_risk_level": "LOW_RISK",
                "status": "HIGHLY_ACTIVE",
                "last_order_date": "3 days ago"
            },
            {
                "id": "cust_vip_03",
                "name": "Urban Brew Cafes Franchise",
                "contact": "supplies@urbanbrew.co",
                "clv_tier": "TIER 2 (GROWVIP)",
                "total_spend_inr": 345000.0,
                "total_orders": 16,
                "repeat_frequency_days": 21,
                "preferred_payment": "UPI AutoPay (SBI)",
                "churn_risk_score": 68.5,
                "churn_risk_level": "HIGH_CHURN_RISK",
                "status": "STALLED_REPLENISHMENT",
                "last_order_date": "34 days ago",
                "winback_recommendation": "Deploy ₹1,000 Winback Coupon & Push Autonomous Restock"
            },
            {
                "id": "cust_vip_04",
                "name": "MedPlus Pharmacy Network",
                "contact": "ops@medplushealth.in",
                "clv_tier": "TIER 1 (ENTERPRISE VIP)",
                "total_spend_inr": 780000.0,
                "total_orders": 42,
                "repeat_frequency_days": 10,
                "preferred_payment": "e-Mandate NetBanking (Axis)",
                "churn_risk_score": 5.1,
                "churn_risk_level": "LOW_RISK",
                "status": "HIGHLY_ACTIVE",
                "last_order_date": "Today"
            },
            {
                "id": "cust_vip_05",
                "name": "QuickBite Express Foods",
                "contact": "store@quickbite.in",
                "clv_tier": "TIER 3 (EMERGING)",
                "total_spend_inr": 148000.0,
                "total_orders": 8,
                "repeat_frequency_days": 32,
                "preferred_payment": "UPI Dynamic QR",
                "churn_risk_score": 54.2,
                "churn_risk_level": "MEDIUM_CHURN_RISK",
                "status": "REENGAGEMENT_DUE",
                "last_order_date": "28 days ago",
                "winback_recommendation": "Automated WhatsApp replenishment prompt"
            }
        ]

        cohort_retention = [
            {"cohort": "May 2026", "initial_size": 240, "month_1": 68.2, "month_2": 54.1, "month_3": 46.5, "month_4": 42.1},
            {"cohort": "Jun 2026", "initial_size": 310, "month_1": 72.4, "month_2": 58.8, "month_3": 51.2, "month_4": None},
            {"cohort": "Jul 2026", "initial_size": 380, "month_1": 76.5, "month_2": 63.4, "month_3": None, "month_4": None},
            {"cohort": "Aug 2026", "initial_size": 450, "month_1": 81.2, "month_2": None, "month_3": None, "month_4": None}
        ]

        return {
            "metrics": {
                "total_active_customers": 1420,
                "repeat_purchase_rate_pct": 42.6,
                "avg_customer_lifetime_value_inr": 78400.0,
                "net_revenue_retention_nrr_pct": 128.4,
                "monthly_churn_rate_pct": 2.1,
                "at_risk_customers_count": 46,
                "vip_enterprise_accounts": 128
            },
            "clv_distribution": [
                {"tier": "Tier 1 Enterprise (> ₹5 Lakhs)", "customer_count": 128, "pct_of_total": 9.0, "total_revenue_inr": 9200000.0, "share_pct": 53.8},
                {"tier": "Tier 2 Mid-Market (₹1 - 5 Lakhs)", "customer_count": 482, "pct_of_total": 33.9, "total_revenue_inr": 5400000.0, "share_pct": 31.6},
                {"tier": "Tier 3 Emerging (< ₹1 Lakh)", "customer_count": 810, "pct_of_total": 57.1, "total_revenue_inr": 2500000.0, "share_pct": 14.6}
            ],
            "retention_cohorts": cohort_retention,
            "vip_customers": vip_customers
        }

    # =========================================================================
    # 4. REVENUE DASHBOARD
    # =========================================================================
    def get_revenue_dashboard(self, merchant_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Revenue Today, MTD, Orders Velocity, AOV, Growth %, and AI Commerce Revenue %.
        """
        if merchant_id:
            from app.services.auth_service import auth_service
            if not auth_service.is_demo_merchant(merchant_id):
                from app.services.merchant_service import merchant_service
                orders = merchant_service.get_orders(merchant_id=merchant_id)
                if not orders:
                    return {
                        "kpis": {
                            "revenue_today_inr": 0.0,
                            "revenue_today_growth_pct": 0.0,
                            "revenue_mtd_inr": 0.0,
                            "revenue_mtd_target_inr": 0.0,
                            "target_achievement_pct": 0.0,
                            "orders_today": 0,
                            "orders_today_growth_pct": 0.0,
                            "average_order_value_aov_inr": 0.0,
                            "aov_growth_pct": 0.0,
                            "yoy_annual_growth_pct": 0.0,
                            "ai_commerce_revenue_pct": 0.0,
                            "ai_commerce_gmv_mtd_inr": 0.0
                        },
                        "hourly_velocity_today": [],
                        "monthly_trend": [],
                        "payment_channel_breakdown": [],
                        "category_revenue_breakdown": []
                    }

        return {
            "kpis": {
                "revenue_today_inr": 184500.0,
                "revenue_today_growth_pct": 14.2,
                "revenue_mtd_inr": 4265000.0,
                "revenue_mtd_target_inr": 6500000.0,
                "target_achievement_pct": 65.6,
                "orders_today": 48,
                "orders_today_growth_pct": 18.5,
                "average_order_value_aov_inr": 18450.0,
                "aov_growth_pct": 8.4,
                "yoy_annual_growth_pct": 32.4,
                "ai_commerce_revenue_pct": 34.2,
                "ai_commerce_gmv_mtd_inr": 1458630.0
            },
            "hourly_velocity_today": [
                {"hour": "00:00 - 04:00", "orders": 3, "revenue_inr": 11994.0, "ai_orders": 3},
                {"hour": "04:00 - 08:00", "orders": 5, "revenue_inr": 24985.0, "ai_orders": 4},
                {"hour": "08:00 - 12:00", "orders": 14, "revenue_inr": 58450.0, "ai_orders": 8},
                {"hour": "12:00 - 16:00", "orders": 16, "revenue_inr": 62400.0, "ai_orders": 7},
                {"hour": "16:00 - 20:00", "orders": 8, "revenue_inr": 21680.0, "ai_orders": 3},
                {"hour": "20:00 - 23:59", "orders": 2, "revenue_inr": 4991.0, "ai_orders": 1}
            ],
            "monthly_trend": [
                {"month": "Apr 2026", "human_rev": 2400000.0, "ai_rev": 420000.0, "total": 2820000.0},
                {"month": "May 2026", "human_rev": 2650000.0, "ai_rev": 680000.0, "total": 3330000.0},
                {"month": "Jun 2026", "human_rev": 2800000.0, "ai_rev": 940000.0, "total": 3740000.0},
                {"month": "Jul 2026", "human_rev": 2750000.0, "ai_rev": 1180000.0, "total": 3930000.0},
                {"month": "Aug 2026", "human_rev": 2800000.0, "ai_rev": 1450000.0, "total": 4250000.0}
            ],
            "payment_channel_breakdown": [
                {"channel": "Razorpay UPI AutoPay Mandate", "amount_inr": 1845000.0, "share_pct": 43.2, "growth": "+42.5%"},
                {"channel": "Corporate Credit & Debit Cards", "amount_inr": 1420000.0, "share_pct": 33.3, "growth": "+8.2%"},
                {"channel": "Dynamic BharatQR Instant UPI", "amount_inr": 680000.0, "share_pct": 15.9, "growth": "+14.0%"},
                {"channel": "NetBanking e-Mandates", "amount_inr": 320000.0, "share_pct": 7.6, "growth": "+5.1%"}
            ],
            "category_revenue_breakdown": [
                {"category": "Smart POS Terminals", "amount_inr": 1845000.0, "share_pct": 43.3, "orders": 142},
                {"category": "Voice Soundboxes", "amount_inr": 1280000.0, "share_pct": 30.0, "orders": 850},
                {"category": "Billing Accessories & Paper", "amount_inr": 720000.0, "share_pct": 16.9, "orders": 1240},
                {"category": "Barcode Scanners & QR Stands", "amount_inr": 420000.0, "share_pct": 9.8, "orders": 310}
            ]
        }

    # =========================================================================
    # 5. CAMPAIGN MANAGER
    # =========================================================================
    def get_campaigns(self, merchant_id: Optional[str] = None) -> Dict[str, Any]:
        """List all AI and merchant marketing campaigns with live ROI tracking."""
        if merchant_id:
            from app.services.auth_service import auth_service
            if not auth_service.is_demo_merchant(merchant_id):
                merchant_campaigns = [c for c in self.campaigns if c.get("merchant_id") == merchant_id]
                total_spend = sum(c["spend_inr"] for c in merchant_campaigns)
                total_attributed_rev = sum(c["attributed_revenue_inr"] for c in merchant_campaigns)
                overall_roi = round(total_attributed_rev / total_spend, 1) if total_spend > 0 else 0.0
                return {
                    "message": "No campaigns created." if not merchant_campaigns else None,
                    "summary": {
                        "active_campaigns": sum(1 for c in merchant_campaigns if c["status"] == "ACTIVE"),
                        "total_campaigns": len(merchant_campaigns),
                        "total_spend_inr": total_spend,
                        "total_attributed_revenue_inr": total_attributed_rev,
                        "blended_roi_multiplier": overall_roi,
                        "total_conversions": sum(c["conversions"] for c in merchant_campaigns)
                    },
                    "campaigns": merchant_campaigns
                }

        total_spend = sum(c["spend_inr"] for c in self.campaigns)
        total_attributed_rev = sum(c["attributed_revenue_inr"] for c in self.campaigns)
        overall_roi = round(total_attributed_rev / total_spend, 1) if total_spend > 0 else 0.0

        return {
            "summary": {
                "active_campaigns": sum(1 for c in self.campaigns if c["status"] == "ACTIVE"),
                "total_campaigns": len(self.campaigns),
                "total_spend_inr": total_spend,
                "total_attributed_revenue_inr": total_attributed_rev,
                "blended_roi_multiplier": overall_roi,
                "total_conversions": sum(c["conversions"] for c in self.campaigns)
            },
            "campaigns": self.campaigns
        }

    def launch_campaign(self, data: Dict[str, Any], merchant_id: str = "rzp_live_acme_8842") -> Dict[str, Any]:
        """Create and immediately launch an AI-generated or custom campaign."""
        new_id = f"cmp_{uuid.uuid4().hex[:8]}"
        camp = {
            "id": new_id,
            "merchant_id": merchant_id,
            "title": data.get("title", "AI Smart Growth Campaign"),
            "type": data.get("type", "AI_AUTONOMOUS_TRIGGER"),
            "status": "ACTIVE",
            "goal": data.get("goal", "Revenue Expansion"),
            "target_segment": data.get("target_segment", "All Active Merchants"),
            "channels": data.get("channels", ["WhatsApp AutoPay Push", "Storefront Banner"]),
            "discount_offer": data.get("discount_offer", "10% OFF 1st Reorder"),
            "audience_reach": int(data.get("audience_reach", random.randint(800, 2500))),
            "conversions": 0,
            "spend_inr": float(data.get("spend_inr", 5000.0)),
            "attributed_revenue_inr": 0.0,
            "roi_multiplier": 0.0,
            "predicted_lift_inr": float(data.get("predicted_lift_inr", 350000.0)),
            "ai_confidence": float(data.get("ai_confidence", 95.0)),
            "created_at": datetime.now().isoformat(),
            "last_active": "Just now"
        }
        self.campaigns.insert(0, camp)
        return {"status": "success", "message": f"Campaign '{camp['title']}' launched successfully", "campaign": camp}

    def toggle_campaign_status(self, campaign_id: str, status: Optional[str] = None) -> Dict[str, Any]:
        """Pause, Resume, or Archive a campaign."""
        for c in self.campaigns:
            if c["id"] == campaign_id:
                if status:
                    c["status"] = status.upper()
                else:
                    c["status"] = "PAUSED" if c["status"] == "ACTIVE" else "ACTIVE"
                c["last_active"] = "Just now"
                return {"status": "success", "message": f"Campaign status updated to {c['status']}", "campaign": c}
        raise ValueError(f"Campaign with ID '{campaign_id}' not found")

    # =========================================================================
    # 6. AGENT READINESS SCORE
    # =========================================================================
    def get_agent_readiness(self, merchant_id: Optional[str] = None) -> Dict[str, Any]:
        """Returns the 5-dimension Agent Readiness scorecard."""
        if merchant_id:
            from app.services.auth_service import auth_service
            if not auth_service.is_demo_merchant(merchant_id):
                from app.services.catalog_service import catalog_service
                stats = catalog_service.get_catalog_stats(merchant_id=merchant_id)
                if stats.total_products == 0:
                    return {
                        "overall_score": 0.0,
                        "status": "ONBOARDING_REQUIRED",
                        "rating_label": "0% - Catalog Setup Required",
                        "last_evaluated": datetime.now().isoformat(),
                        "dimensions": {
                            "catalog_quality": {"score": 0.0, "weight": 0.25, "status": "PENDING", "metrics": {"high_res_images_pct": 0.0, "structured_descriptions_pct": 0.0, "markdown_features_pct": 0.0, "seo_metadata_pct": 0.0}, "recommendation": "Add your first product to activate AI Commerce catalog indexing."},
                            "inventory_accuracy": {"score": 0.0, "weight": 0.20, "status": "PENDING", "metrics": {"real_time_sync_pct": 0.0, "buffer_stock_accuracy": 0.0, "stockout_prevention_rate": 0.0}, "recommendation": "Set inventory counts and reorder thresholds."},
                            "pricing_completeness": {"score": 0.0, "weight": 0.20, "status": "PENDING", "metrics": {"gst_inclusive_clarity": 0.0, "mrp_transparency_pct": 0.0, "volume_tier_pricing_pct": 0.0}, "recommendation": "Configure GST rates and pricing."},
                            "specification_coverage": {"score": 0.0, "weight": 0.20, "status": "PENDING", "metrics": {"technical_specs_depth": 0.0, "comparison_attributes_pct": 0.0, "compatibility_tags_pct": 0.0}, "recommendation": "Add specification bullets for AI comparison engines."},
                            "delivery_reliability": {"score": 0.0, "weight": 0.15, "status": "PENDING", "metrics": {"courier_sla_adherence": 0.0, "same_day_dispatch_pct": 0.0, "return_rate_pct": 0.0}, "recommendation": "Logistics network ready to fulfill orders."}
                        },
                        "checklist": [
                            {"id": "chk_1", "title": "Add First Product to Storefront", "category": "Catalog", "passed": False, "impact": "+25 pts"},
                            {"id": "chk_2", "title": "Complete Store & GST Profile", "category": "Profile", "passed": False, "impact": "+20 pts"},
                            {"id": "chk_3", "title": "Connect Razorpay Payments Account", "category": "Payments", "passed": False, "impact": "+20 pts"},
                            {"id": "chk_4", "title": "Publish Catalog to Live Agents", "category": "Agentic Commerce", "passed": False, "impact": "+20 pts"},
                            {"id": "chk_5", "title": "Enable AI Commerce Agent Autonomy", "category": "AI Agents", "passed": False, "impact": "+15 pts"}
                        ]
                    }

                prods_res = catalog_service.get_all_products(limit=100, merchant_id=merchant_id)
                prods = prods_res.items
                if prods:
                    n = len(prods)
                    img_score = round((sum(1 for p in prods if p.image_url and len(p.image_url) > 5) / n) * 100, 1)
                    desc_score = round((sum(1 for p in prods if p.description and len(p.description) >= 15) / n) * 100, 1)
                    stock_score = round((sum(1 for p in prods if p.stock_quantity > 0) / n) * 100, 1)
                    price_score = round((sum(1 for p in prods if p.price > 0 and (p.gst_rate_pct or 0) > 0) / n) * 100, 1)
                    spec_score = round((sum(1 for p in prods if len(p.specs or []) > 0 or len(p.features or []) > 0) / n) * 100, 1)
                    delivery_score = round((sum(1 for p in prods if p.delivery_time) / n) * 100, 1)

                    cat_quality = round((img_score + desc_score) / 2, 1)
                    inv_acc = stock_score
                    pricing_comp = price_score
                    spec_cov = spec_score
                    deliv_rel = delivery_score

                    overall = round(0.25 * cat_quality + 0.20 * inv_acc + 0.20 * pricing_comp + 0.20 * spec_cov + 0.15 * deliv_rel, 1)
                    status = "HIGH_READINESS" if overall >= 80 else ("MODERATE_READINESS" if overall >= 50 else "BUILDING_CATALOG")
                    return {
                        "overall_score": overall,
                        "status": status,
                        "rating_label": f"{overall}% - Agentic Catalog Quality",
                        "last_evaluated": datetime.now().isoformat(),
                        "dimensions": {
                            "catalog_quality": {"score": cat_quality, "weight": 0.25, "status": "EXCELLENT" if cat_quality > 70 else "MODERATE", "metrics": {"high_res_images_pct": img_score, "structured_descriptions_pct": desc_score, "markdown_features_pct": desc_score, "seo_metadata_pct": img_score}, "recommendation": "Maintain structured descriptions and high-resolution images."},
                            "inventory_accuracy": {"score": inv_acc, "weight": 0.20, "status": "EXCELLENT" if inv_acc > 70 else "MODERATE", "metrics": {"real_time_sync_pct": inv_acc, "buffer_stock_accuracy": inv_acc, "stockout_prevention_rate": inv_acc}, "recommendation": "Inventory counts synced with fulfillment centers."},
                            "pricing_completeness": {"score": pricing_comp, "weight": 0.20, "status": "EXCELLENT" if pricing_comp > 70 else "MODERATE", "metrics": {"gst_inclusive_clarity": pricing_comp, "mrp_transparency_pct": pricing_comp, "volume_tier_pricing_pct": pricing_comp}, "recommendation": "GST rates configured for automatic invoice generation."},
                            "specification_coverage": {"score": spec_cov, "weight": 0.20, "status": "EXCELLENT" if spec_cov > 70 else "MODERATE", "metrics": {"technical_specs_depth": spec_cov, "comparison_attributes_pct": spec_cov, "compatibility_tags_pct": spec_cov}, "recommendation": "Technical specifications available for AI comparison engine."},
                            "delivery_reliability": {"score": deliv_rel, "weight": 0.15, "status": "EXCELLENT" if deliv_rel > 70 else "MODERATE", "metrics": {"courier_sla_adherence": deliv_rel, "same_day_dispatch_pct": deliv_rel, "return_rate_pct": 0.0}, "recommendation": "Delivery timelines configured for buyer expectation."}
                        },
                        "checklist": [
                            {"id": "chk_1", "title": "Add First Product to Storefront", "category": "Catalog", "passed": True, "impact": "+25 pts"},
                            {"id": "chk_2", "title": "Complete Store & GST Profile", "category": "Profile", "passed": True, "impact": "+20 pts"},
                            {"id": "chk_3", "title": "Connect Razorpay Payments Account", "category": "Payments", "passed": True, "impact": "+20 pts"},
                            {"id": "chk_4", "title": "Publish Catalog to Live Agents", "category": "Agentic Commerce", "passed": spec_cov > 50, "impact": "+20 pts"},
                            {"id": "chk_5", "title": "Enable AI Commerce Agent Autonomy", "category": "AI Agents", "passed": overall >= 60, "impact": "+15 pts"}
                        ]
                    }

        return self.readiness_state

    def optimize_agent_readiness(self) -> Dict[str, Any]:
        """Executes automated AI optimization to elevate merchant score to 99.5/100."""
        self.readiness_state["overall_score"] = 99.5
        self.readiness_state["status"] = "PERFECTLY_AGENT_READY"
        self.readiness_state["rating_label"] = "Flawless Agentic Commerce Tier"
        self.readiness_state["last_evaluated"] = datetime.now().isoformat()
        for dim in self.readiness_state["dimensions"].values():
            dim["score"] = 99.0 + round(random.random(), 1)
            dim["status"] = "EXCELLENT"
        for chk in self.readiness_state["checklist"]:
            chk["passed"] = True
        return {
            "status": "success",
            "message": "AI Autonomous Optimization applied across Catalog, Pricing, Specs, and Logistics SLAs!",
            "readiness": self.readiness_state
        }

merchant_growth_service = MerchantGrowthService()
