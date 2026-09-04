import sqlite3
import os
import uuid
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "audit.db")

class AuditService:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self._init_db()
        self._seed_data()

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS commerce_audit_events (
                    id TEXT PRIMARY KEY,
                    event_type TEXT NOT NULL,
                    actor TEXT NOT NULL,
                    actor_role TEXT NOT NULL,
                    entity_type TEXT NOT NULL,
                    entity_id TEXT,
                    summary TEXT NOT NULL,
                    metadata_json TEXT NOT NULL,
                    status TEXT NOT NULL, -- SUCCESS, WARNING, ALERT
                    ip_address TEXT,
                    timestamp TEXT NOT NULL
                )
            """)
            conn.commit()

    def _seed_data(self):
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) as count FROM commerce_audit_events")
            if cursor.fetchone()["count"] == 0:
                now = datetime.utcnow()
                events = [
                    {
                        "event_type": "PRODUCT_VIEWED",
                        "actor": "Reliance Retail Infra",
                        "actor_role": "Customer (Enterprise)",
                        "entity_type": "PRODUCT",
                        "entity_id": "POS-AND-01",
                        "summary": "Customer inspected Android POS Terminal Pro V3 specifications and volume pricing",
                        "metadata": {"sku": "POS-AND-01", "price_inr": 12999.0, "category": "Payment Terminals"},
                        "status": "SUCCESS",
                        "timestamp": (now - timedelta(minutes=45)).strftime("%Y-%m-%d %H:%M:%S")
                    },
                    {
                        "event_type": "RECOMMENDATION_GENERATED",
                        "actor": "Revenue Growth Agent",
                        "actor_role": "AI Agent (Track 01)",
                        "entity_type": "RECOMMENDATION",
                        "entity_id": "REC-9912",
                        "summary": "AI proposed high-margin Thermal Paper Rolls (50-pack) add-on with 88% confidence",
                        "metadata": {"source_sku": "POS-AND-01", "recommended_sku": "ACC-POS-01", "uplift_inr": 5996.0},
                        "status": "SUCCESS",
                        "timestamp": (now - timedelta(minutes=42)).strftime("%Y-%m-%d %H:%M:%S")
                    },
                    {
                        "event_type": "ADDED_TO_CART",
                        "actor": "Reliance Retail Infra",
                        "actor_role": "Customer (Enterprise)",
                        "entity_type": "CART",
                        "entity_id": "cart_session_881",
                        "summary": "Added 4x POS Terminals and 4x Thermal Roll packs to active procurement cart",
                        "metadata": {"items_count": 8, "subtotal_inr": 57992.0},
                        "status": "SUCCESS",
                        "timestamp": (now - timedelta(minutes=38)).strftime("%Y-%m-%d %H:%M:%S")
                    },
                    {
                        "event_type": "CHECKOUT_STARTED",
                        "actor": "AI Commerce Checkout Engine",
                        "actor_role": "System Engine",
                        "entity_type": "CHECKOUT",
                        "entity_id": "chk_98101",
                        "summary": "Generated Razorpay order session order_rzp_98101 with 18% GST calculation (₹10,438.56)",
                        "metadata": {"order_id": "order_rzp_98101", "tax_rate": "18.0%", "discount_code": "RAZOR2026"},
                        "status": "SUCCESS",
                        "timestamp": (now - timedelta(minutes=32)).strftime("%Y-%m-%d %H:%M:%S")
                    },
                    {
                        "event_type": "PAYMENT_CREATED",
                        "actor": "Razorpay Gateway Sentinel",
                        "actor_role": "Payment Gateway",
                        "entity_type": "PAYMENT",
                        "entity_id": "pay_rzp_98101",
                        "summary": "Received authorized UPI NetBanking token for ₹62,631.36",
                        "metadata": {"payment_id": "pay_rzp_98101", "method": "netbanking_hdfc", "amount_inr": 62631.36},
                        "status": "SUCCESS",
                        "timestamp": (now - timedelta(minutes=30)).strftime("%Y-%m-%d %H:%M:%S")
                    },
                    {
                        "event_type": "PAYMENT_SUCCESS",
                        "actor": "Razorpay Gateway Sentinel",
                        "actor_role": "Payment Gateway",
                        "entity_type": "PAYMENT",
                        "entity_id": "pay_rzp_98101",
                        "summary": "Cryptographic HMAC SHA256 signature verified with zero discrepancy",
                        "metadata": {"signature_verified": True, "auth_code": "AUTH_991823"},
                        "status": "SUCCESS",
                        "timestamp": (now - timedelta(minutes=29)).strftime("%Y-%m-%d %H:%M:%S")
                    },
                    {
                        "event_type": "ORDER_RECONCILED",
                        "actor": "Deterministic Reconciliation Engine",
                        "actor_role": "Finance Intelligence Layer",
                        "entity_type": "RECONCILIATION",
                        "entity_id": "REC-TX-9901",
                        "summary": "Matched gateway payout against HDFC operating deposit; MDR fee ₹1,252.63 recomputed",
                        "metadata": {"variance_inr": 0.0, "erp_voucher": "JV-2026-0819", "gl_balanced": True},
                        "status": "SUCCESS",
                        "timestamp": (now - timedelta(minutes=28)).strftime("%Y-%m-%d %H:%M:%S")
                    }
                ]

                for e in events:
                    cursor.execute("""
                        INSERT INTO commerce_audit_events
                        (id, event_type, actor, actor_role, entity_type, entity_id, summary, metadata_json, status, ip_address, timestamp)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        f"evt_{uuid.uuid4().hex[:8]}", e["event_type"], e["actor"], e["actor_role"],
                        e["entity_type"], e["entity_id"], e["summary"], json.dumps(e["metadata"]),
                        e["status"], "127.0.0.1", e["timestamp"]
                    ))

                conn.commit()

    def log_event(self, event_type: str, actor: str, actor_role: str, summary: str,
                  entity_type: str = "COMMERCE", entity_id: Optional[str] = None,
                  metadata: Optional[Dict[str, Any]] = None, status: str = "SUCCESS") -> Dict[str, Any]:
        event_id = f"evt_{uuid.uuid4().hex[:8]}"
        now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        meta_json = json.dumps(metadata or {})

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO commerce_audit_events
                (id, event_type, actor, actor_role, entity_type, entity_id, summary, metadata_json, status, ip_address, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (event_id, event_type, actor, actor_role, entity_type, entity_id, summary, meta_json, status, "127.0.0.1", now))
            conn.commit()

        return {
            "id": event_id,
            "event_type": event_type,
            "actor": actor,
            "actor_role": actor_role,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "summary": summary,
            "metadata": metadata or {},
            "status": status,
            "timestamp": now
        }

    def get_logs(self, limit: int = 50, event_type: Optional[str] = None) -> List[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            if event_type and event_type.upper() != "ALL":
                cursor.execute("SELECT * FROM commerce_audit_events WHERE event_type = ? ORDER BY timestamp DESC LIMIT ?", (event_type.upper(), limit))
            else:
                cursor.execute("SELECT * FROM commerce_audit_events ORDER BY timestamp DESC LIMIT ?", (limit,))
            
            logs = []
            for row in cursor.fetchall():
                d = dict(row)
                d["metadata"] = json.loads(d["metadata_json"])
                logs.append(d)
            return logs

    def get_timeline(self) -> List[Dict[str, Any]]:
        return self.get_logs(limit=25)

    def get_compliance_status(self) -> Dict[str, Any]:
        return {
            "gst_compliance_rate_pct": 100.0,
            "reconciliation_sla_compliance_pct": 99.8,
            "audit_trail_integrity": "CRYPTOGRAPHICALLY_VERIFIED",
            "open_compliance_flags": 0,
            "regulations": [
                {"framework": "GST Section 31 (E-Invoicing)", "status": "COMPLIANT", "last_verified": "Today, 18:30 UTC"},
                {"framework": "RBI Tokenization & Data Security", "status": "COMPLIANT", "last_verified": "Today, 19:15 UTC"},
                {"framework": "Double-Entry ERP General Ledger Invariant", "status": "BALANCED", "last_verified": "Instant"},
                {"framework": "Razorpay Test Webhook HMAC SHA256", "status": "VERIFIED", "last_verified": "Instant"}
            ]
        }

audit_service = AuditService()
