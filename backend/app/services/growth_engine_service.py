import os
import json
from typing import List, Dict, Any, Optional

class GrowthEngineService:
    def get_growth_overview(self) -> Dict[str, Any]:
        return {
            "current_cart_value_avg": 42500.0,
            "predicted_cart_value_avg": 54800.0,
            "expected_uplift_pct": 28.9,
            "margin_expansion_pct": 14.2,
            "top_upsell_conversion_pct": 34.6,
            "active_campaigns_count": 4,
            "total_segments_count": 5,
            "monthly_projected_growth_inr": 845000.0,
            "recent_growth_recommendations": [
                {
                    "base_product": "Razorpay Smart POS Terminal Pro V3",
                    "recommended_addon": "High-Grade BPA-Free Thermal Paper Rolls (50-pack)",
                    "addon_price": 1499.0,
                    "conversion_rate": "38.2%",
                    "margin_contribution": "+42%"
                },
                {
                    "base_product": "RazorRecon FinOps Enterprise Suite",
                    "recommended_addon": "Multi-Channel ERP Connector Pack",
                    "addon_price": 9999.0,
                    "conversion_rate": "29.5%",
                    "margin_contribution": "+68%"
                },
                {
                    "base_product": "4K Curved Financial Trading Monitor",
                    "recommended_addon": "YubiKey 5 NFC Hardware Security Key",
                    "addon_price": 4999.0,
                    "conversion_rate": "31.0%",
                    "margin_contribution": "+35%"
                }
            ]
        }

    def get_upsell_rules(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "rule_laptop",
                "trigger_category": "Workstations",
                "trigger_product": "Developer & Trading Desk Workstation",
                "trigger_price": 64999.0,
                "recommendations": [
                    {
                        "name": "Precision Wireless Gaming & Trading Mouse",
                        "sku": "ACC-MOU-01",
                        "category": "Peripherals",
                        "price": 2499.0,
                        "benefit": "Ergonomic multi-thumb programmable switches",
                        "affinity_score": 94,
                        "type": "CROSS_SELL"
                    },
                    {
                        "name": "Heavy-Duty Shockproof Workstation Bag",
                        "sku": "ACC-BAG-01",
                        "category": "Accessories",
                        "price": 3499.0,
                        "benefit": "Water-resistant ballistic nylon with TSA lock",
                        "affinity_score": 89,
                        "type": "CROSS_SELL"
                    },
                    {
                        "name": "3-Year Extended Comprehensive Hardware Warranty",
                        "sku": "WRN-EXT-03",
                        "category": "Warranty & Support",
                        "price": 5999.0,
                        "benefit": "24/7 on-site replacement SLA with accidental damage cover",
                        "affinity_score": 91,
                        "type": "UPGRADE"
                    }
                ],
                "current_cart_value": 64999.0,
                "predicted_cart_value": 76996.0,
                "expected_uplift_pct": 18.5
            },
            {
                "id": "rule_pos",
                "trigger_category": "Payment Terminals",
                "trigger_product": "Razorpay Smart POS Terminal Pro V3",
                "trigger_price": 12999.0,
                "recommendations": [
                    {
                        "name": "High-Grade BPA-Free Thermal Paper Rolls (50-pack)",
                        "sku": "ACC-POS-01",
                        "category": "Peripherals",
                        "price": 1499.0,
                        "benefit": "Ensures uninterrupted daily checkout printing",
                        "affinity_score": 96,
                        "type": "CROSS_SELL"
                    },
                    {
                        "name": "Razorpay Voice Soundbox Pro 4G",
                        "sku": "SND-VOX-01",
                        "category": "Soundboxes",
                        "price": 2499.0,
                        "benefit": "Instant audio payment confirmation in 11 languages",
                        "affinity_score": 88,
                        "type": "UPGRADE"
                    }
                ],
                "current_cart_value": 12999.0,
                "predicted_cart_value": 16997.0,
                "expected_uplift_pct": 30.8
            }
        ]

    def get_segments(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "seg_enterprise",
                "name": "High-Volume Enterprise Outlets",
                "reach_merchants": 128,
                "average_order_value": 125000.0,
                "monthly_gmv": 16000000.0,
                "churn_risk_pct": 2.1,
                "affinity": "Payment Terminals, FinOps Software, Enterprise SLA",
                "recommended_action": "Deploy annual software renewal discount campaigns"
            },
            {
                "id": "seg_d2c_fast",
                "name": "Fast-Growing D2C Scaleups",
                "reach_merchants": 340,
                "average_order_value": 48000.0,
                "monthly_gmv": 16320000.0,
                "churn_risk_pct": 8.4,
                "affinity": "Soundboxes, POS Bundles, Thermal Rolls",
                "recommended_action": "Offer bundle discounts on multi-store terminal orders"
            },
            {
                "id": "seg_festive",
                "name": "Seasonal Festive Shoppers",
                "reach_merchants": 512,
                "average_order_value": 32000.0,
                "monthly_gmv": 16384000.0,
                "churn_risk_pct": 14.2,
                "affinity": "Soundboxes, Micro mPOS",
                "recommended_action": "Launch Diwali / Festive Flash Sale with FESTIVE15 code"
            },
            {
                "id": "seg_at_risk",
                "name": "At-Risk Dormant Merchants",
                "reach_merchants": 89,
                "average_order_value": 24000.0,
                "monthly_gmv": 2136000.0,
                "churn_risk_pct": 62.0,
                "affinity": "Micro mPOS Readers",
                "recommended_action": "Automate winback campaign with ₹2,000 credit voucher"
            }
        ]

    def get_campaigns(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "cmp_01",
                "name": "Enterprise POS Fleet Surge 2026",
                "target_segment": "High-Volume Enterprise Outlets",
                "channels": ["WhatsApp Business", "Direct Email", "Merchant Dashboard"],
                "discount_code": "ENTERPRISE5000",
                "discount_pct": 10.0,
                "projected_orders": 85,
                "expected_revenue_lift_inr": 1275000.0,
                "conversion_lift_pct": 24.5,
                "status": "ACTIVE"
            },
            {
                "id": "cmp_02",
                "name": "4G Soundbox Festive Boost",
                "target_segment": "Fast-Growing D2C Scaleups",
                "channels": ["In-App Banner", "SMS", "WhatsApp"],
                "discount_code": "FESTIVE15",
                "discount_pct": 15.0,
                "projected_orders": 240,
                "expected_revenue_lift_inr": 890000.0,
                "conversion_lift_pct": 31.2,
                "status": "ACTIVE"
            },
            {
                "id": "cmp_03",
                "name": "FinOps Annual License Upgrade",
                "target_segment": "High-Volume Enterprise Outlets",
                "channels": ["Direct Email", "Account Executive Trigger"],
                "discount_code": "FINOPS20",
                "discount_pct": 20.0,
                "projected_orders": 45,
                "expected_revenue_lift_inr": 1800000.0,
                "conversion_lift_pct": 19.8,
                "status": "SCHEDULED"
            }
        ]

growth_service = GrowthEngineService()
