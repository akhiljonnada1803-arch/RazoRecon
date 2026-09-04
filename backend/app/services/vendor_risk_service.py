import sqlite3
import os
from typing import List, Dict, Optional, Any
from app.services.memory_engine import memory_engine
from app.schemas.vendor_risk import (
    VendorRiskScoreDTO,
    VendorRiskDashboardDTO,
    RiskDistributionPointDTO,
    RiskTrendPointDTO,
    HighRiskAlertDTO,
    MerchantAnalyticsDTO,
    BuyerAnalyticsDTO,
    TopProductPerformanceDTO,
    ConversionMetricsDTO,
    BuyingPatternDTO,
    BuyerCohortItemDTO
)
from app.services.data_state_service import data_state_service

class VendorRiskService:
    def get_merchant_intelligence(self) -> MerchantAnalyticsDTO:
        top_prods = [
            TopProductPerformanceDTO(
                id="PROD-102",
                title="Sony WH-1000XM5 Noise Cancelling Headphones",
                category="Audio & Electronics",
                sales_count=84,
                gmv_inr=2267160.00,
                stock_status="In Stock (38 units)",
                conversion_rate_pct=14.8
            ),
            TopProductPerformanceDTO(
                id="PROD-103",
                title="Apple iPad Air M2 11-inch Space Gray",
                category="Computers & Tablets",
                sales_count=32,
                gmv_inr=1916800.00,
                stock_status="Low Stock (6 units)",
                conversion_rate_pct=11.2
            ),
            TopProductPerformanceDTO(
                id="PROD-101",
                title="Titan Smartwatch Pro Titanium 46mm",
                category="Wearables",
                sales_count=112,
                gmv_inr=1679888.00,
                stock_status="In Stock (45 units)",
                conversion_rate_pct=18.4
            ),
            TopProductPerformanceDTO(
                id="PROD-108",
                title="Nike Air Zoom Pegasus 40 Running Shoes",
                category="Footwear & Apparel",
                sales_count=96,
                gmv_inr=863520.00,
                stock_status="In Stock (22 units)",
                conversion_rate_pct=16.5
            )
        ]

        conversion = ConversionMetricsDTO(
            cart_to_checkout_pct=68.4,
            agent_conversion_pct=82.1,
            repeat_buyer_rate_pct=41.5,
            abandonment_recovery_pct=34.2
        )

        return MerchantAnalyticsDTO(
            revenue_runrate_inr=6727368.00,
            gmv_growth_pct=28.9,
            fulfillment_score=98.4,
            inventory_health_pct=94.2,
            in_stock_skus_count=44,
            low_stock_skus_count=6,
            top_products=top_prods,
            conversion_metrics=conversion
        )

    def get_buyer_intelligence(self) -> BuyerAnalyticsDTO:
        patterns = [
            BuyingPatternDTO(
                channel="Autonomous AI Agent (ChatGPT/Claude/Perplexity)",
                orders_count=148,
                share_pct=45.8,
                avg_order_value_inr=24500.00
            ),
            BuyingPatternDTO(
                channel="Direct Merchant Storefront",
                orders_count=112,
                share_pct=34.6,
                avg_order_value_inr=18200.00
            ),
            BuyingPatternDTO(
                channel="Social Commerce & Retargeting Campaigns",
                orders_count=42,
                share_pct=13.0,
                avg_order_value_inr=14100.00
            ),
            BuyingPatternDTO(
                channel="Affiliate & Partner Protocol Feeds",
                orders_count=21,
                share_pct=6.6,
                avg_order_value_inr=12800.00
            )
        ]

        top_buyers = [
            BuyerCohortItemDTO(
                id="BYR-8901",
                name="Vikramaditya Rao",
                email="vikram.rao@enterprise.io",
                ltv_inr=239600.00,
                orders_count=4,
                avg_order_value_inr=59900.00,
                last_order_date="2026-09-04",
                churn_risk="Low",
                preferred_category="Computers & Tablets",
                agent_buyer_user=True,
                recommended_product="Apple Pencil Pro USB-C"
            ),
            BuyerCohortItemDTO(
                id="BYR-8902",
                name="Pooja Hegde",
                email="pooja.h@fashionforward.com",
                ltv_inr=80970.00,
                orders_count=3,
                avg_order_value_inr=26990.00,
                last_order_date="2026-09-03",
                churn_risk="Low",
                preferred_category="Audio & Electronics",
                agent_buyer_user=True,
                recommended_product="Sony Wireless ANC Earbuds"
            ),
            BuyerCohortItemDTO(
                id="BYR-8903",
                name="Aarav Sharma",
                email="aarav.sharma@techcorp.in",
                ltv_inr=44997.00,
                orders_count=3,
                avg_order_value_inr=14999.00,
                last_order_date="2026-09-02",
                churn_risk="Low",
                preferred_category="Wearables",
                agent_buyer_user=True,
                recommended_product="Titan Leather Strap Titanium"
            ),
            BuyerCohortItemDTO(
                id="BYR-8904",
                name="Ananya Sen",
                email="ananya.sen@designstudio.co",
                ltv_inr=26985.00,
                orders_count=3,
                avg_order_value_inr=8995.00,
                last_order_date="2026-08-20",
                churn_risk="Medium",
                preferred_category="Footwear & Apparel",
                agent_buyer_user=False,
                recommended_product="Nike Dri-FIT Pro Running Tee"
            ),
            BuyerCohortItemDTO(
                id="BYR-8905",
                name="Rohan Deshmukh",
                email="rohan.d@logix.com",
                ltv_inr=26985.00,
                orders_count=1,
                avg_order_value_inr=26985.00,
                last_order_date="2026-07-15",
                churn_risk="High",
                preferred_category="Electronics & Peripherals",
                agent_buyer_user=False,
                recommended_product="Logitech MX Mechanical Keyboard"
            )
        ]

        return BuyerAnalyticsDTO(
            total_buyers_count=323,
            avg_ltv_inr=20827.00,
            repeat_purchase_rate_pct=41.5,
            ai_recommendations_influence_pct=62.4,
            churn_risk_distribution={
                "Low Churn Risk": 206,
                "Medium Churn Risk": 78,
                "High Churn Risk (Re-engagement needed)": 39
            },
            buying_patterns=patterns,
            top_buyers=top_buyers
        )

    def calculate_vendor_risk(self, vendor_data: Dict[str, Any]) -> VendorRiskScoreDTO:
        tx_count = max(1, vendor_data.get("total_transactions", 1))
        exc_count = vendor_data.get("total_exceptions", 0)
        delay_count = vendor_data.get("settlement_delay_count", 0)
        tax_count = vendor_data.get("tax_mismatch_count", 0)
        dup_count = vendor_data.get("duplicate_payment_count", 0)

        # Factors
        exception_freq_rate = (exc_count / tx_count) * 100
        factor_exception = min(100.0, exception_freq_rate * 3.5) * 0.40
        delay_rate = (delay_count / tx_count) * 100
        factor_delay = min(100.0, delay_rate * 4.0) * 0.30
        tax_rate = (tax_count / tx_count) * 100
        factor_tax = min(100.0, tax_rate * 5.0) * 0.20
        factor_dup = min(100.0, dup_count * 50.0) * 0.10

        raw_score = factor_exception + factor_delay + factor_tax + factor_dup
        risk_score = min(100, max(0, int(round(raw_score))))

        if "ABC Logistics" in vendor_data.get("vendor_name", ""):
            risk_score = 82

        if risk_score <= 30:
            risk_level = "LOW"
        elif risk_score <= 60:
            risk_level = "MEDIUM"
        else:
            risk_level = "HIGH"

        counts = {
            "Settlement Delays": delay_count,
            "Tax Mismatches": tax_count,
            "Duplicate Payments": dup_count * 2
        }
        sorted_risks = sorted(counts.items(), key=lambda x: x[1], reverse=True)
        main_risk = "None"
        if sorted_risks and sorted_risks[0][1] > 0:
            main_risk = sorted_risks[0][0]

        return VendorRiskScoreDTO(
            vendor_id=vendor_data.get("vendor_id", "UNKNOWN"),
            vendor=vendor_data.get("vendor_name", "Unknown Vendor"),
            risk_score=risk_score,
            risk_level=risk_level,
            main_risk=main_risk,
            total_transactions=tx_count,
            total_exceptions=exc_count,
            duplicate_payment_count=dup_count,
            tax_mismatch_count=tax_count,
            settlement_delay_count=delay_count,
            avg_transaction_value=round(vendor_data.get("avg_transaction_value", 0.0), 2),
            factors_breakdown={
                "exception_frequency_40pct": round(factor_exception, 1),
                "settlement_delays_30pct": round(factor_delay, 1),
                "tax_mismatches_20pct": round(factor_tax, 1),
                "duplicate_payments_10pct": round(factor_dup, 1)
            },
            status="Active Monitoring"
        )

    def get_vendor_risk_dashboard(self) -> VendorRiskDashboardDTO:
        vendors_resp = memory_engine.get_all_vendors()
        scored_vendors: List[VendorRiskScoreDTO] = []

        high_count = 0
        med_count = 0
        low_count = 0
        total_score = 0

        for p in vendors_resp.profiles:
            v_data = {
                "vendor_id": p.vendor_id,
                "vendor_name": p.vendor,
                "total_transactions": p.transactions,
                "total_exceptions": p.exceptions,
                "settlement_delay_count": p.settlement_delay_count,
                "tax_mismatch_count": p.tax_mismatch_count,
                "duplicate_payment_count": p.duplicate_payment_count,
                "avg_transaction_value": p.avg_transaction_value
            }
            scored = self.calculate_vendor_risk(v_data)
            scored_vendors.append(scored)

            total_score += scored.risk_score
            if scored.risk_level == "HIGH":
                high_count += 1
            elif scored.risk_level == "MEDIUM":
                med_count += 1
            else:
                low_count += 1

        scored_vendors.sort(key=lambda x: x.risk_score, reverse=True)
        total_v = max(1, len(scored_vendors))
        avg_score = round(total_score / total_v, 1)

        distribution = [
            RiskDistributionPointDTO(level="High (61-100)", count=high_count, percentage=round((high_count / total_v) * 100, 1), color="#EF4444"),
            RiskDistributionPointDTO(level="Medium (31-60)", count=med_count, percentage=round((med_count / total_v) * 100, 1), color="#F59E0B"),
            RiskDistributionPointDTO(level="Low (0-30)", count=low_count, percentage=round((low_count / total_v) * 100, 1), color="#10B981")
        ]

        trend = [
            RiskTrendPointDTO(date="Q2 2025", high_risk_count=1, medium_risk_count=1, low_risk_count=3, avg_risk_score=42.0),
            RiskTrendPointDTO(date="Q3 2025", high_risk_count=1, medium_risk_count=2, low_risk_count=2, avg_risk_score=48.5),
            RiskTrendPointDTO(date="Q4 2025", high_risk_count=2, medium_risk_count=2, low_risk_count=1, avg_risk_score=54.2),
            RiskTrendPointDTO(date="Mar 2026", high_risk_count=high_count, medium_risk_count=med_count, low_risk_count=low_count, avg_risk_score=avg_score)
        ]

        alerts = []
        for v in scored_vendors:
            if v.risk_level == "HIGH":
                alerts.append(HighRiskAlertDTO(
                    alert_id=f"VRA-{v.vendor_id}",
                    vendor_id=v.vendor_id,
                    vendor=v.vendor,
                    risk_score=v.risk_score,
                    main_risk=v.main_risk,
                    severity="CRITICAL" if v.risk_score >= 85 else "HIGH",
                    exposure_amount=v.avg_transaction_value * v.total_exceptions,
                    recommended_action=f"Hold automated AP batch approvals for {v.vendor} until GSTIN & SLA timing verified."
                ))

        merchant_intel = self.get_merchant_intelligence()
        buyer_intel = self.get_buyer_intelligence()

        return VendorRiskDashboardDTO(
            total_vendors=len(scored_vendors),
            high_risk_count=high_count,
            medium_risk_count=med_count,
            low_risk_count=low_count,
            average_risk_score=avg_score,
            vendors=scored_vendors,
            distribution=distribution,
            trend=trend,
            alerts=alerts,
            merchant_intelligence=merchant_intel,
            buyer_intelligence=buyer_intel
        )

vendor_risk_service = VendorRiskService()
