from __future__ import annotations

import sys
import os
from typing import List, Dict, Optional, Any

SRC_DIR = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "src"))
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

from app.schemas.exception_intelligence import (
    CommerceExceptionDTO,
    InvestigatedExceptionDTO,
    ExceptionSummaryMetricsDTO,
    ExceptionIntelligenceResponseDTO,
)

SAMPLE_COMMERCE_EXCEPTIONS = [
    {
        "exception_id": "EXC-2026-001",
        "category": "Payment Failure",
        "order_id": "ORD-2026-8950",
        "sku_id": "PROD-102",
        "customer_name": "Rohan Gupta",
        "date": "2026-09-04 18:22:00",
        "amount": 26990.00,
        "severity": "High",
        "root_cause": "Customer UPI handle (rohan@okaxis) timed out after 3DS authorization stage during high-traffic checkout.",
        "impact": "Uncollected revenue of ₹26,990.00; risk of cart abandonment by buyer.",
        "action": "Trigger automated Razorpay Smart Payment Link via SMS & WhatsApp with 15-minute price lock.",
        "available_workflows": [
            "Re-issue Dynamic Razorpay Payment Link",
            "Switch to Cash on Delivery (COD) with ₹100 buffer",
            "Cancel & Release Inventory Lock"
        ],
        "confidence": 98,
        "channel": "Razorpay UPI Gateway",
        "discrepancy_amount": 26990.00,
        "evidence": [
            "Payment ID: pay_Nq89412039 timed out at T+180s",
            "Bank error code: BHARATPE_UPI_TIMEOUT",
            "Cart contents: Sony WH-1000XM5 Headphones (1 unit)"
        ]
    },
    {
        "exception_id": "EXC-2026-002",
        "category": "Shipping Delay",
        "order_id": "ORD-2026-8935",
        "sku_id": "PROD-105",
        "customer_name": "Meera Nambiar",
        "date": "2026-09-03 11:15:00",
        "amount": 14999.00,
        "severity": "Medium",
        "root_cause": "Delhivery Hub manifest transit delay (+36 hours over standard SLA) due to Bangalore-Chennai interstate highway maintenance.",
        "impact": "Customer SLA delivery breach; potential CSAT drop and negative review risk.",
        "action": "Re-route package via Blue Dart Apex Express priority air dispatch and notify customer with live tracking link.",
        "available_workflows": [
            "Fast-track Reroute via Blue Dart Express",
            "Send Proactive WhatsApp Delay Notification + ₹500 Coupon",
            "Escalate to Carrier Account Manager"
        ],
        "confidence": 95,
        "channel": "Delhivery Freight Logistics",
        "discrepancy_amount": 0.00,
        "evidence": [
            "AWB: DEL-994821034IN status stuck in 'Hub In-Transit'",
            "SLA committed delivery date: 2026-09-03",
            "Predicted delivery lag: +38 hours"
        ]
    },
    {
        "exception_id": "EXC-2026-003",
        "category": "Inventory Shortage",
        "order_id": "ORD-2026-8952",
        "sku_id": "PROD-103",
        "customer_name": "Vikramaditya Rao",
        "date": "2026-09-04 19:05:00",
        "amount": 59900.00,
        "severity": "Critical",
        "root_cause": "Concurrent checkout by Claude Commerce Bot and manual buyer simultaneously locked last 2 units of Apple iPad Air.",
        "impact": "Overselling condition; primary fulfillment warehouse has 0 units remaining.",
        "action": "Auto-split fulfillment from Mumbai Secondary Warehouse (WH-02) and initiate immediate stock reallocation.",
        "available_workflows": [
            "Reallocate Stock from Secondary Warehouse (WH-02)",
            "Upgrade Buyer to Next Tier SKU at No Extra Cost",
            "Issue Instant Full Refund with Apology Code"
        ],
        "confidence": 99,
        "channel": "Catalog Inventory Engine",
        "discrepancy_amount": 59900.00,
        "evidence": [
            "SKU: PROD-103 available inventory: 0",
            "Active lock requests: 2 simultaneous checkout sessions at 19:04:58",
            "WH-02 Stock count: 8 units available for cross-docking"
        ]
    },
    {
        "exception_id": "EXC-2026-004",
        "category": "Courier API Failure",
        "order_id": "ORD-2026-8948",
        "sku_id": "PROD-108",
        "customer_name": "Pooja Hegde",
        "date": "2026-09-04 16:30:00",
        "amount": 8995.00,
        "severity": "High",
        "root_cause": "Shiprocket AWB creation endpoint returned 502 Bad Gateway during automated package packing sync.",
        "impact": "Manifest generation blocked; package packed in warehouse but cannot be picked up by courier.",
        "action": "Retry Courier Webhook with exponential backoff or failover to Delhivery direct dispatch API.",
        "available_workflows": [
            "Retry Courier Webhook & Generate AWB",
            "Failover Carrier to Delhivery Direct API",
            "Generate Manual Shipping Label & Barcode"
        ],
        "confidence": 97,
        "channel": "Shiprocket Unified API Bridge",
        "discrepancy_amount": 0.00,
        "evidence": [
            "Endpoint: POST /api/v2/shiprocket/awb/generate returned HTTP 502",
            "Payload size: 1.4KB",
            "Retry count: 2 attempts failed"
        ]
    },
    {
        "exception_id": "EXC-2026-005",
        "category": "Refund Issue",
        "order_id": "ORD-2026-8920",
        "sku_id": "PROD-104",
        "customer_name": "Karthik Verma",
        "date": "2026-09-03 14:10:00",
        "amount": 14900.00,
        "severity": "High",
        "root_cause": "Customer initiated product return accepted, but instant RazorpayX refund payout rejected due to destination bank IFSC maintenance window.",
        "impact": "Customer awaiting ₹14,900.00 credit; banking SLA breach threshold approaching.",
        "action": "Execute automated retry via alternate IMPS banking switch or disburse to customer Razorpay Wallet.",
        "available_workflows": [
            "Trigger Instant RazorpayX Refund Payout (IMPS)",
            "Disburse Immediate Store Credit with 5% Bonus",
            "Request Alternate Bank Account Verification"
        ],
        "confidence": 96,
        "channel": "RazorpayX Payouts Engine",
        "discrepancy_amount": 14900.00,
        "evidence": [
            "Payout ID: pout_K8941920 failed with error IFSC_BANK_DOWNTIME",
            "Return consignment signed and verified in warehouse on 2026-09-03",
            "Customer SLA window remaining: 4 hours"
        ]
    },
    {
        "exception_id": "EXC-2026-006",
        "category": "Order Creation Failure",
        "order_id": "ORD-2026-8955",
        "sku_id": "PROD-109",
        "customer_name": "Ananya Sen",
        "date": "2026-09-04 19:45:00",
        "amount": 18450.00,
        "severity": "Medium",
        "root_cause": "Autonomous AI Buyer passed shipping pincode with 5 digits instead of 6, failing geographic validation.",
        "impact": "Checkout session stalled in memory; merchant order draft unconfirmed.",
        "action": "Auto-correct postal code using city-locality resolution heuristic (Bangalore Koramangala -> 560034) and auto-approve order.",
        "available_workflows": [
            "Auto-Correct Postal Code & Approve Order",
            "Prompt AI Buyer to Verify Delivery Address",
            "Hold Order for Manual Merchant Verification"
        ],
        "confidence": 94,
        "channel": "Agentic Protocol Ingestion",
        "discrepancy_amount": 18450.00,
        "evidence": [
            "Raw payload address: '56034 Koramangala, Bangalore'",
            "Resolved valid PIN: 560034",
            "Buyer agent: Claude Commerce Bot v1.4"
        ]
    }
]

class ExceptionIntelligenceService:
    _resolved_cache: Dict[str, str] = {}

    async def investigate_all(self) -> ExceptionIntelligenceResponseDTO:
        exceptions: List[CommerceExceptionDTO] = []

        for raw in SAMPLE_COMMERCE_EXCEPTIONS:
            exc_id = raw["exception_id"]
            is_resolved = exc_id in self._resolved_cache
            status = "Resolved" if is_resolved else "Open"
            resolved_action = self._resolved_cache.get(exc_id)

            exceptions.append(
                CommerceExceptionDTO(
                    exception_id=exc_id,
                    category=raw["category"],
                    order_id=raw.get("order_id"),
                    sku_id=raw.get("sku_id"),
                    customer_name=raw.get("customer_name"),
                    date=raw["date"],
                    amount=raw["amount"],
                    severity=raw["severity"],
                    status=status,
                    root_cause=raw["root_cause"],
                    impact=raw["impact"],
                    action=raw["action"],
                    available_workflows=raw.get("available_workflows", []),
                    confidence=raw.get("confidence", 95),
                    channel=raw.get("channel", "RazorCommerce Unified API"),
                    discrepancy_amount=raw.get("discrepancy_amount", 0.0),
                    evidence=raw.get("evidence", []),
                    resolved_action=resolved_action
                )
            )

        total = len(exceptions)
        critical = sum(1 for e in exceptions if e.severity == "Critical")
        high = sum(1 for e in exceptions if e.severity == "High")
        medium = sum(1 for e in exceptions if e.severity == "Medium")
        low = sum(1 for e in exceptions if e.severity == "Low")
        resolved = sum(1 for e in exceptions if e.status == "Resolved")
        total_exposure = sum(e.discrepancy_amount or 0.0 for e in exceptions if e.status != "Resolved")

        by_cat: Dict[str, int] = {}
        for e in exceptions:
            by_cat[e.category] = by_cat.get(e.category, 0) + 1

        summary = ExceptionSummaryMetricsDTO(
            total_exceptions=total,
            critical_count=critical,
            high_count=high,
            medium_count=medium,
            low_count=low,
            total_exposure_amount=round(total_exposure, 2),
            auto_investigated_pct=100.0,
            by_type=by_cat,
            by_category=by_cat,
            resolved_count=resolved
        )

        return ExceptionIntelligenceResponseDTO(
            summary=summary, 
            exceptions=exceptions,
            status="Success"
        )

    async def resolve_exception(self, exception_id: str, action: str) -> bool:
        self._resolved_cache[exception_id] = action
        return True

exception_intelligence_service = ExceptionIntelligenceService()
