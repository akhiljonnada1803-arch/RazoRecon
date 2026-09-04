import os
import json
from typing import List, Dict, Any
from app.services.auth_service import auth_service, ROLE_PERMISSIONS_MAP, PERMISSIONS_DEFINITIONS

class AdminService:
    def get_users(self) -> List[Dict[str, Any]]:
        return auth_service.list_users()

    def get_roles(self) -> List[Dict[str, Any]]:
        roles = auth_service.list_roles()
        permissions = auth_service.list_permissions()
        
        # Enrich roles with their granted permissions
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

admin_service = AdminService()
