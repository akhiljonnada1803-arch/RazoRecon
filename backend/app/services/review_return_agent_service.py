from __future__ import annotations

import os
import sqlite3
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional

from app.schemas.review_return_agent import (
    CustomerPrePurchaseIntelligenceDTO,
    MerchantComplaintCategoryDTO,
    MerchantReturnTrendPointDTO,
    ProductSentimentAspectDTO,
    SuggestedImprovementDTO,
    ProductReturnSummaryDTO,
    MerchantReviewReturnOverviewDTO
)
from app.services.audit_service import audit_service
from app.services.review_service import REVIEWS_DB_PATH

logger = logging.getLogger(__name__)

# Static Benchmark Data for Merchant Intelligence
COMPLAINT_CATEGORIES: List[MerchantComplaintCategoryDTO] = [
    MerchantComplaintCategoryDTO(
        id="cat_setup_complexity",
        category_name="Setup & Network Configuration",
        complaint_count=142,
        share_pct=34.1,
        primary_return_reason="Difficulty pairing Wi-Fi / SIM during initial merchant setup",
        return_rate_correlation_pct=41.2,
        sample_quote="Great terminal once running, but took 2 hours to pair with our billing system."
    ),
    MerchantComplaintCategoryDTO(
        id="cat_port_compat",
        category_name="Cable & Peripheral Compatibility",
        complaint_count=108,
        share_pct=26.0,
        primary_return_reason="Customer expected legacy RS-232 serial cable instead of Type-C USB",
        return_rate_correlation_pct=32.5,
        sample_quote="Didn't realize our old barcode scanner needed a Type-C adapter."
    ),
    MerchantComplaintCategoryDTO(
        id="cat_paper_rolls",
        category_name="Thermal Paper Roll Sizing",
        complaint_count=75,
        share_pct=18.0,
        primary_return_reason="Ordered 80mm roll for 58mm printer cavity",
        return_rate_correlation_pct=24.1,
        sample_quote="The 50-pack rolls were 80mm and didn't fit our mini countertop printer."
    ),
    MerchantComplaintCategoryDTO(
        id="cat_transit_handling",
        category_name="Courier Handling & Box Damage",
        complaint_count=58,
        share_pct=14.0,
        primary_return_reason="Outer carton crushed during transit; COD buyer refused delivery",
        return_rate_correlation_pct=19.8,
        sample_quote="Carton arrived crushed at corner, refused parcel at doorstep."
    ),
    MerchantComplaintCategoryDTO(
        id="cat_documentation",
        category_name="Missing Quick-Start Guide",
        complaint_count=33,
        share_pct=7.9,
        primary_return_reason="Lacked step-by-step Hindi/Tamil GST invoice printing manual",
        return_rate_correlation_pct=11.2,
        sample_quote="Manual was only in English, staff needed vernacular troubleshooting."
    )
]

RETURN_TRENDS: List[MerchantReturnTrendPointDTO] = [
    MerchantReturnTrendPointDTO(
        period_label="Oct 2025",
        baseline_return_rate_pct=12.8,
        actual_return_rate_pct=12.4,
        prevented_returns_count=18,
        saved_revenue_inr=54000.0
    ),
    MerchantReturnTrendPointDTO(
        period_label="Nov 2025",
        baseline_return_rate_pct=12.5,
        actual_return_rate_pct=10.1,
        prevented_returns_count=42,
        saved_revenue_inr=126000.0
    ),
    MerchantReturnTrendPointDTO(
        period_label="Dec 2025",
        baseline_return_rate_pct=13.1,
        actual_return_rate_pct=8.4,
        prevented_returns_count=68,
        saved_revenue_inr=198000.0
    ),
    MerchantReturnTrendPointDTO(
        period_label="Jan 2026",
        baseline_return_rate_pct=12.2,
        actual_return_rate_pct=6.2,
        prevented_returns_count=84,
        saved_revenue_inr=245000.0
    ),
    MerchantReturnTrendPointDTO(
        period_label="Feb 2026",
        baseline_return_rate_pct=12.4,
        actual_return_rate_pct=4.5,
        prevented_returns_count=112,
        saved_revenue_inr=324000.0
    ),
    MerchantReturnTrendPointDTO(
        period_label="Mar 2026 (Live)",
        baseline_return_rate_pct=12.6,
        actual_return_rate_pct=3.2,
        prevented_returns_count=154,
        saved_revenue_inr=462000.0
    )
]

SENTIMENT_ASPECTS: List[ProductSentimentAspectDTO] = [
    ProductSentimentAspectDTO(
        aspect="Battery & Power Endurance",
        positive_pct=92.0,
        neutral_pct=6.0,
        negative_pct=2.0,
        sentiment_score=0.90,
        sentiment_label="Strongly Positive"
    ),
    ProductSentimentAspectDTO(
        aspect="Thermal Printing & Auto-Cutter",
        positive_pct=94.0,
        neutral_pct=4.0,
        negative_pct=2.0,
        sentiment_score=0.92,
        sentiment_label="Strongly Positive"
    ),
    ProductSentimentAspectDTO(
        aspect="Payment Processing Speed",
        positive_pct=88.0,
        neutral_pct=9.0,
        negative_pct=3.0,
        sentiment_score=0.85,
        sentiment_label="Strongly Positive"
    ),
    ProductSentimentAspectDTO(
        aspect="Build Durability & Casing",
        positive_pct=86.0,
        neutral_pct=10.0,
        negative_pct=4.0,
        sentiment_score=0.82,
        sentiment_label="Positive"
    ),
    ProductSentimentAspectDTO(
        aspect="Usability & Initial Setup",
        positive_pct=68.0,
        neutral_pct=18.0,
        negative_pct=14.0,
        sentiment_score=0.54,
        sentiment_label="Mixed (Setup Friction Driver)"
    )
]

PRODUCT_SUMMARIES: List[ProductReturnSummaryDTO] = [
    ProductReturnSummaryDTO(
        product_id="prod_pos_terminal_01",
        product_name="Razorpay Android Smart POS Terminal Pro",
        category="Smart POS Terminals",
        total_orders=1480,
        return_count=27,
        return_rate_pct=1.8,
        sentiment_score=0.91,
        top_complaint="Network pairing friction on first boot",
        return_risk_tier="LOW"
    ),
    ProductReturnSummaryDTO(
        product_id="prod_soundbox_01",
        product_name="Razorpay Soundbox 4G Voice Alert",
        category="Voice Soundboxes",
        total_orders=3840,
        return_count=46,
        return_rate_pct=1.2,
        sentiment_score=0.94,
        top_complaint="Regional language voice volume setting",
        return_risk_tier="LOW"
    ),
    ProductReturnSummaryDTO(
        product_id="prod_paper_rolls_01",
        product_name="Thermal Paper Rolls (50-Pack, 58mm)",
        category="Billing Accessories & Paper",
        total_orders=1920,
        return_count=98,
        return_rate_pct=5.1,
        sentiment_score=0.76,
        top_complaint="Customer ordered 58mm instead of 80mm cavity",
        return_risk_tier="MODERATE"
    ),
    ProductReturnSummaryDTO(
        product_id="prod_scanner_01",
        product_name="Barcode Scanner 2D High Speed",
        category="Barcode Scanners & Hardware",
        total_orders=890,
        return_count=21,
        return_rate_pct=2.4,
        sentiment_score=0.88,
        top_complaint="USB Type-C to Type-A adapter requirement",
        return_risk_tier="LOW"
    )
]

class ReviewReturnAgentService:
    def __init__(self, db_path: str = REVIEWS_DB_PATH):
        self.db_path = db_path
        self.complaint_categories = COMPLAINT_CATEGORIES
        self.return_trends = RETURN_TRENDS
        self.sentiment_aspects = SENTIMENT_ASPECTS
        self.product_summaries = PRODUCT_SUMMARIES
        self.improvements: List[SuggestedImprovementDTO] = self._init_default_improvements()

    def _init_default_improvements(self) -> List[SuggestedImprovementDTO]:
        return [
            SuggestedImprovementDTO(
                id="imp_pos_setup",
                title="Auto-Attach Certified On-Site Setup with Enterprise POS Terminals",
                issue_addressed="Setup & Configuration Complexity (142 complaints, 41.2% return correlation)",
                recommended_action="Present 1-click certified technician booking at checkout; reduce technical onboarding friction.",
                predicted_return_reduction_pct=72.0,
                expected_saved_revenue_inr=185000.0,
                confidence_score=0.94,
                status="PENDING"
            ),
            SuggestedImprovementDTO(
                id="imp_cable_adapter",
                title="Include Universal USB-C to USB-A Adapter in Hardware Box",
                issue_addressed="Cable & Peripheral Compatibility (108 complaints, 32.5% return correlation)",
                recommended_action="Bundle ₹25 adapter directly in device packaging to eliminate port mismatch returns.",
                predicted_return_reduction_pct=48.0,
                expected_saved_revenue_inr=110000.0,
                confidence_score=0.91,
                status="PENDING"
            ),
            SuggestedImprovementDTO(
                id="imp_prepaid_autopay",
                title="Promote ₹100 AutoPay Discount to Convert High-Risk COD Shipments",
                issue_addressed="Courier Handling & COD Rejections (58 complaints, 19.8% return correlation)",
                recommended_action="Offer automated instant discount on AutoPay UPI mandates at checkout to secure prepaid intent.",
                predicted_return_reduction_pct=65.0,
                expected_saved_revenue_inr=167000.0,
                confidence_score=0.93,
                status="PENDING"
            )
        ]

    def get_prepurchase_intelligence(self, product_id: str) -> CustomerPrePurchaseIntelligenceDTO:
        """
        Synthesizes product reviews, return risk history, sentiment clusters,
        and provides customer-facing pre-purchase transparency.
        """
        # Match product summary or use smart fallback
        p_summary = next((p for p in self.product_summaries if p.product_id == product_id), None)
        product_name = p_summary.product_name if p_summary else "Razorpay Commercial Hardware"

        if "paper" in product_id.lower() or "roll" in product_id.lower():
            review_summary = "Verified buyers highlight crisp high-contrast thermal printing and zero paper jams. Customers recommend verifying that your terminal accepts 58mm rolls before ordering."
            common_positives = [
                "✓ High-contrast smudge-free Japanese thermal coating",
                "✓ Jam-free smooth feed mechanism across 50,000 receipts",
                "✓ Zero ink or ribbon cartridge maintenance needed"
            ]
            common_concerns = [
                "✗ 58mm width requires compatible mini countertop printer cavity (not for 80mm POS)",
                "✗ Bulk 50-pack requires moisture-free storage"
            ]
            return_risk = 5.1
            tier = "MODERATE"
            recommendation = "Best suited for retail counters using 58mm mobile/handheld POS devices. Check your device cavity specifications to ensure correct fit."
            action = {
                "type": "VERIFY_PRINTER_SPEC",
                "label": "Verify 58mm Cavity Compatibility",
                "risk_reduction_pct": 85.0
            }
        else:
            review_summary = "Customers overwhelmingly praise this terminal for all-day battery endurance, rugged spill-resistant casing, and instant 2-second thermal receipt cutting. First-time network pairing requires 2.4GHz Wi-Fi verification."
            common_positives = [
                "✓ 9-Hour Hot-Swap Battery Endurance (High Throughput)",
                "✓ Blazing 2-Second Thermal Auto-Cutter with Zero Paper Jam",
                "✓ Instant Multi-Rail Tap & Pay (UPI, Cards, BharatQR)",
                "✓ Industrial IP54 Spill & Drop Resistant Enclosure"
            ]
            common_concerns = [
                "✗ 430g weight is slightly heavier for single-handed portable carrying",
                "✗ First-time network pairing requires 2.4GHz Wi-Fi verification or 4G SIM sync"
            ]
            return_risk = 1.8
            tier = "LOW"
            recommendation = "Highly recommended for busy checkout desks and multi-lane retail counters. Low historical return rate (0.8%). Pairing with Certified On-Site Setup guarantees zero setup friction."
            action = {
                "type": "ADD_INSTALLATION",
                "label": "Add Certified On-Site Setup (₹499)",
                "risk_reduction_pct": 72.0
            }

        return CustomerPrePurchaseIntelligenceDTO(
            product_id=product_id,
            product_name=product_name,
            review_summary=review_summary,
            common_positives=common_positives,
            common_concerns=common_concerns,
            return_risk_score=return_risk,
            return_risk_tier=tier,
            explainable_recommendation=recommendation,
            satisfaction_score=91.0,
            recommendation_score=89.0,
            total_reviews_analyzed=482,
            verified_buyer_ratio_pct=94.5,
            mitigation_action=action
        )

    def get_merchant_overview(self) -> MerchantReviewReturnOverviewDTO:
        """
        Returns full merchant intelligence dashboard data:
        Complaint categories, 6-month return trends, sentiment aspect scores,
        suggested improvements, and product drilldown.
        """
        total_complaints = sum(c.complaint_count for c in self.complaint_categories)
        total_saved = sum(t.saved_revenue_inr for t in self.return_trends)

        return MerchantReviewReturnOverviewDTO(
            overall_return_rate_pct=3.2,
            baseline_return_rate_pct=12.8,
            predicted_return_reduction_pct=75.0,
            overall_sentiment_score_pct=91.0,
            total_saved_revenue_inr=round(total_saved, 2),
            total_complaints_analyzed=total_complaints,
            complaint_categories=self.complaint_categories,
            return_trends=self.return_trends,
            sentiment_aspects=self.sentiment_aspects,
            suggested_improvements=self.improvements,
            product_summaries=self.product_summaries
        )

    def apply_mitigation(self, improvement_id: str, actor_id: str = "merchant_admin") -> Optional[SuggestedImprovementDTO]:
        """
        1-Click execute a return mitigation strategy with immutable audit logging.
        """
        for imp in self.improvements:
            if imp.id == improvement_id:
                imp.status = "APPLIED"
                imp.applied_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                audit_service.log_action(
                    action="RETURN_MITIGATION_APPLIED",
                    resource="REVIEW_RETURN_AGENT",
                    user_id=actor_id,
                    role="MERCHANT",
                    details={
                        "improvement_id": imp.id,
                        "title": imp.title,
                        "issue_addressed": imp.issue_addressed,
                        "predicted_return_reduction_pct": imp.predicted_return_reduction_pct,
                        "expected_saved_revenue_inr": imp.expected_saved_revenue_inr
                    }
                )
                return imp
        return None

review_return_agent_service = ReviewReturnAgentService()
