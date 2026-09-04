from __future__ import annotations

import uuid
from typing import List, Dict, Any, Optional
from app.schemas.growth import (
    GrowthBasketItemDTO,
    GrowthBasketRequestDTO,
    RecommendationCardDTO,
    AffinityRuleDTO,
    SampleBasketDTO,
    GrowthAnalysisResponseDTO
)
from app.services.catalog_service import catalog_service

# Predefined Association Rules across historical merchant dataset
HISTORICAL_AFFINITY_RULES: List[Dict[str, Any]] = [
    {
        "rule_id": "rule_pos_soundbox",
        "antecedent_keywords": ["pos", "terminal", "reader", "smart pos", "countertop"],
        "antecedent_display": "Smart POS Terminal",
        "consequent_sku": "RZP-SBOX-4G-PRO",
        "support_pct": 34.2,
        "confidence_pct": 78.5,
        "lift_score": 2.85,
        "historical_co_purchases": 342,
        "synergy_type": "Hardware + Audio Confirmation"
    },
    {
        "rule_id": "rule_pos_printer_rolls",
        "antecedent_keywords": ["pos", "terminal", "epson", "cash drawer", "kiosk"],
        "antecedent_display": "POS Billing Hardware",
        "consequent_sku": "EPSON-TM-T88VII-PRINTER",
        "support_pct": 28.4,
        "confidence_pct": 64.0,
        "lift_score": 2.25,
        "historical_co_purchases": 284,
        "synergy_type": "Billing Terminal + High-Speed Printer"
    },
    {
        "rule_id": "rule_keyboard_monitor",
        "antecedent_keywords": ["keyboard", "keychron", "logi", "mouse", "mx master"],
        "antecedent_display": "Developer Keyboard & Mouse",
        "consequent_sku": "DELL-U4025QW-5K2K",
        "support_pct": 22.1,
        "confidence_pct": 58.2,
        "lift_score": 2.45,
        "historical_co_purchases": 221,
        "synergy_type": "Ergonomics + 5K Financial Display"
    },
    {
        "rule_id": "rule_software_security",
        "antecedent_keywords": ["recon", "enterprise software", "tally", "zoho", "netsuite", "gst"],
        "antecedent_display": "FinOps / ERP Software License",
        "consequent_sku": "YUBIKEY-BIO-FIDO2",
        "support_pct": 41.5,
        "confidence_pct": 82.0,
        "lift_score": 3.10,
        "historical_co_purchases": 415,
        "synergy_type": "FinOps Governance + Hardware Security"
    },
    {
        "rule_id": "rule_storage_server",
        "antecedent_keywords": ["synology", "nas", "storage", "seagate", "poweredge"],
        "antecedent_display": "Enterprise NAS Storage Unit",
        "consequent_sku": "SEAGATE-IRONWOLF-PRO-16TB",
        "support_pct": 48.0,
        "confidence_pct": 91.4,
        "lift_score": 3.65,
        "historical_co_purchases": 480,
        "synergy_type": "NAS Appliance + Enterprise Hard Drive"
    },
    {
        "rule_id": "rule_scanner_cashdrawer",
        "antecedent_keywords": ["scanner", "zebra", "honeywell", "barcode"],
        "antecedent_display": "2D Barcode Scanner",
        "consequent_sku": "APG-SERIES-100-CASH-DRAWER",
        "support_pct": 31.0,
        "confidence_pct": 69.5,
        "lift_score": 2.60,
        "historical_co_purchases": 310,
        "synergy_type": "Retail Checkout + Cash Management"
    }
]

# Pre-configured Merchant Demo Baskets
def get_sample_merchant_baskets() -> List[SampleBasketDTO]:
    all_prods = {p.sku: p for p in catalog_service.get_all_products(limit=50).products}

    def make_item(sku: str, qty: int = 1) -> Optional[GrowthBasketItemDTO]:
        p = all_prods.get(sku)
        if not p:
            return None
        return GrowthBasketItemDTO(
            product_id=p.id,
            name=p.name,
            brand=p.brand,
            category=p.category,
            price=p.price,
            cost_price=p.cost_price,
            quantity=qty,
            image_url=p.image_url
        )

    b1_items = [item for item in [
        make_item("RZP-POS-MINI-X", 2),
        make_item("RZP-QR-STAND-ACTIVE", 1)
    ] if item]

    b2_items = [item for item in [
        make_item("RZP-RECON-STARTER", 1),
        make_item("TALLY-PRIME-GOLD-ENT", 1)
    ] if item]

    b3_items = [item for item in [
        make_item("KEYCHRON-Q3-PRO", 1),
        make_item("LOGI-MX-MASTER-3S", 1)
    ] if item]

    b4_items = [item for item in [
        make_item("SYNOLOGY-DS923-PLUS", 1)
    ] if item]

    return [
        SampleBasketDTO(
            id="basket_retail_starter",
            name="Retail Checkout Starter Pack",
            description="2x Mobile POS Mini Card Readers + Dynamic QR Stand",
            industry="Offline Retail & Dining",
            items=b1_items
        ),
        SampleBasketDTO(
            id="basket_finops_growth",
            name="FinOps Starter Bundle",
            description="RazorRecon Growth Quarterly License + TallyPrime Gold",
            industry="Mid-Market Accounting",
            items=b2_items
        ),
        SampleBasketDTO(
            id="basket_dev_workstation",
            name="Financial Modeler Workstation",
            description="Keychron Q3 Pro Keyboard + Logitech MX Master 3S",
            industry="Trading & Corporate Finance",
            items=b3_items
        ),
        SampleBasketDTO(
            id="basket_enterprise_storage",
            name="Statutory Archive Server Base",
            description="Synology DS923+ 4-Bay NAS Storage Unit",
            industry="Statutory Audit & Treasury",
            items=b4_items
        )
    ]

class GrowthService:
    def __init__(self):
        self.catalog = catalog_service

    def get_affinity_matrix(self) -> List[AffinityRuleDTO]:
        all_prods = {p.sku: p for p in self.catalog.get_all_products(limit=50).products}
        rules: List[AffinityRuleDTO] = []

        for r in HISTORICAL_AFFINITY_RULES:
            target_prod = all_prods.get(r["consequent_sku"])
            if not target_prod:
                continue

            rules.append(AffinityRuleDTO(
                rule_id=r["rule_id"],
                antecedent_product_name=r["antecedent_display"],
                consequent_product_name=target_prod.name,
                consequent_product_id=target_prod.id,
                consequent_price=target_prod.price,
                support_pct=r["support_pct"],
                confidence_pct=r["confidence_pct"],
                lift_score=r["lift_score"],
                historical_co_purchases=r["historical_co_purchases"],
                synergy_type=r["synergy_type"]
            ))

        return rules

    def get_sample_baskets(self) -> List[SampleBasketDTO]:
        return get_sample_merchant_baskets()

    def analyze_basket(self, payload: GrowthBasketRequestDTO) -> GrowthAnalysisResponseDTO:
        items = payload.items
        if not items:
            # Fallback to first sample basket if empty
            sample_b = get_sample_merchant_baskets()[0]
            items = sample_b.items

        all_products = {p.id: p for p in self.catalog.get_all_products(limit=50).products}
        sku_map = {p.sku: p for p in all_products.values()}

        # 1. Calculate Current Cart Value & Margin
        current_cart_value = sum(i.price * i.quantity for i in items)
        current_cost_value = sum((i.cost_price if i.cost_price is not None else (i.price * 0.65)) * i.quantity for i in items)
        current_margin_pct = (
            round(((current_cart_value - current_cost_value) / max(1.0, current_cart_value)) * 100, 1)
            if current_cart_value > 0 else 30.0
        )

        active_product_ids = {i.product_id for i in items}
        active_names = " ".join([i.name.lower() for i in items])
        active_categories = {i.category for i in items}

        upsell_recs: List[RecommendationCardDTO] = []
        cross_sell_recs: List[RecommendationCardDTO] = []
        matched_affinity_rules: List[AffinityRuleDTO] = []

        # 2. Generate Upsell Recommendations (Upgrades to higher tiers)
        for item in items:
            # Upgrade POS Mini -> POS V3 Pro
            if "mini" in item.name.lower() or "mpos" in item.name.lower():
                upgrade_p = sku_map.get("RZP-POS-V3-PRO")
                if upgrade_p and upgrade_p.id not in active_product_ids:
                    price_delta = (upgrade_p.price - item.price) * item.quantity
                    margin_delta = round(((upgrade_p.price - upgrade_p.cost_price) / upgrade_p.price * 100) - current_margin_pct, 1)
                    upsell_recs.append(RecommendationCardDTO(
                        id=f"upsell_{uuid.uuid4().hex[:8]}",
                        type="upsell",
                        title=f"Upgrade to {upgrade_p.name}",
                        badge_label="PREMIUM UPGRADE",
                        target_product_id=upgrade_p.id,
                        target_product_name=upgrade_p.name,
                        target_brand=upgrade_p.brand,
                        target_category=upgrade_p.category,
                        target_image_url=upgrade_p.image_url,
                        target_price=upgrade_p.price,
                        target_cost_price=upgrade_p.cost_price,
                        original_product_id=item.product_id,
                        original_product_name=item.name,
                        price_delta=price_delta,
                        margin_delta_pct=margin_delta,
                        confidence_score_pct=88,
                        conversion_probability=0.42,
                        expected_uplift_inr=price_delta * 0.42,
                        strategy_rationale="Upgrading from mobile mPOS to standalone Android POS eliminates phone tethering, adds thermal receipts, and increases checkout throughput by 2.4x.",
                        key_advantages=[
                            "Built-in 80mm/s Japanese thermal printer",
                            "Dual 5.5\" customer-facing display",
                            "All-day 5200mAh hot-swappable battery"
                        ]
                    ))

            # Upgrade Starter License -> Enterprise FinOps Annual
            if "starter" in item.name.lower() or "quarterly" in item.name.lower():
                upgrade_p = sku_map.get("RZP-RECON-ENT-ANNUAL")
                if upgrade_p and upgrade_p.id not in active_product_ids:
                    price_delta = upgrade_p.price - (item.price * item.quantity)
                    margin_delta = 14.5
                    upsell_recs.append(RecommendationCardDTO(
                        id=f"upsell_{uuid.uuid4().hex[:8]}",
                        type="upsell",
                        title=f"Upgrade to {upgrade_p.name}",
                        badge_label="ENTERPRISE SCALE",
                        target_product_id=upgrade_p.id,
                        target_product_name=upgrade_p.name,
                        target_brand=upgrade_p.brand,
                        target_category=upgrade_p.category,
                        target_image_url=upgrade_p.image_url,
                        target_price=upgrade_p.price,
                        target_cost_price=upgrade_p.cost_price,
                        original_product_id=item.product_id,
                        original_product_name=item.name,
                        price_delta=price_delta,
                        margin_delta_pct=margin_delta,
                        confidence_score_pct=92,
                        conversion_probability=0.35,
                        expected_uplift_inr=price_delta * 0.35,
                        strategy_rationale="Annual enterprise license unlocks unlimited gateway connections, AI CFO Copilot, vendor behavioral memory, and statutory MCA audit compliance.",
                        key_advantages=[
                            "Unlimited multi-channel transactions",
                            "Autonomous 7-phase Month-End Close",
                            "Dedicated 24/7 Solutions Architect SLA"
                        ]
                    ))

            # Upgrade Dual-Screen POS -> Self-Checkout Kiosk
            if "countertop" in item.name.lower() or "pos-v3" in item.name.lower():
                upgrade_p = sku_map.get("RZP-POS-KIOSK-SELF")
                if upgrade_p and upgrade_p.id not in active_product_ids:
                    price_delta = upgrade_p.price - item.price
                    margin_delta = 8.2
                    upsell_recs.append(RecommendationCardDTO(
                        id=f"upsell_{uuid.uuid4().hex[:8]}",
                        type="upsell",
                        title=f"Scale to {upgrade_p.name}",
                        badge_label="SELF-SERVICE AUTOMATION",
                        target_product_id=upgrade_p.id,
                        target_product_name=upgrade_p.name,
                        target_brand=upgrade_p.brand,
                        target_category=upgrade_p.category,
                        target_image_url=upgrade_p.image_url,
                        target_price=upgrade_p.price,
                        target_cost_price=upgrade_p.cost_price,
                        original_product_id=item.product_id,
                        original_product_name=item.name,
                        price_delta=price_delta,
                        margin_delta_pct=margin_delta,
                        confidence_score_pct=76,
                        conversion_probability=0.28,
                        expected_uplift_inr=price_delta * 0.28,
                        strategy_rationale="Self-service floor kiosks reduce checkout queues by 40% and cut cashier labor expenses.",
                        key_advantages=[
                            "21.5\" Portrait FHD Touchscreen",
                            "Integrated 2D Barcode Reader",
                            "Heavy duty steel vandal-proof frame"
                        ]
                    ))

        # Default fallback upsell if none matched
        if not upsell_recs:
            upgrade_p = sku_map.get("RZP-RECON-ENT-ANNUAL") or list(all_products.values())[0]
            price_delta = upgrade_p.price
            upsell_recs.append(RecommendationCardDTO(
                id=f"upsell_{uuid.uuid4().hex[:8]}",
                type="upsell",
                title=f"Add {upgrade_p.name}",
                badge_label="RECOMMENDED TIER",
                target_product_id=upgrade_p.id,
                target_product_name=upgrade_p.name,
                target_brand=upgrade_p.brand,
                target_category=upgrade_p.category,
                target_image_url=upgrade_p.image_url,
                target_price=upgrade_p.price,
                target_cost_price=upgrade_p.cost_price,
                original_product_id=None,
                original_product_name=None,
                price_delta=price_delta,
                margin_delta_pct=12.0,
                confidence_score_pct=85,
                conversion_probability=0.30,
                expected_uplift_inr=price_delta * 0.30,
                strategy_rationale="Strategic software acceleration bundle delivering multi-channel financial governance.",
                key_advantages=["Enterprise SLA", "Multi-entity consolidation", "Continuous reconciliation"]
            ))

        # 3. Generate Cross-Sell Recommendations (Complements via Affinity Rules)
        affinity_rules_list = self.get_affinity_matrix()
        for rule in affinity_rules_list:
            # Check if antecedent keywords match active cart
            raw_rule = next((r for r in HISTORICAL_AFFINITY_RULES if r["rule_id"] == rule.rule_id), None)
            if not raw_rule:
                continue

            matched = any(kw in active_names for kw in raw_rule["antecedent_keywords"])
            if matched and rule.consequent_product_id not in active_product_ids:
                matched_affinity_rules.append(rule)
                target_p = all_products.get(rule.consequent_product_id)
                if target_p:
                    margin_delta = round(((target_p.price - target_p.cost_price) / target_p.price * 100) - current_margin_pct, 1)
                    cross_sell_recs.append(RecommendationCardDTO(
                        id=f"cross_{uuid.uuid4().hex[:8]}",
                        type="cross_sell",
                        title=f"Add {target_p.name}",
                        badge_label=f"AFFINITY LIFT {rule.lift_score}x",
                        target_product_id=target_p.id,
                        target_product_name=target_p.name,
                        target_brand=target_p.brand,
                        target_category=target_p.category,
                        target_image_url=target_p.image_url,
                        target_price=target_p.price,
                        target_cost_price=target_p.cost_price,
                        original_product_id=None,
                        original_product_name=None,
                        price_delta=target_p.price,
                        margin_delta_pct=margin_delta,
                        confidence_score_pct=int(rule.confidence_pct),
                        conversion_probability=round(rule.confidence_pct / 100 * 0.55, 2),
                        expected_uplift_inr=target_p.price * (rule.confidence_pct / 100 * 0.55),
                        strategy_rationale=f"Purchased together in {rule.historical_co_purchases} merchant deployments ({rule.confidence_pct}% confidence). {rule.synergy_type}.",
                        key_advantages=target_p.features[:3] if target_p.features else ["Plug and play compatibility", "1 Year Warranty"]
                    ))

        # Fallback cross-sell if none matched
        if not cross_sell_recs:
            soundbox_p = sku_map.get("RZP-SBOX-4G-PRO") or list(all_products.values())[1]
            cross_sell_recs.append(RecommendationCardDTO(
                id=f"cross_{uuid.uuid4().hex[:8]}",
                type="cross_sell",
                title=f"Add {soundbox_p.name}",
                badge_label="BEST COMPLEMENT",
                target_product_id=soundbox_p.id,
                target_product_name=soundbox_p.name,
                target_brand=soundbox_p.brand,
                target_category=soundbox_p.category,
                target_image_url=soundbox_p.image_url,
                target_price=soundbox_p.price,
                target_cost_price=soundbox_p.cost_price,
                original_product_id=None,
                original_product_name=None,
                price_delta=soundbox_p.price,
                margin_delta_pct=15.0,
                confidence_score_pct=88,
                conversion_probability=0.45,
                expected_uplift_inr=soundbox_p.price * 0.45,
                strategy_rationale="Essential audio confirmation hardware to eliminate manual screen verifications.",
                key_advantages=soundbox_p.features[:3]
            ))

        # 4. Predict Expected Uplift & Predicted Cart Value
        total_prob_uplift = sum(r.expected_uplift_inr for r in (upsell_recs[:2] + cross_sell_recs[:2]))
        predicted_cart_value = round(current_cart_value + total_prob_uplift, 2)
        expected_uplift_pct = round((total_prob_uplift / max(1.0, current_cart_value)) * 100, 1)

        # Margin expansion
        top_recs = upsell_recs[:1] + cross_sell_recs[:2]
        avg_rec_margin = sum(((r.target_price - r.target_cost_price) / max(1.0, r.target_price)) * 100 for r in top_recs) / max(1, len(top_recs))
        projected_gross_margin_pct = round(current_margin_pct * 0.6 + avg_rec_margin * 0.4, 1)
        margin_expansion_pct = round(projected_gross_margin_pct - current_margin_pct, 1)

        # Strategy Rationale Formulation
        ai_strategy_rationale = (
            f"Basket analysis reveals high attachment synergy between {items[0].name} and complementary hardware/security items. "
            f"Deploying recommended upsells and cross-sells increases average order value (AOV) from ₹{current_cart_value:,.2f} "
            f"to ₹{predicted_cart_value:,.2f} (+{expected_uplift_pct}%), expanding gross margins by +{margin_expansion_pct}%."
        )

        health_score = min(100, max(50, int(65 + expected_uplift_pct * 0.8)))

        return GrowthAnalysisResponseDTO(
            current_cart_value=round(current_cart_value, 2),
            predicted_cart_value=round(predicted_cart_value, 2),
            expected_uplift_pct=expected_uplift_pct,
            expected_uplift_inr=round(total_prob_uplift, 2),
            current_gross_margin_pct=current_margin_pct,
            projected_gross_margin_pct=projected_gross_margin_pct,
            margin_expansion_pct=margin_expansion_pct,
            total_active_items=len(items),
            upsell_recommendations=upsell_recs[:3],
            cross_sell_recommendations=cross_sell_recs[:3],
            affinity_rules=matched_affinity_rules or affinity_rules_list[:4],
            ai_strategy_rationale=ai_strategy_rationale,
            growth_health_score=health_score
        )

growth_service = GrowthService()
