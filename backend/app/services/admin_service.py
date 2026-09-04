import os
import json
import uuid
import datetime
from typing import List, Dict, Any, Optional
from app.services.auth_service import auth_service, ROLE_PERMISSIONS_MAP, PERMISSIONS_DEFINITIONS

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
                "auto_reconciliation": True
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
                "auto_reconciliation": True
            }
        ]

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
        new_key = {
            "id": f"key_{uuid.uuid4().hex[:8]}",
            "name": name,
            "key_prefix": prefix,
            "key_secret_masked": f"{key_raw[:18]}••••••••••••",
            "environment": environment,
            "role": "Autonomous Buyer Agent",
            "permissions": ["READ_CATALOG", "EXECUTE_SEARCH", "INITIATE_CHECKOUT"],
            "created_at": datetime.datetime.now().isoformat(),
            "last_used": "Just now",
            "status": "ACTIVE",
            "requests_count": 0
        }
        self.api_keys.insert(0, new_key)
        return new_key

    def revoke_api_key(self, key_id: str) -> bool:
        for k in self.api_keys:
            if k["id"] == key_id:
                k["status"] = "REVOKED"
                return True
        return False

    def get_webhooks(self) -> List[Dict[str, Any]]:
        return self.webhooks

    def create_webhook(self, url: str, events: List[str]) -> Dict[str, Any]:
        new_wh = {
            "id": f"wh_{uuid.uuid4().hex[:8]}",
            "url": url,
            "secret": f"whsec_{uuid.uuid4().hex[:12]}",
            "events": events or ["order.placed", "order.paid"],
            "status": "ACTIVE",
            "health_rate": "100.0%",
            "last_delivery_status": 200,
            "created_at": datetime.datetime.now().isoformat()
        }
        self.webhooks.insert(0, new_wh)
        return new_wh

    def delete_webhook(self, webhook_id: str) -> bool:
        self.webhooks = [w for w in self.webhooks if w["id"] != webhook_id]
        return True

    def get_ai_buyer_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        # Mock structured AI Agent request logs for developer console
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
