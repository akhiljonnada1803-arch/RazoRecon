import os
import json
import uuid
import sqlite3
import datetime
from typing import List, Dict, Any, Optional
from app.core.timestamps import utcnow_iso
from app.services.audit_service import audit_service
from app.services.auth_service import auth_service, ROLE_PERMISSIONS_MAP, PERMISSIONS_DEFINITIONS
from app.services.merchant_service import merchant_service

PAYMENTS_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "payments.db")
MERCHANT_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "merchant.db")

class AdminService:
    def __init__(self):
        self.api_keys = [
            {
                "id": "key_live_01",
                "name": "Production Agent Gateway Key",
                "key_prefix": "rzp_live_agent_",
                "key_secret_masked": "rzp_live_agent_9482••••••••••••",
                "environment": "LIVE",
                "role": "Autonomous Buyer Agent",
                "permissions": ["READ_CATALOG", "EXECUTE_SEARCH", "INITIATE_CHECKOUT"],
                "created_at": "2026-08-15T10:00:00Z",
                "last_used": "1 minute ago",
                "status": "ACTIVE",
                "requests_count": 142980
            },
            {
                "id": "key_test_02",
                "name": "Sandbox Test Explorer Key",
                "key_prefix": "rzp_test_agent_",
                "key_secret_masked": "rzp_test_agent_3312••••••••••••",
                "environment": "TEST",
                "role": "Developer Sandbox",
                "permissions": ["READ_CATALOG", "SIMULATE_PURCHASE"],
                "created_at": "2026-08-20T14:30:00Z",
                "last_used": "4 seconds ago",
                "status": "ACTIVE",
                "requests_count": 28400
            },
            {
                "id": "key_erp_03",
                "name": "Tally Prime ERP Webhook Secret",
                "key_prefix": "rzp_sec_erp_",
                "key_secret_masked": "rzp_sec_erp_5511••••••••••••",
                "environment": "LIVE",
                "role": "ERP Integration",
                "permissions": ["SYNC_LEDGER", "FETCH_SETTLEMENTS"],
                "created_at": "2026-08-01T09:00:00Z",
                "last_used": "12 minutes ago",
                "status": "ACTIVE",
                "requests_count": 9450
            }
        ]

        self.webhooks = [
            {
                "id": "wh_01",
                "url": "https://api.acmedirect.com/webhooks/razorcommerce/orders",
                "secret": "whsec_live_948271104",
                "events": ["order.placed", "order.paid", "order.shipped", "order.delivered"],
                "status": "ACTIVE",
                "health_rate": "99.98%",
                "last_delivery_status": 200,
                "created_at": "2026-08-10T08:00:00Z"
            },
            {
                "id": "wh_02",
                "url": "https://erp.novusfintech.io/api/v1/recon/events",
                "secret": "whsec_test_33119942",
                "events": ["settlement.created", "refund.processed", "inventory.low_stock"],
                "status": "ACTIVE",
                "health_rate": "100.0%",
                "last_delivery_status": 200,
                "created_at": "2026-08-18T12:00:00Z"
            }
        ]

    def get_users(self) -> List[Dict[str, Any]]:
        return auth_service.list_users()

    def get_roles(self) -> List[Dict[str, Any]]:
        roles = auth_service.list_roles()
        enriched_roles = []
        for r in roles:
            role_dict = r.model_dump() if hasattr(r, "model_dump") else dict(r)
            role_id = role_dict.get("id", "")
            granted = ROLE_PERMISSIONS_MAP.get(role_id, [])
            role_dict["permissions"] = granted
            enriched_roles.append(role_dict)
            
        return enriched_roles

    def get_merchants(self) -> List[Dict[str, Any]]:
        orders = merchant_service.get_orders()
        total_vol = sum(o.get("total_amount", 0) for o in orders)
        
        return [
            {
                "id": "mrc_01",
                "name": "Acme Direct Corp",
                "legal_name": "Acme Retail & Logistics Private Limited",
                "gstin": "27AAACA9982L1Z5",
                "pan": "AAACA9982L",
                "industry": "D2C E-Commerce & Retail",
                "tier": "Enterprise Platinum",
                "currency": "INR",
                "razorpay_account_id": "acc_razor_acme_881",
                "status": "ACTIVE",
                "webhook_status": "HEALTHY",
                "auto_reconciliation": True,
                "orders_count": len(orders),
                "volume_inr": total_vol
            },
            {
                "id": "mrc_02",
                "name": "Novus Cloud Software",
                "legal_name": "Novus FinOps Solutions India Pvt Ltd",
                "gstin": "29BBBCB1123K2Z8",
                "pan": "BBBCB1123K",
                "industry": "B2B SaaS & FinOps",
                "tier": "Growth Gold",
                "currency": "INR",
                "razorpay_account_id": "acc_razor_novus_442",
                "status": "ACTIVE",
                "webhook_status": "HEALTHY",
                "auto_reconciliation": True,
                "orders_count": 48,
                "volume_inr": 1840000.0
            }
        ]

    def get_disputes(self) -> Dict[str, Any]:
        orders = merchant_service.get_orders()
        disputes_list = []
        
        reasons = [
            "Damaged package in transit via courier partner",
            "Duplicate charge settlement query",
            "Software license activation key sync latency",
            "Buyer reported non-receipt before SLA window",
            "Incorrect billing GSTIN tax claim requested"
        ]
        
        statuses = ["RESOLVED_REFUNDED", "AUTO_RESOLVED", "UNDER_ARBITRATION", "EVIDENCE_SUBMITTED"]
        
        for idx, o in enumerate(orders[:8]):
            d_id = f"dsp_{884200 + idx}"
            disputes_list.append({
                "id": d_id,
                "order_id": o.get("order_number") or f"RZP-ORD-20260904-{1000 + idx}",
                "customer": o.get("customer_name") or "Enterprise Client",
                "merchant": "Acme Direct Corp" if idx % 2 == 0 else "Novus Cloud Software",
                "amount": f"₹{int(o.get('total_amount', 14999)):,}",
                "amount_raw": float(o.get("total_amount", 14999)),
                "reason": reasons[idx % len(reasons)],
                "status": statuses[idx % len(statuses)],
                "raised_at": f"{(idx + 1) * 3} hours ago",
                "sla_hours_remaining": max(2, 24 - (idx * 3))
            })

        return {
            "summary": {
                "total_open_disputes": 2,
                "disputed_volume_inr": sum(d["amount_raw"] for d in disputes_list if "ARBITRATION" in d["status"] or "EVIDENCE" in d["status"]),
                "auto_resolved_pct": 94.2,
                "dispute_rate_pct": 0.02,
                "avg_resolution_hours": 1.4,
            },
            "disputes": disputes_list
        }

    def get_fraud_cases(self) -> Dict[str, Any]:
        return {
            "summary": {
                "active_alerts_count": 3,
                "prevented_fraud_inr": 485000.0,
                "fraud_rate_pct": 0.008,
                "ml_risk_engine_status": "ACTIVE_PROTECTING"
            },
            "cases": [
                {
                    "id": "frd_99102",
                    "risk_score": 89,
                    "severity": "CRITICAL",
                    "flagged_at": "12 minutes ago",
                    "customer": "Rahul Deshmukh",
                    "amount": "₹1,45,000",
                    "payment_method": "Card • Visa Enterprise (BIN 411111)",
                    "rule_triggered": "Sudden 8x velocity spike from unfamiliar IP subnet",
                    "action_taken": "PAYMENT_BLOCKED_OTP_REQUIRED",
                    "merchant": "Acme Direct Corp"
                },
                {
                    "id": "frd_99103",
                    "risk_score": 68,
                    "severity": "MODERATE",
                    "flagged_at": "45 minutes ago",
                    "customer": "Sanjay Kapoor",
                    "amount": "₹38,999",
                    "payment_method": "UPI AutoPay",
                    "rule_triggered": "Device fingerprint mismatch across dual sessions",
                    "action_taken": "STEP_UP_2FA_VERIFIED",
                    "merchant": "Novus Cloud Software"
                },
                {
                    "id": "frd_99104",
                    "risk_score": 42,
                    "severity": "LOW",
                    "flagged_at": "2 hours ago",
                    "customer": "Anita Nambiar",
                    "amount": "₹12,499",
                    "payment_method": "NetBanking",
                    "rule_triggered": "First-time high ticket hardware purchase",
                    "action_taken": "MANUAL_REVIEW_CLEARED",
                    "merchant": "Acme Direct Corp"
                }
            ]
        }

    def get_payments_stream(self) -> List[Dict[str, Any]]:
        orders = merchant_service.get_orders()
        payments_list = []
        
        for idx, o in enumerate(orders[:25]):
            p_id = o.get("payment_id") or f"pay_rzp_{uuid.uuid4().hex[:10]}"
            amt = float(o.get("total_amount", 0.0))
            fee = round(amt * 0.018, 2)
            gst_fee = round(fee * 0.18, 2)
            net_amt = round(amt - fee - gst_fee, 2)
            
            payments_list.append({
                "id": p_id,
                "order_id": o.get("order_number") or o.get("id"),
                "customer_name": o.get("customer_name"),
                "customer_email": o.get("customer_email"),
                "amount": amt,
                "amount_formatted": f"₹{int(amt):,}" if amt == int(amt) else f"₹{amt:,.2f}",
                "fee": fee,
                "tax": gst_fee,
                "net_amount": net_amt,
                "method": o.get("payment_method", "upi").upper(),
                "status": "CAPTURED",
                "reconciled": bool(o.get("reconciled", 1)),
                "created_at": o.get("created_at")
            })
            
        return payments_list

    def get_admin_analytics(self) -> Dict[str, Any]:
        orders = merchant_service.get_orders()
        total_gmv = sum(o.get("total_amount", 0) for o in orders)
        
        return {
            "kpis": {
                "total_platform_gmv_inr": total_gmv,
                "total_orders_count": len(orders),
                "active_merchants_count": 2,
                "autonomous_ai_orders_pct": 38.4,
                "reconciliation_success_rate": 99.8,
                "average_order_value_inr": round(total_gmv / max(1, len(orders)), 2)
            },
            "channel_breakdown": [
                {"channel": "UPI & Instant Rails", "share_pct": 58, "amount_inr": round(total_gmv * 0.58, 2)},
                {"channel": "Corporate Cards & EMI", "share_pct": 28, "amount_inr": round(total_gmv * 0.28, 2)},
                {"channel": "NetBanking Direct", "share_pct": 14, "amount_inr": round(total_gmv * 0.14, 2)}
            ],
            "volume_timeline": [
                {"date": "Mon", "volume": round(total_gmv * 0.11, 2), "orders": 14},
                {"date": "Tue", "volume": round(total_gmv * 0.14, 2), "orders": 19},
                {"date": "Wed", "volume": round(total_gmv * 0.12, 2), "orders": 16},
                {"date": "Thu", "volume": round(total_gmv * 0.16, 2), "orders": 24},
                {"date": "Fri", "volume": round(total_gmv * 0.21, 2), "orders": 31},
                {"date": "Sat", "volume": round(total_gmv * 0.26, 2), "orders": 38}
            ]
        }

    def get_integrations(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": "int_razorpay",
                "name": "Razorpay Payment Gateway",
                "type": "PAYMENT_GATEWAY",
                "environment": "TEST / SANDBOX",
                "status": "CONNECTED",
                "key_id": "rzp_test_51NgQ14v9G71jK",
                "webhook_url": "https://api.razorcommerce.ai/api/v1/webhooks/razorpay",
                "events_subscribed": ["order.paid", "payment.captured", "payment.failed", "refund.processed"],
                "last_ping": "2 seconds ago"
            },
            {
                "id": "int_tally_erp",
                "name": "Tally Prime ERP Connector",
                "type": "ACCOUNTING_ERP",
                "environment": "PRODUCTION",
                "status": "CONNECTED",
                "sync_frequency": "REAL_TIME",
                "last_ping": "1 minute ago"
            },
            {
                "id": "int_sap_s4hana",
                "name": "SAP S/4HANA General Ledger",
                "type": "ACCOUNTING_ERP",
                "environment": "ENTERPRISE STAGING",
                "status": "CONNECTED",
                "sync_frequency": "HOURLY_BATCH",
                "last_ping": "5 minutes ago"
            },
            {
                "id": "int_zoho_books",
                "name": "Zoho Books Invoicing",
                "type": "INVOICE_SYNC",
                "environment": "PRODUCTION",
                "status": "CONNECTED",
                "sync_frequency": "ON_CAPTURE",
                "last_ping": "10 minutes ago"
            }
        ]

    def get_api_keys(self) -> List[Dict[str, Any]]:
        return self.api_keys

    def create_api_key(self, name: str, environment: str = "TEST") -> Dict[str, Any]:
        prefix = "rzp_live_agent_" if environment == "LIVE" else "rzp_test_agent_"
        key_raw = f"{prefix}{uuid.uuid4().hex[:16]}"
        now_str = utcnow_iso()
        new_key = {
            "id": f"key_{uuid.uuid4().hex[:8]}",
            "name": name,
            "key_prefix": prefix,
            "key_secret_masked": f"{key_raw[:18]}••••••••••••",
            "environment": environment,
            "role": "Autonomous Buyer Agent",
            "permissions": ["READ_CATALOG", "EXECUTE_SEARCH", "INITIATE_CHECKOUT"],
            "created_at": now_str,
            "last_used": "Just now",
            "status": "ACTIVE",
            "requests_count": 0
        }
        self.api_keys.insert(0, new_key)

        try:
            audit_service.log_audit(
                action="API_KEY_CREATED",
                entity_type="SECURITY",
                entity_id=new_key["id"],
                user_name="Super Admin",
                role="Super Admin",
                old_value=None,
                new_value={"name": name, "environment": environment, "key_prefix": prefix}
            )
        except Exception:
            pass

        return new_key

    def revoke_api_key(self, key_id: str) -> bool:
        for k in self.api_keys:
            if k["id"] == key_id:
                k["status"] = "REVOKED"
                try:
                    audit_service.log_audit(
                        action="API_KEY_REVOKED",
                        entity_type="SECURITY",
                        entity_id=key_id,
                        user_name="Super Admin",
                        role="Super Admin",
                        old_value={"status": "ACTIVE"},
                        new_value={"status": "REVOKED"}
                    )
                except Exception:
                    pass
                return True
        return False

    def get_webhooks(self) -> List[Dict[str, Any]]:
        return self.webhooks

    def create_webhook(self, url: str, events: List[str]) -> Dict[str, Any]:
        now_str = utcnow_iso()
        new_wh = {
            "id": f"wh_{uuid.uuid4().hex[:8]}",
            "url": url,
            "secret": f"whsec_{uuid.uuid4().hex[:12]}",
            "events": events or ["order.placed", "order.paid"],
            "status": "ACTIVE",
            "health_rate": "100.0%",
            "last_delivery_status": 200,
            "created_at": now_str
        }
        self.webhooks.insert(0, new_wh)

        try:
            audit_service.log_audit(
                action="WEBHOOK_ADDED",
                entity_type="WEBHOOK",
                entity_id=new_wh["id"],
                user_name="Super Admin",
                role="Super Admin",
                old_value=None,
                new_value={"url": url, "events": events}
            )
        except Exception:
            pass

        return new_wh

    def delete_webhook(self, webhook_id: str) -> bool:
        self.webhooks = [w for w in self.webhooks if w["id"] != webhook_id]
        try:
            audit_service.log_audit(
                action="WEBHOOK_DELETED",
                entity_type="WEBHOOK",
                entity_id=webhook_id,
                user_name="Super Admin",
                role="Super Admin",
                old_value={"id": webhook_id},
                new_value=None
            )
        except Exception:
            pass
        return True

    def approve_merchant(self, merchant_id: str) -> Dict[str, Any]:
        now_str = utcnow_iso()
        try:
            audit_service.log_audit(
                action="MERCHANT_APPROVED",
                entity_type="MERCHANT",
                entity_id=merchant_id,
                user_name="Super Admin",
                role="Super Admin",
                old_value={"kyc_status": "UNDER_REVIEW"},
                new_value={"kyc_status": "VERIFIED", "risk_score": "LOW", "approved_at": now_str}
            )
        except Exception:
            pass
        return {"status": "success", "merchant_id": merchant_id, "kyc_status": "VERIFIED"}

    def suspend_merchant(self, merchant_id: str, reason: str = "Compliance Review") -> Dict[str, Any]:
        now_str = utcnow_iso()
        try:
            audit_service.log_audit(
                action="MERCHANT_SUSPENDED",
                entity_type="MERCHANT",
                entity_id=merchant_id,
                user_name="Super Admin",
                role="Super Admin",
                old_value={"kyc_status": "VERIFIED"},
                new_value={"kyc_status": "SUSPENDED", "reason": reason, "suspended_at": now_str}
            )
        except Exception:
            pass
        return {"status": "success", "merchant_id": merchant_id, "kyc_status": "SUSPENDED"}

    def get_ai_buyer_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        agents = [
            ("agent_crew_procure_99", "Autonomous Hardware Procurement Agent", "Auto-Quote POS Terminal V3", "200 OK", 145),
            ("agent_langchain_shopper_01", "Conversational AI Shopping Assistant", "Semantic Search 'Smart 4G Soundbox'", "200 OK", 98),
            ("agent_enterprise_erp_sync", "ERP Replenishment Agent", "Reorder Threshold Trigger: DS923+ NAS", "201 CREATED", 230),
            ("agent_curator_bot", "Catalog Evaluator Agent", "Verify GST 18% HSN Code for Barcode Scanner", "200 OK", 65),
            ("agent_razorpay_buyer_x", "Razorpay 1-Click Autonomous Buyer", "Create Cart & Generate Payment Link", "200 OK", 112),
        ]

        logs = []
        now = datetime.datetime.now()
        for i in range(limit):
            ag_id, ag_name, query_text, status, latency = agents[i % len(agents)]
            logs.append({
                "id": f"req_trace_{i+1:04d}",
                "timestamp": (now - datetime.timedelta(minutes=i * 3 + 1)).isoformat(),
                "agent_id": ag_id,
                "agent_name": ag_name,
                "query": query_text,
                "method": "POST" if "Create" in query_text else "GET",
                "endpoint": "/api/v1/commerce/checkout" if "Create" in query_text else "/api/v1/commerce/chat",
                "status": status,
                "latency_ms": latency + (i % 20),
                "tokens_used": 180 + (i * 12) % 400,
                "ip_address": f"192.168.1.{10 + (i % 40)}"
            })
        return logs

    def get_protocol_monitoring(self) -> Dict[str, Any]:
        return {
            "protocol_version": "RazorCommerce Agent Protocol v1.4",
            "uptime_pct": 99.99,
            "avg_latency_ms": 112,
            "total_requests_24h": 184500,
            "successful_orders_24h": 342,
            "active_ai_buyers": 28,
            "rate_limit_health": "OPTIMAL",
            "endpoints_status": [
                {"endpoint": "/api/v1/catalog/products", "status": "OPERATIONAL", "latency_ms": 42, "p99_ms": 95},
                {"endpoint": "/api/v1/catalog/agent-context", "status": "OPERATIONAL", "latency_ms": 68, "p99_ms": 140},
                {"endpoint": "/api/v1/commerce/chat", "status": "OPERATIONAL", "latency_ms": 180, "p99_ms": 310},
                {"endpoint": "/api/v1/commerce/checkout", "status": "OPERATIONAL", "latency_ms": 195, "p99_ms": 340},
                {"endpoint": "/api/v1/merchant/orders/status", "status": "OPERATIONAL", "latency_ms": 55, "p99_ms": 110}
            ],
            "carrier_dispatch_webhooks": [
                {"carrier": "Delhivery Express", "status": "HEALTHY", "delivery_rate": "99.8%"},
                {"carrier": "Blue Dart Express", "status": "HEALTHY", "delivery_rate": "99.9%"},
                {"carrier": "Shiprocket Air", "status": "HEALTHY", "delivery_rate": "99.2%"},
                {"carrier": "Ekart Logistics", "status": "HEALTHY", "delivery_rate": "99.5%"}
            ]
        }

admin_service = AdminService()
