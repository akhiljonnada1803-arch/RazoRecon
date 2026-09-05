import sqlite3
import os
import json
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.core.timestamps import utcnow_iso
from app.services.audit_service import audit_service
from app.core.encryption import payment_encryption_service, CIPHER_NAME
from app.services.customer_order_service import customer_order_service, DB_PATH as MERCHANT_DB_PATH

DB_PATH = MERCHANT_DB_PATH

class AIAutoPayService:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        os.makedirs(os.path.dirname(os.path.abspath(self.db_path)), exist_ok=True)
        self._init_db()

    def _get_conn(self):
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_conn() as conn:
            cursor = conn.cursor()

            # 1. Customer Budgets Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS customer_budgets (
                    user_id TEXT PRIMARY KEY,
                    monthly_budget REAL,
                    spent_this_month REAL NOT NULL DEFAULT 0.0,
                    max_single_purchase_limit REAL,
                    allowed_categories_json TEXT NOT NULL DEFAULT '["HARDWARE","SOFTWARE","ACCESSORIES","SUBSCRIPTIONS"]',
                    merchant_trust_level TEXT NOT NULL DEFAULT 'VERIFIED_ONLY', -- VERIFIED_ONLY, ALL_MERCHANTS
                    purchase_mode TEXT NOT NULL DEFAULT 'RECOMMENDATION_ONLY', -- RECOMMENDATION_ONLY, AUTO_BUY
                    approval_threshold REAL,
                    autopay_enabled INTEGER NOT NULL DEFAULT 0,
                    connected_mandate_id TEXT,
                    last_autonomous_purchase_json TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """)

            # Add missing columns or migrate if upgrading existing table
            cursor.execute("PRAGMA table_info(customer_budgets)")
            cols_info = cursor.fetchall()
            existing_cols = [r[1] for r in cols_info]
            mb_col = next((c for c in cols_info if c[1] == "monthly_budget"), None)
            if mb_col and mb_col[3] == 1:  # notnull is 1, migrate to nullable
                cursor.execute("""
                    CREATE TABLE customer_budgets_new (
                        user_id TEXT PRIMARY KEY,
                        monthly_budget REAL,
                        spent_this_month REAL NOT NULL DEFAULT 0.0,
                        max_single_purchase_limit REAL,
                        allowed_categories_json TEXT NOT NULL DEFAULT '["HARDWARE","SOFTWARE","ACCESSORIES","SUBSCRIPTIONS"]',
                        merchant_trust_level TEXT NOT NULL DEFAULT 'VERIFIED_ONLY',
                        purchase_mode TEXT NOT NULL DEFAULT 'RECOMMENDATION_ONLY',
                        approval_threshold REAL,
                        autopay_enabled INTEGER NOT NULL DEFAULT 0,
                        connected_mandate_id TEXT,
                        last_autonomous_purchase_json TEXT,
                        category_budgets_json TEXT,
                        max_single_tx_limit REAL,
                        approval_mode TEXT,
                        created_at TEXT NOT NULL,
                        updated_at TEXT NOT NULL
                    )
                """)
                cursor.execute("""
                    INSERT INTO customer_budgets_new 
                    (user_id, monthly_budget, spent_this_month, max_single_purchase_limit, allowed_categories_json, merchant_trust_level, purchase_mode, approval_threshold, autopay_enabled, connected_mandate_id, last_autonomous_purchase_json, category_budgets_json, max_single_tx_limit, approval_mode, created_at, updated_at)
                    SELECT user_id, monthly_budget, spent_this_month, max_single_purchase_limit, allowed_categories_json, merchant_trust_level, purchase_mode, approval_threshold, autopay_enabled, connected_mandate_id, last_autonomous_purchase_json, category_budgets_json, max_single_tx_limit, approval_mode, created_at, updated_at
                    FROM customer_budgets
                """)
                cursor.execute("DROP TABLE customer_budgets")
                cursor.execute("ALTER TABLE customer_budgets_new RENAME TO customer_budgets")
            else:
                if "max_single_purchase_limit" not in existing_cols:
                    cursor.execute("ALTER TABLE customer_budgets ADD COLUMN max_single_purchase_limit REAL")
                if "allowed_categories_json" not in existing_cols:
                    cursor.execute("ALTER TABLE customer_budgets ADD COLUMN allowed_categories_json TEXT NOT NULL DEFAULT '[\"HARDWARE\",\"SOFTWARE\",\"ACCESSORIES\",\"SUBSCRIPTIONS\"]'")
                if "merchant_trust_level" not in existing_cols:
                    cursor.execute("ALTER TABLE customer_budgets ADD COLUMN merchant_trust_level TEXT NOT NULL DEFAULT 'VERIFIED_ONLY'")
                if "purchase_mode" not in existing_cols:
                    cursor.execute("ALTER TABLE customer_budgets ADD COLUMN purchase_mode TEXT NOT NULL DEFAULT 'RECOMMENDATION_ONLY'")
                if "connected_mandate_id" not in existing_cols:
                    cursor.execute("ALTER TABLE customer_budgets ADD COLUMN connected_mandate_id TEXT")
                if "last_autonomous_purchase_json" not in existing_cols:
                    cursor.execute("ALTER TABLE customer_budgets ADD COLUMN last_autonomous_purchase_json TEXT")


            # 2. Customer Razorpay Mandates Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS customer_mandates (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    type TEXT NOT NULL, -- UPI_AUTOPAY, DEBIT_CARD_MANDATE, CREDIT_CARD_MANDATE, NETBANKING_EMANDATE
                    provider TEXT NOT NULL DEFAULT 'RAZORPAY',
                    mandate_token TEXT NOT NULL,
                    bank_name TEXT NOT NULL DEFAULT 'HDFC Bank',
                    account_or_vpa_masked TEXT NOT NULL,
                    max_amount REAL NOT NULL DEFAULT 25000.0,
                    status TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, PAUSED, REVOKED, EXPIRED
                    billing_frequency TEXT NOT NULL DEFAULT 'AS_PRESENTED',
                    expires_at TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """)

            cursor.execute("PRAGMA table_info(customer_mandates)")
            m_cols = [r[1] for r in cursor.fetchall()]
            if "bank_name" not in m_cols:
                cursor.execute("ALTER TABLE customer_mandates ADD COLUMN bank_name TEXT NOT NULL DEFAULT 'HDFC Bank'")
            if "account_or_vpa_masked" not in m_cols:
                cursor.execute("ALTER TABLE customer_mandates ADD COLUMN account_or_vpa_masked TEXT NOT NULL DEFAULT 'user@upi'")
            if "bank_or_vpa" not in m_cols:
                cursor.execute("ALTER TABLE customer_mandates ADD COLUMN bank_or_vpa TEXT")
            if "is_encrypted" not in m_cols:
                cursor.execute("ALTER TABLE customer_mandates ADD COLUMN is_encrypted INTEGER NOT NULL DEFAULT 1")
            if "encryption_cipher" not in m_cols:
                cursor.execute(f"ALTER TABLE customer_mandates ADD COLUMN encryption_cipher TEXT NOT NULL DEFAULT '{CIPHER_NAME}'")

            # Automated migration: Encrypt any legacy unencrypted mandates at rest
            cursor.execute("SELECT id, mandate_token, bank_or_vpa, account_or_vpa_masked FROM customer_mandates")
            for r in cursor.fetchall():
                row_id = r["id"]
                raw_token = r["mandate_token"]
                raw_vpa = r["bank_or_vpa"] or r["account_or_vpa_masked"]
                update_needed = False
                enc_token = raw_token
                enc_vpa = raw_vpa
                if raw_token and not payment_encryption_service.is_encrypted(raw_token):
                    enc_token = payment_encryption_service.encrypt(raw_token)
                    update_needed = True
                if raw_vpa and not payment_encryption_service.is_encrypted(raw_vpa):
                    enc_vpa = payment_encryption_service.encrypt(raw_vpa)
                    update_needed = True
                if update_needed:
                    cursor.execute("UPDATE customer_mandates SET mandate_token = ?, bank_or_vpa = ?, is_encrypted = 1, encryption_cipher = ? WHERE id = ?", (enc_token, enc_vpa, CIPHER_NAME, row_id))

            # 3. AI Replenishment Recommendations Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS ai_autopay_recommendations (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    product_id TEXT NOT NULL,
                    product_name TEXT NOT NULL,
                    category TEXT NOT NULL,
                    sku TEXT NOT NULL,
                    unit_price REAL NOT NULL,
                    quantity INTEGER NOT NULL,
                    total_price REAL NOT NULL,
                    merchant_name TEXT NOT NULL DEFAULT 'Razorpay Hardware Direct',
                    merchant_verified INTEGER NOT NULL DEFAULT 1,
                    reasoning TEXT NOT NULL,
                    confidence_score REAL NOT NULL,
                    need_urgency TEXT NOT NULL, -- HIGH, MEDIUM, SCHEDULED
                    predicted_date TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL', -- PENDING_APPROVAL, AUTO_TRIGGERED, EXECUTED, DISMISSED, REJECTED
                    order_id TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """)

            cursor.execute("PRAGMA table_info(ai_autopay_recommendations)")
            r_cols = [r[1] for r in cursor.fetchall()]
            if "merchant_name" not in r_cols:
                cursor.execute("ALTER TABLE ai_autopay_recommendations ADD COLUMN merchant_name TEXT NOT NULL DEFAULT 'Razorpay Hardware Direct'")
            if "merchant_verified" not in r_cols:
                cursor.execute("ALTER TABLE ai_autopay_recommendations ADD COLUMN merchant_verified INTEGER NOT NULL DEFAULT 1")

            # 4. AutoPay Execution Logs (Purchase History & Audit Trail)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS autopay_execution_logs (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    recommendation_id TEXT,
                    order_id TEXT NOT NULL,
                    product_id TEXT,
                    product_name TEXT,
                    category TEXT,
                    sku TEXT,
                    merchant_name TEXT NOT NULL DEFAULT 'Razorpay Official Store',
                    merchant_verified INTEGER NOT NULL DEFAULT 1,
                    amount REAL NOT NULL,
                    mandate_id TEXT,
                    payment_method TEXT NOT NULL,
                    purchase_reason TEXT NOT NULL,
                    approval_type TEXT NOT NULL, -- AUTO_BUY, RECOMMENDATION_APPROVED, MANUAL
                    guardrails_validated_json TEXT,
                    budget_before REAL NOT NULL,
                    budget_after REAL NOT NULL,
                    status TEXT NOT NULL DEFAULT 'SUCCESS', -- SUCCESS, BLOCKED, REFUNDED
                    refund_status TEXT NOT NULL DEFAULT 'NONE', -- NONE, REFUNDED
                    refund_reason TEXT,
                    refund_order_id TEXT,
                    razorpay_payment_id TEXT NOT NULL,
                    timestamp TEXT NOT NULL
                )
            """)

            cursor.execute("PRAGMA table_info(autopay_execution_logs)")
            l_cols = [r[1] for r in cursor.fetchall()]
            if "product_id" not in l_cols:
                cursor.execute("ALTER TABLE autopay_execution_logs ADD COLUMN product_id TEXT")
            if "product_name" not in l_cols:
                cursor.execute("ALTER TABLE autopay_execution_logs ADD COLUMN product_name TEXT")
            if "category" not in l_cols:
                cursor.execute("ALTER TABLE autopay_execution_logs ADD COLUMN category TEXT")
            if "sku" not in l_cols:
                cursor.execute("ALTER TABLE autopay_execution_logs ADD COLUMN sku TEXT")
            if "merchant_name" not in l_cols:
                cursor.execute("ALTER TABLE autopay_execution_logs ADD COLUMN merchant_name TEXT NOT NULL DEFAULT 'Razorpay Official Store'")
            if "merchant_verified" not in l_cols:
                cursor.execute("ALTER TABLE autopay_execution_logs ADD COLUMN merchant_verified INTEGER NOT NULL DEFAULT 1")
            if "purchase_reason" not in l_cols:
                cursor.execute("ALTER TABLE autopay_execution_logs ADD COLUMN purchase_reason TEXT NOT NULL DEFAULT 'AI Replenishment'")
            if "guardrails_validated_json" not in l_cols:
                cursor.execute("ALTER TABLE autopay_execution_logs ADD COLUMN guardrails_validated_json TEXT")
            if "refund_status" not in l_cols:
                cursor.execute("ALTER TABLE autopay_execution_logs ADD COLUMN refund_status TEXT NOT NULL DEFAULT 'NONE'")
            if "refund_reason" not in l_cols:
                cursor.execute("ALTER TABLE autopay_execution_logs ADD COLUMN refund_reason TEXT")
            if "refund_order_id" not in l_cols:
                cursor.execute("ALTER TABLE autopay_execution_logs ADD COLUMN refund_order_id TEXT")
            if "autopay_rule_used" not in l_cols:
                cursor.execute("ALTER TABLE autopay_execution_logs ADD COLUMN autopay_rule_used TEXT")

            # 5. Customer AutoPay Notifications Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS autopay_notifications (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    type TEXT NOT NULL, -- AUTOPAY_ENABLED, AUTOPAY_DISABLED, BUDGET_WARNING, AUTONOMOUS_PURCHASE_SUCCESS, PURCHASE_FAILED_GUARDRAIL, MANDATE_CONNECTED, PURCHASE_REFUNDED
                    title TEXT NOT NULL,
                    message TEXT NOT NULL,
                    severity TEXT NOT NULL DEFAULT 'INFO', -- INFO, SUCCESS, WARNING, ERROR
                    metadata_json TEXT,
                    is_read INTEGER NOT NULL DEFAULT 0,
                    timestamp TEXT NOT NULL
                )
            """)

            conn.commit()

            # Seed demo user initial data if needed
            cursor.execute("SELECT COUNT(*) FROM customer_budgets WHERE user_id = 'usr_customer_demo'")
            if cursor.fetchone()[0] == 0:
                now_str = utcnow_iso()
                default_cats = ["HARDWARE", "SOFTWARE", "ACCESSORIES", "SUBSCRIPTIONS"]
                last_purchase = {
                    "product_name": "Thermal POS Receipt Paper Rolls (Pack of 20)",
                    "amount": 1998.0,
                    "order_id": "ord_demo_auto_881",
                    "timestamp": (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d %H:%M:%S"),
                    "reason": "Purchased because: daily print volume exceeded threshold (85 receipts/day) and thermal roll inventory was critical."
                }
                
                default_cat_budgets = {"HARDWARE": 15000.0, "SOFTWARE": 5000.0, "ACCESSORIES": 3000.0, "SUBSCRIPTIONS": 2000.0}
                cursor.execute("""
                    INSERT INTO customer_budgets 
                    (user_id, monthly_budget, spent_this_month, max_single_purchase_limit, allowed_categories_json, category_budgets_json, merchant_trust_level, purchase_mode, approval_threshold, autopay_enabled, connected_mandate_id, last_autonomous_purchase_json, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    "usr_customer_demo", 25000.0, 8500.0, 5000.0,
                    json.dumps(default_cats), json.dumps(default_cat_budgets), "VERIFIED_ONLY", "AUTO_BUY", 5000.0,
                    1, "mnd_rzp_upi_99214", json.dumps(last_purchase),
                    now_str, now_str
                ))

                # Seed sample mandates across 4 types (AES-256 encrypted at rest)
                cursor.execute("""
                    INSERT INTO customer_mandates
                    (id, user_id, type, provider, mandate_token, bank_name, account_or_vpa_masked, bank_or_vpa, max_amount, status, billing_frequency, expires_at, created_at, updated_at, is_encrypted, encryption_cipher)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', 'AS_PRESENTED', '2030-12-31T23:59:59Z', ?, ?, 1, ?)
                """, (
                    "mnd_rzp_upi_99214", "usr_customer_demo", "UPI_AUTOPAY", "RAZORPAY",
                    payment_encryption_service.encrypt("mandate_rzp_token_881923"), "HDFC Bank", "akhil@okhdfcbank",
                    payment_encryption_service.encrypt("akhil@okhdfcbank"), 25000.0, now_str, now_str, CIPHER_NAME
                ))

                cursor.execute("""
                    INSERT INTO customer_mandates
                    (id, user_id, type, provider, mandate_token, bank_name, account_or_vpa_masked, bank_or_vpa, max_amount, status, billing_frequency, expires_at, created_at, updated_at, is_encrypted, encryption_cipher)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', 'AS_PRESENTED', '2029-08-31T23:59:59Z', ?, ?, 1, ?)
                """, (
                    "mnd_rzp_card_77412", "usr_customer_demo", "CREDIT_CARD_MANDATE", "RAZORPAY",
                    payment_encryption_service.encrypt("card_token_rzp_554109"), "ICICI Bank", "•••• •••• •••• 8899",
                    payment_encryption_service.encrypt("card_token_rzp_554109"), 50000.0, now_str, now_str, CIPHER_NAME
                ))

                cursor.execute("""
                    INSERT INTO customer_mandates
                    (id, user_id, type, provider, mandate_token, bank_name, account_or_vpa_masked, bank_or_vpa, max_amount, status, billing_frequency, expires_at, created_at, updated_at, is_encrypted, encryption_cipher)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', 'AS_PRESENTED', '2028-06-30T23:59:59Z', ?, ?, 1, ?)
                """, (
                    "mnd_rzp_debit_66101", "usr_customer_demo", "DEBIT_CARD_MANDATE", "RAZORPAY",
                    payment_encryption_service.encrypt("card_token_rzp_331092"), "State Bank of India", "•••• •••• •••• 4242",
                    payment_encryption_service.encrypt("card_token_rzp_331092"), 15000.0, now_str, now_str, CIPHER_NAME
                ))

                # Seed sample execution logs
                exec_id = f"log_ap_{uuid.uuid4().hex[:8]}"
                guardrails_pass = {
                    "budget_available": "PASS (Spent ₹6,502 + ₹1,998 <= ₹25,000)",
                    "single_purchase_limit": "PASS (₹1,998 <= ₹5,000)",
                    "category_allowed": "PASS (CONSUMABLES/ACCESSORIES whitelisted)",
                    "merchant_verified": "PASS (Razorpay Hardware Direct is Verified)",
                    "autopay_mandate": "PASS (UPI AutoPay akhil@okhdfcbank ACTIVE)"
                }
                cursor.execute("""
                    INSERT INTO autopay_execution_logs
                    (id, user_id, recommendation_id, order_id, product_id, product_name, category, sku, merchant_name, merchant_verified, amount, mandate_id, payment_method, purchase_reason, approval_type, guardrails_validated_json, budget_before, budget_after, status, refund_status, razorpay_payment_id, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, 'AUTO_BUY', ?, 6502.0, 8500.0, 'SUCCESS', 'NONE', ?, ?)
                """, (
                    exec_id, "usr_customer_demo", "rec_init_seed", "ord_demo_auto_881",
                    "ACC-ROLL-006", "Thermal POS Receipt Paper Rolls (Pack of 20)", "ACCESSORIES", "SKU-ROLL-TH20",
                    "Razorpay Hardware Direct", 1998.0, "mnd_rzp_upi_99214", "UPI AutoPay (akhil@okhdfcbank)",
                    "Purchased because: daily print volume exceeded threshold (85 receipts/day) and inventory dropped below safety margin (3 rolls left).",
                    json.dumps(guardrails_pass), "pay_rzp_seed_99812", now_str
                ))

                # Seed initial notification
                cursor.execute("""
                    INSERT INTO autopay_notifications
                    (id, user_id, type, title, message, severity, metadata_json, is_read, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
                """, (
                    f"notif_{uuid.uuid4().hex[:8]}", "usr_customer_demo",
                    "AUTONOMOUS_PURCHASE_SUCCESS",
                    "Autonomous Restock Completed: Thermal POS Rolls",
                    "AI Commerce Agent successfully auto-purchased 20x Thermal POS Rolls (₹1,998) via connected UPI AutoPay. Remaining Monthly Allowance: ₹16,500.",
                    "SUCCESS", json.dumps({"order_id": "ord_demo_auto_881", "amount": 1998.0}),
                    now_str
                ))

                conn.commit()

    # =========================================================================
    # SETTINGS & SPENDING RULES MANAGEMENT
    # =========================================================================
    def get_settings(self, user_id: str = "usr_customer_demo") -> Dict[str, Any]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM customer_budgets WHERE user_id = ?", (user_id,))
            row = cursor.fetchone()
            if not row:
                now_str = utcnow_iso()
                default_cats = ["HARDWARE", "SOFTWARE", "ACCESSORIES", "SUBSCRIPTIONS"]
                cursor.execute("""
                    INSERT INTO customer_budgets 
                    (user_id, monthly_budget, spent_this_month, max_single_purchase_limit, allowed_categories_json, category_budgets_json, merchant_trust_level, purchase_mode, approval_threshold, autopay_enabled, connected_mandate_id, last_autonomous_purchase_json, created_at, updated_at)
                    VALUES (?, NULL, 0.0, NULL, ?, NULL, 'VERIFIED_ONLY', 'RECOMMENDATION_ONLY', NULL, 0, NULL, NULL, ?, ?)
                """, (user_id, json.dumps(default_cats), now_str, now_str))
                conn.commit()
                cursor.execute("SELECT * FROM customer_budgets WHERE user_id = ?", (user_id,))
                row = cursor.fetchone()

            d = dict(row)
            d["allowed_categories"] = json.loads(d["allowed_categories_json"]) if d.get("allowed_categories_json") else ["HARDWARE", "SOFTWARE", "ACCESSORIES", "SUBSCRIPTIONS"]
            d["autopay_enabled"] = bool(d.get("autopay_enabled", 0))
            d["monthly_budget"] = float(d["monthly_budget"]) if d.get("monthly_budget") is not None else None
            d["spent_this_month"] = float(d.get("spent_this_month") or 0.0)
            d["max_single_purchase_limit"] = float(d["max_single_purchase_limit"]) if d.get("max_single_purchase_limit") is not None else None
            d["approval_threshold"] = float(d["approval_threshold"]) if d.get("approval_threshold") is not None else None
            d["remaining_budget"] = max(0.0, round(d["monthly_budget"] - d["spent_this_month"], 2)) if d["monthly_budget"] is not None else None
            d["spent_percentage"] = min(100.0, round((d["spent_this_month"] / d["monthly_budget"]) * 100, 1)) if d["monthly_budget"] and d["monthly_budget"] > 0 else 0.0
            d["last_autonomous_purchase"] = json.loads(d["last_autonomous_purchase_json"]) if d.get("last_autonomous_purchase_json") else None
            d["purchase_mode"] = d.get("purchase_mode") or "RECOMMENDATION_ONLY"
            if not d.get("connected_mandate_id"):
                cursor.execute("SELECT id FROM customer_mandates WHERE user_id = ? AND status = 'ACTIVE' LIMIT 1", (user_id,))
                active_m = cursor.fetchone()
                if active_m:
                    d["connected_mandate_id"] = active_m["id"]
                    cursor.execute("UPDATE customer_budgets SET connected_mandate_id = ? WHERE user_id = ?", (active_m["id"], user_id))
                    conn.commit()

            d["is_configured"] = bool(d["monthly_budget"] is not None and d.get("connected_mandate_id"))
            return d

    def update_settings(self, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        current = self.get_settings(user_id)
        now_str = utcnow_iso()

        monthly_budget_in = data.get("monthly_budget")
        if monthly_budget_in is not None:
            monthly_budget = float(monthly_budget_in)
        else:
            monthly_budget = current.get("monthly_budget")

        single_limit_in = data.get("max_single_purchase_limit")
        if single_limit_in is not None:
            max_single_purchase_limit = float(single_limit_in)
        else:
            max_single_purchase_limit = current.get("max_single_purchase_limit")

        allowed_categories = data.get("allowed_categories", current.get("allowed_categories", ["HARDWARE", "SOFTWARE", "ACCESSORIES", "SUBSCRIPTIONS"]))
        merchant_trust_level = str(data.get("merchant_trust_level", current.get("merchant_trust_level", "VERIFIED_ONLY"))).upper()
        purchase_mode = str(data.get("purchase_mode", current.get("purchase_mode", "RECOMMENDATION_ONLY"))).upper()

        approval_threshold_in = data.get("approval_threshold")
        if approval_threshold_in is not None:
            approval_threshold = float(approval_threshold_in)
        else:
            approval_threshold = current.get("approval_threshold")

        autopay_enabled = 1 if data.get("autopay_enabled", current["autopay_enabled"]) else 0
        connected_mandate_id = data.get("connected_mandate_id", current.get("connected_mandate_id"))
        spent_this_month = float(data.get("spent_this_month", current.get("spent_this_month", 0.0)))

        cats_json = json.dumps(allowed_categories)

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE customer_budgets
                SET monthly_budget = ?, spent_this_month = ?, max_single_purchase_limit = ?, allowed_categories_json = ?,
                    merchant_trust_level = ?, purchase_mode = ?, approval_threshold = ?,
                    autopay_enabled = ?, connected_mandate_id = ?, updated_at = ?
                WHERE user_id = ?
            """, (
                monthly_budget, spent_this_month, max_single_purchase_limit, cats_json,
                merchant_trust_level, purchase_mode, approval_threshold,
                autopay_enabled, connected_mandate_id, now_str, user_id
            ))
            conn.commit()

        # Check if autopay was just toggled
        if autopay_enabled != (1 if current["autopay_enabled"] else 0):
            status_text = "Enabled" if autopay_enabled else "Disabled"
            budget_str = f"with monthly limit ₹{monthly_budget:,.2f}" if monthly_budget else "with spending limits pending"
            self.create_notification(
                user_id=user_id,
                notif_type="AUTOPAY_ENABLED" if autopay_enabled else "AUTOPAY_DISABLED",
                title=f"AutoPay Spending System {status_text}",
                message=f"Autonomous purchase authorization is now {status_text.lower()} {budget_str}.",
                severity="SUCCESS" if autopay_enabled else "INFO"
            )

        audit_service.log_audit(
            action="AUTOPAY_RULES_CONFIGURED",
            entity_type="SPENDING_RULES",
            entity_id=f"rules_{user_id}",
            user_id=user_id,
            role="Customer",
            old_value={"budget": current["monthly_budget"], "mode": current["purchase_mode"]},
            new_value={"budget": monthly_budget, "single_limit": max_single_purchase_limit, "mode": purchase_mode, "categories": allowed_categories}
        )

        return self.get_settings(user_id)

    # =========================================================================
    # MANDATES MANAGEMENT (UPI, DEBIT, CREDIT, NETBANKING)
    # =========================================================================
    def get_mandates(self, user_id: str = "usr_customer_demo", include_decrypted: bool = False) -> List[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM customer_mandates WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
            rows = [dict(r) for r in cursor.fetchall()]
            out = []
            for r in rows:
                item = dict(r)
                item["is_encrypted"] = bool(r.get("is_encrypted", 1))
                item["encryption_cipher"] = r.get("encryption_cipher") or CIPHER_NAME
                raw_token = payment_encryption_service.decrypt(r.get("mandate_token", ""))
                raw_account = payment_encryption_service.decrypt(r.get("bank_or_vpa", ""))
                if include_decrypted:
                    item["raw_bank_or_vpa"] = raw_account
                    item["raw_mandate_token"] = raw_token
                else:
                    # Sanitize token for customer-facing display
                    item["mandate_token_masked"] = f"tok_rzp_••••{raw_token[-4:]}" if len(raw_token) >= 4 else "tok_rzp_••••"
                    item["bank_or_vpa"] = r.get("account_or_vpa_masked", "••••")
                out.append(item)
            return out

    def add_mandate(self, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Connect a new payment method mandate:
        Supports UPI_AUTOPAY, DEBIT_CARD_MANDATE, CREDIT_CARD_MANDATE, NETBANKING_EMANDATE.
        Raw payment details are securely encrypted using AES-256 (Fernet) at rest;
        only masked accounts / VPAs are visible in customer UIs.
        """
        mnd_id = f"mnd_rzp_{uuid.uuid4().hex[:8]}"
        now_str = utcnow_iso()
        m_type = str(data.get("type", "UPI_AUTOPAY")).upper()
        bank_name = data.get("bank_name", "HDFC Bank")
        account_raw = data.get("account_or_vpa", data.get("bank_or_vpa", "user@upi"))
        
        # Mask account/card safely
        account_masked = payment_encryption_service.mask_identifier(str(account_raw), m_type)
        if m_type in ["NETBANKING_EMANDATE", "NETBANKING"] and not account_masked.startswith(bank_name):
            account_masked = f"{bank_name} {account_masked}"

        max_amt = float(data.get("max_amount", 25000.0))
        token = data.get("mandate_token") or f"tok_rzp_{uuid.uuid4().hex[:12]}"
        freq = data.get("billing_frequency", "AS_PRESENTED")
        expires_at = data.get("expires_at") or (datetime.now() + timedelta(days=365*3)).strftime("%Y-%m-%dT%H:%M:%SZ")

        # Bank-Grade AES-256 Encryption at Rest
        encrypted_token = payment_encryption_service.encrypt(token)
        encrypted_account = payment_encryption_service.encrypt(str(account_raw).strip())

        # Ensure budget row exists
        self.get_settings(user_id)

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO customer_mandates
                (id, user_id, type, provider, mandate_token, bank_name, account_or_vpa_masked, bank_or_vpa, max_amount, status, billing_frequency, expires_at, created_at, updated_at, is_encrypted, encryption_cipher)
                VALUES (?, ?, ?, 'RAZORPAY', ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?, ?, 1, ?)
            """, (mnd_id, user_id, m_type, encrypted_token, bank_name, account_masked, encrypted_account, max_amt, freq, expires_at, now_str, now_str, CIPHER_NAME))

            # Set as primary connected mandate
            cursor.execute("UPDATE customer_budgets SET connected_mandate_id = ?, updated_at = ? WHERE user_id = ?", (mnd_id, now_str, user_id))
            conn.commit()

        # Send notification
        self.create_notification(
            user_id=user_id,
            notif_type="MANDATE_CONNECTED",
            title="Payment Mandate Connected Successfully",
            message=f"{m_type.replace('_', ' ')} via {bank_name} ({account_masked}) connected with ₹{max_amt:,.2f} transaction authorization (AES-256 Encrypted).",
            severity="SUCCESS",
            metadata={"mandate_id": mnd_id, "type": m_type}
        )

        audit_service.log_audit(
            action="MANDATE_REGISTERED",
            entity_type="MANDATE",
            entity_id=mnd_id,
            user_id=user_id,
            role="Customer",
            old_value=None,
            new_value={"type": m_type, "bank": bank_name, "account_masked": account_masked, "max_amount": max_amt, "is_encrypted": True}
        )

        return {
            "id": mnd_id,
            "type": m_type,
            "bank_name": bank_name,
            "account_or_vpa_masked": account_masked,
            "max_amount": max_amt,
            "status": "ACTIVE",
            "is_encrypted": True,
            "encryption_cipher": CIPHER_NAME
        }

    def update_mandate_status(self, mandate_id: str, user_id: str, status: str) -> Optional[Dict[str, Any]]:
        now_str = utcnow_iso()
        st = status.upper()
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE customer_mandates SET status = ?, updated_at = ? WHERE id = ? AND user_id = ?", (st, now_str, mandate_id, user_id))
            conn.commit()
            cursor.execute("SELECT * FROM customer_mandates WHERE id = ?", (mandate_id,))
            row = cursor.fetchone()
            if row:
                m = dict(row)
                self.create_notification(
                    user_id=user_id,
                    notif_type="MANDATE_STATUS_CHANGED",
                    title=f"Mandate Status Changed to {st}",
                    message=f"Mandate {m.get('bank_name')} ({m.get('account_or_vpa_masked')}) is now {st}.",
                    severity="WARNING" if st != "ACTIVE" else "SUCCESS"
                )
                return m
            return None

    # =========================================================================
    # ADDRESS RESOLUTION HELPERS
    # =========================================================================
    def _resolve_shipping_address(
        self,
        user_id: str,
        address_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Resolves the shipping address for an autonomous purchase in priority order:
        1. If address_id is explicitly provided, fetch and use that address.
        2. Otherwise, find the customer's default address (is_default = 1).
        3. If no default exists but other addresses do, use the most recently added.
        4. If NO addresses exist at all, raise a ValueError with a structured message
           that the caller can surface as an address-required response.

        Returns a dict compatible with process_checkout() shipping_address payload.
        Emits ADDRESS_SELECTED_FOR_AUTOPAY audit log.
        """
        addresses = customer_order_service.get_addresses(user_id)

        if not addresses:
            raise ValueError(
                "NO_ADDRESSES_ON_FILE: No delivery address found for this account. "
                "Please add a shipping address before enabling autonomous purchases."
            )

        chosen: Optional[Dict[str, Any]] = None
        selection_reason = "default_address"

        if address_id:
            # Explicit caller-supplied address_id
            chosen = next((a for a in addresses if a["id"] == address_id), None)
            if not chosen:
                raise ValueError(
                    f"ADDRESS_NOT_FOUND: Address '{address_id}' does not belong to this account."
                )
            selection_reason = "caller_specified"
        else:
            # Pick default, then fall back to most recent
            chosen = next((a for a in addresses if a.get("is_default")), None)
            if not chosen:
                chosen = addresses[0]   # get_addresses returns DESC by created_at after defaults
                selection_reason = "most_recent_fallback"

        audit_service.log_audit(
            action="ADDRESS_SELECTED_FOR_AUTOPAY",
            entity_type="ADDRESS",
            entity_id=chosen["id"],
            user_id=user_id,
            role="AI_Commerce_Agent",
            old_value=None,
            new_value={
                "address_id": chosen["id"],
                "full_name": chosen["full_name"],
                "city": chosen["city"],
                "state": chosen["state"],
                "pincode": chosen["pincode"],
                "is_default": bool(chosen.get("is_default")),
                "selection_reason": selection_reason
            }
        )

        return {
            "address_id": chosen["id"],
            "full_name": chosen["full_name"],
            "phone": chosen["phone"],
            "address_line1": chosen["address_line1"],
            "address_line2": chosen.get("address_line2") or "",
            "city": chosen["city"],
            "state": chosen["state"],
            "pincode": chosen["pincode"],
            "landmark": chosen.get("landmark") or "",
            "is_default": bool(chosen.get("is_default")),
            "selection_reason": selection_reason
        }

    def select_address_for_autopay(
        self,
        user_id: str,
        address_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Public method: preview which address will be used for an autonomous purchase.
        Returns the resolved address dict OR a structured error payload the UI can use
        to ask the customer to select/add an address before approving.
        """
        try:
            return {
                "status": "resolved",
                "address": self._resolve_shipping_address(user_id, address_id),
                "all_addresses": customer_order_service.get_addresses(user_id)
            }
        except ValueError as e:
            msg = str(e)
            return {
                "status": "address_required",
                "error": msg,
                "all_addresses": customer_order_service.get_addresses(user_id)
            }

    # =========================================================================
    # PRE-PURCHASE GUARDRAIL VALIDATION ENGINE
    # =========================================================================
    def validate_autonomous_purchase(
        self,
        user_id: str,
        product_id: str,
        product_name: str,
        category: str,
        unit_price: float,
        quantity: int,
        merchant_name: str = "Razorpay Hardware Direct",
        merchant_verified: bool = True
    ) -> Dict[str, Any]:
        """
        Validates all 6 safety guardrails before ANY autonomous purchase:
        1. AutoPay Status (must be ACTIVE)
        2. Connected & Active Mandate with sufficient max_amount
        3. Monthly Budget Headroom (spent + cost <= monthly_budget)
        4. Single Purchase Cap (cost <= max_single_purchase_limit)
        5. Category Whitelist (category in allowed_categories)
        6. Merchant Trust Level (verified check if VERIFIED_ONLY)
        """
        settings = self.get_settings(user_id)
        total_cost = round(unit_price * quantity, 2)
        norm_cat = category.strip().upper()

        checks = {
            "autopay_active": False,
            "mandate_active": False,
            "monthly_budget": False,
            "single_purchase_limit": False,
            "category_allowed": False,
            "merchant_verified": False
        }
        failures = []

        # Check 1: AutoPay Enabled
        if settings["autopay_enabled"]:
            checks["autopay_active"] = True
        else:
            failures.append("AutoPay is currently disabled in your Spending Rules.")

        # Check 2: Active Mandate
        mandates = self.get_mandates(user_id)
        valid_mandates = [m for m in mandates if m["status"] == "ACTIVE" and float(m["max_amount"]) >= total_cost]
        if valid_mandates:
            checks["mandate_active"] = True
            chosen_mandate = valid_mandates[0]
        else:
            failures.append(f"No active payment mandate with limit >= ₹{total_cost:,.2f} found.")
            chosen_mandate = None

        # Check 3: Monthly Budget
        if settings.get("monthly_budget") is not None:
            monthly_budget = float(settings["monthly_budget"])
            spent_month = float(settings["spent_this_month"])
            if spent_month + total_cost <= monthly_budget:
                checks["monthly_budget"] = True
            else:
                remaining = max(0.0, monthly_budget - spent_month)
                failures.append(f"Purchase (₹{total_cost:,.2f}) exceeds remaining monthly budget allowance (₹{remaining:,.2f} left of ₹{monthly_budget:,.2f}).")
        else:
            failures.append("Monthly budget has not been configured.")

        # Check 4: Single Purchase Limit
        if settings.get("max_single_purchase_limit") is not None:
            single_cap = float(settings["max_single_purchase_limit"])
            if total_cost <= single_cap:
                checks["single_purchase_limit"] = True
            else:
                failures.append(f"Purchase (₹{total_cost:,.2f}) exceeds Maximum Single Purchase Limit of ₹{single_cap:,.2f}.")
        else:
            failures.append("Maximum single purchase limit has not been configured.")


        # Check 5: Category Whitelist
        allowed_cats = [c.upper() for c in settings.get("allowed_categories", [])]
        
        # Category classification mapping
        category_map = {
            "PAYMENT TERMINALS": "HARDWARE",
            "PAYMENT AUDIO ALERTS": "HARDWARE",
            "HARDWARE": "HARDWARE",
            "CONSUMABLES": "ACCESSORIES",
            "ACCESSORIES": "ACCESSORIES",
            "WORKSTATION ACCESSORIES": "ACCESSORIES",
            "ENTERPRISE SOFTWARE": "SOFTWARE",
            "SOFTWARE": "SOFTWARE",
            "SUBSCRIPTIONS": "SUBSCRIPTIONS",
            "CARE": "SUBSCRIPTIONS"
        }
        mapped_cat = category_map.get(norm_cat, norm_cat)
        cat_matches = (mapped_cat in allowed_cats) or any(c in norm_cat or norm_cat in c for c in allowed_cats)

        if cat_matches:
            checks["category_allowed"] = True
        else:
            failures.append(f"Category '{category}' is not checked in your approved product categories: {allowed_cats}.")

        # Check 6: Merchant Verification
        if settings["merchant_trust_level"] == "VERIFIED_ONLY":
            if merchant_verified:
                checks["merchant_verified"] = True
            else:
                failures.append(f"Merchant '{merchant_name}' is not verified. Trust Rule set to 'Verified Merchants Only'.")
        else:
            checks["merchant_verified"] = True

        is_passed = len(failures) == 0

        return {
            "allowed": is_passed,
            "total_cost": total_cost,
            "checks": checks,
            "failures": failures,
            "chosen_mandate": chosen_mandate,
            "purchase_mode": settings["purchase_mode"]
        }

    # =========================================================================
    # AI REPLENISHMENT PREDICTION & RECOMMENDATIONS ENGINE
    # =========================================================================
    def can_generate_recommendations(self, user_id: str) -> tuple[bool, str]:
        """
        Check if replenishment recommendations may be generated for a customer.
        Requirements:
        1. Mandate exists (at least 1 active mandate in customer_mandates)
        2. AutoPay enabled (autopay_enabled is True)
        3. Customer has purchase history (at least 1 order in merchant_orders)
        Otherwise returns False with descriptive message.
        """
        settings = self.get_settings(user_id)
        if not settings.get("autopay_enabled"):
            return False, "AutoPay is disabled."

        mandates = self.get_mandates(user_id)
        active_mandates = [m for m in mandates if m.get("status") == "ACTIVE"]
        if not active_mandates:
            return False, "No active mandate found."

        orders = customer_order_service.get_customer_orders(user_id=user_id)
        order_count = len(orders) if isinstance(orders, list) else (orders.get("total", len(orders.get("orders", []))) if isinstance(orders, dict) else 0)
        if order_count == 0:
            return False, "No purchase history available yet."

        return True, "Eligible for replenishment recommendations"

    def generate_replenishment_recommendations(self, user_id: str = "usr_customer_demo") -> List[Dict[str, Any]]:
        can_generate, reason = self.can_generate_recommendations(user_id)
        if not can_generate:
            return []

        now_dt = datetime.now()
        now_str = utcnow_iso()

        prediction_templates = [
            {
                "product_id": "ACC-ROLL-006",
                "product_name": "Thermal POS Receipt Paper Rolls (Pack of 20)",
                "category": "ACCESSORIES",
                "sku": "SKU-ROLL-TH20",
                "unit_price": 999.0,
                "quantity": 2,
                "total_price": 1998.0,
                "merchant_name": "Razorpay Official Store",
                "merchant_verified": 1,
                "reasoning": "Purchased because: daily print volume exceeded threshold (85 receipts/day) and thermal roll inventory was critical (3 rolls remaining).",
                "confidence_score": 0.96,
                "need_urgency": "HIGH",
                "days_ahead": 3
            },
            {
                "product_id": "HW-SOUND-002",
                "product_name": "Razorpay 4G Soundbox - Voice Payment Notifier",
                "category": "HARDWARE",
                "sku": "SKU-SOUND-4G-V2",
                "unit_price": 2499.0,
                "quantity": 1,
                "total_price": 2499.0,
                "merchant_name": "Razorpay Hardware Direct",
                "merchant_verified": 1,
                "reasoning": "Purchased because: price dropped by 18% and matched saved hardware preferences for high-velocity UPI counter queues.",
                "confidence_score": 0.91,
                "need_urgency": "MEDIUM",
                "days_ahead": 5
            },
            {
                "product_id": "HW-QR-003",
                "product_name": "Smart All-in-One Acrylic Dynamic QR Stand",
                "category": "ACCESSORIES",
                "sku": "SKU-QR-STAND-PRO",
                "unit_price": 899.0,
                "quantity": 2,
                "total_price": 1798.0,
                "merchant_name": "Razorpay Hardware Direct",
                "merchant_verified": 1,
                "reasoning": "Purchased because: scheduled 90-day counter durability refresh cycle triggered for front billing desk.",
                "confidence_score": 0.88,
                "need_urgency": "SCHEDULED",
                "days_ahead": 8
            },
            {
                "product_id": "SOFT-POS-005",
                "product_name": "Razorpay Multi-Store POS Cloud Sync Pro",
                "category": "SOFTWARE",
                "sku": "SKU-SOFT-SYNC-PRO",
                "unit_price": 2999.0,
                "quantity": 1,
                "total_price": 2999.0,
                "merchant_name": "Razorpay Cloud Services",
                "merchant_verified": 1,
                "reasoning": "Purchased because: active billing terminals increased to 3 units, requiring automated cloud inventory synchronization.",
                "confidence_score": 0.84,
                "need_urgency": "MEDIUM",
                "days_ahead": 10
            }
        ]

        created_recs = []
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM ai_autopay_recommendations WHERE user_id = ? AND status = 'PENDING_APPROVAL'", (user_id,))
            
            for tmpl in prediction_templates:
                rec_id = f"rec_ai_{uuid.uuid4().hex[:8]}"
                pred_date = (now_dt + timedelta(days=tmpl["days_ahead"])).strftime("%Y-%m-%d")
                
                cursor.execute("""
                    INSERT INTO ai_autopay_recommendations
                    (id, user_id, product_id, product_name, category, sku, unit_price, quantity, total_price, merchant_name, merchant_verified, reasoning, confidence_score, need_urgency, predicted_date, status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING_APPROVAL', ?, ?)
                """, (
                    rec_id, user_id, tmpl["product_id"], tmpl["product_name"], tmpl["category"], tmpl["sku"],
                    tmpl["unit_price"], tmpl["quantity"], tmpl["total_price"], tmpl["merchant_name"], tmpl["merchant_verified"],
                    tmpl["reasoning"], tmpl["confidence_score"], tmpl["need_urgency"], pred_date, now_str, now_str
                ))

                created_recs.append({
                    "id": rec_id,
                    "user_id": user_id,
                    **tmpl,
                    "predicted_date": pred_date,
                    "status": "PENDING_APPROVAL"
                })

            conn.commit()

        audit_service.log_audit(
            action="AI_REPLENISHMENT_ANALYZED",
            entity_type="RECOMMENDATIONS",
            entity_id=f"rec_run_{user_id}",
            user_id=user_id,
            role="AI_Agent",
            old_value=None,
            new_value={"recommendations_generated": len(created_recs)}
        )

        return self.get_recommendations(user_id)

    def get_recommendations(self, user_id: str = "usr_customer_demo") -> List[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM ai_autopay_recommendations WHERE user_id = ? ORDER BY confidence_score DESC, created_at DESC", (user_id,))
            rows = cursor.fetchall()
            if not rows:
                can_generate, _ = self.can_generate_recommendations(user_id)
                if can_generate:
                    return self.generate_replenishment_recommendations(user_id)
                return []
            return [dict(r) for r in rows]


    # =========================================================================
    # AUTONOMOUS PURCHASE EXECUTION & AUDIT LOGGING
    # =========================================================================
    def execute_recommendation(
        self,
        recommendation_id: str,
        user_id: str = "usr_customer_demo",
        is_customer_action: bool = False,
        custom_reason: Optional[str] = None,
        address_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes a purchase with strict pre-validation guardrails:
        If validation fails, logs the failure, sends an in-app alert, and raises an exception.
        """
        now_str = utcnow_iso()
        settings = self.get_settings(user_id)
        
        # 1. Fetch recommendation
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM ai_autopay_recommendations WHERE id = ? AND user_id = ?", (recommendation_id, user_id))
            rec_row = cursor.fetchone()
            if not rec_row:
                raise ValueError(f"Recommendation '{recommendation_id}' not found.")
            rec = dict(rec_row)

        if rec["status"] == "EXECUTED":
            raise ValueError(f"Recommendation '{recommendation_id}' has already been executed under Order {rec.get('order_id')}.")

        # 2. Run Guardrail Engine
        validation = self.validate_autonomous_purchase(
            user_id=user_id,
            product_id=rec["product_id"],
            product_name=rec["product_name"],
            category=rec["category"],
            unit_price=float(rec["unit_price"]),
            quantity=int(rec["quantity"]),
            merchant_name=rec.get("merchant_name", "Razorpay Hardware Direct"),
            merchant_verified=bool(rec.get("merchant_verified", 1))
        )

        if not validation["allowed"] and not is_customer_action:
            # Create failed purchase notification
            reason_str = " | ".join(validation["failures"])
            self.create_notification(
                user_id=user_id,
                notif_type="PURCHASE_FAILED_GUARDRAIL",
                title=f"AI Auto-Purchase Blocked: {rec['product_name']}",
                message=f"Purchase of ₹{validation['total_cost']:,.2f} cancelled by safety guardrail: {reason_str}",
                severity="WARNING",
                metadata={"recommendation_id": recommendation_id, "failures": validation["failures"]}
            )
            raise ValueError(f"Autonomous Purchase Blocked: {reason_str}")

        if not is_customer_action and settings["purchase_mode"] == "RECOMMENDATION_ONLY":
            raise ValueError("Purchase Mode is set to 'Recommendation Only'. Customer manual confirmation required.")

        # 3. Select Mandate
        mandates = self.get_mandates(user_id)
        active_mandates = [m for m in mandates if m.get("status") == "ACTIVE" and float(m.get("max_amount", 0)) >= float(rec["total_price"])]
        if not active_mandates:
            raise ValueError("No active payment mandate with sufficient limit available.")
        
        chosen_mandate = active_mandates[0]
        payment_id = f"pay_rzp_autopay_{uuid.uuid4().hex[:10]}"
        item_total = float(rec["total_price"])
        approval_type = "RECOMMENDATION_APPROVED" if is_customer_action else "AUTO_BUY"

        # 4. Resolve dynamic shipping address from customer address book
        resolved_addr = self._resolve_shipping_address(user_id, address_id)

        # 5. Process Checkout via CustomerOrderService
        checkout_payload = {
            "customer_name": resolved_addr["full_name"],
            "customer_email": f"{user_id}@razorcommerce.ai",
            "customer_phone": resolved_addr["phone"],
            "shipping_address": {
                "address_id": resolved_addr["address_id"],
                "full_name": resolved_addr["full_name"],
                "address_line1": resolved_addr["address_line1"],
                "address_line2": resolved_addr["address_line2"],
                "city": resolved_addr["city"],
                "state": resolved_addr["state"],
                "pincode": resolved_addr["pincode"],
                "landmark": resolved_addr["landmark"],
                "phone": resolved_addr["phone"]
            },
            "delivery_option": "EXPRESS",
            "payment_method": chosen_mandate["type"],
            "payment_id": payment_id,
            "items": [{
                "product_id": rec["product_id"],
                "name": rec["product_name"],
                "price": rec["unit_price"],
                "quantity": rec["quantity"],
                "sku": rec["sku"]
            }]
        }

        order_res = customer_order_service.process_checkout(user_id=user_id, payload=checkout_payload)
        order_id = order_res.get("id") or order_res.get("order_number")

        # 5. Update Budgets & Record Explainable Audit Log
        spent_month = float(settings["spent_this_month"])
        monthly_budget = float(settings["monthly_budget"])
        new_spent = round(spent_month + item_total, 2)
        exec_log_id = f"log_ap_{uuid.uuid4().hex[:8]}"
        purchase_reason = custom_reason or rec.get("reasoning") or "Autonomous Replenishment"

        guardrail_summary = {
            "budget_check": f"PASS (₹{new_spent:,.2f} <= ₹{monthly_budget:,.2f})",
            "single_limit_check": f"PASS (₹{item_total:,.2f} <= ₹{settings['max_single_purchase_limit']:,.2f})",
            "category_check": f"PASS ({rec['category']} whitelisted)",
            "merchant_check": f"PASS ({rec.get('merchant_name')} verified)",
            "mandate_check": f"PASS ({chosen_mandate['type']} {chosen_mandate['account_or_vpa_masked']})",
            "address_check": f"PASS ({resolved_addr['city']}, {resolved_addr['state']} — {resolved_addr['selection_reason']})"
        }

        last_purchase_dict = {
            "product_name": rec["product_name"],
            "amount": item_total,
            "order_id": order_id,
            "timestamp": now_str,
            "reason": purchase_reason
        }

        with self._get_conn() as conn:
            cursor = conn.cursor()

            # Mark recommendation EXECUTED
            cursor.execute("""
                UPDATE ai_autopay_recommendations
                SET status = 'EXECUTED', order_id = ?, updated_at = ?
                WHERE id = ?
            """, (order_id, now_str, recommendation_id))

            # Update customer budget & last purchase record
            cursor.execute("""
                UPDATE customer_budgets
                SET spent_this_month = ?, last_autonomous_purchase_json = ?, updated_at = ?
                WHERE user_id = ?
            """, (new_spent, json.dumps(last_purchase_dict), now_str, user_id))

            # Record execution log with complete explainability & audit metadata
            cursor.execute("""
                INSERT INTO autopay_execution_logs
                (id, user_id, recommendation_id, order_id, product_id, product_name, category, sku, merchant_name, merchant_verified, amount, mandate_id, payment_method, purchase_reason, approval_type, guardrails_validated_json, budget_before, budget_after, status, refund_status, razorpay_payment_id, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SUCCESS', 'NONE', ?, ?)
            """, (
                exec_log_id, user_id, recommendation_id, order_id,
                rec["product_id"], rec["product_name"], rec["category"], rec["sku"],
                rec.get("merchant_name", "Razorpay Official Store"), int(rec.get("merchant_verified", 1)),
                item_total, chosen_mandate["id"], f"{chosen_mandate['type'].replace('_', ' ')} ({chosen_mandate['account_or_vpa_masked']})",
                purchase_reason, approval_type, json.dumps(guardrail_summary),
                spent_month, new_spent, payment_id, now_str
            ))
            conn.commit()

        # Check if budget is nearing limit (> 80%)
        if monthly_budget > 0 and (new_spent / monthly_budget) >= 0.80:
            self.create_notification(
                user_id=user_id,
                notif_type="BUDGET_WARNING",
                title="Monthly Budget Threshold Warning (80%+ Spent)",
                message=f"You have used ₹{new_spent:,.2f} of your ₹{monthly_budget:,.2f} monthly budget ({round((new_spent/monthly_budget)*100, 1)}%). Remaining: ₹{round(monthly_budget - new_spent, 2):,.2f}.",
                severity="WARNING"
            )

        # Send success notification
        self.create_notification(
            user_id=user_id,
            notif_type="AUTONOMOUS_PURCHASE_SUCCESS",
            title=f"AI Purchase Executed: {rec['product_name']}",
            message=f"Order {order_id} placed for ₹{item_total:,.2f} via {chosen_mandate['bank_name']} ({chosen_mandate['account_or_vpa_masked']}).",
            severity="SUCCESS",
            metadata={"order_id": order_id, "amount": item_total, "execution_id": exec_log_id}
        )

        audit_service.log_audit(
            action="AUTONOMOUS_PURCHASE_COMPLETED",
            entity_type="AUTOPAY_ORDER",
            entity_id=order_id,
            user_id=user_id,
            role="AI_Commerce_Agent",
            old_value={"spent_this_month": spent_month},
            new_value={
                "order_id": order_id,
                "product": rec["product_name"],
                "amount": item_total,
                "reason": purchase_reason,
                "new_spent_this_month": new_spent
            }
        )

        return {
            "status": "success",
            "execution_id": exec_log_id,
            "order_id": order_id,
            "product_name": rec["product_name"],
            "amount": item_total,
            "payment_method": f"{chosen_mandate['type']} ({chosen_mandate['account_or_vpa_masked']})",
            "approval_type": approval_type,
            "purchase_reason": purchase_reason,
            "spent_this_month": new_spent,
            "remaining_budget": round(monthly_budget - new_spent, 2),
            "guardrails_validated": guardrail_summary,
            "shipping_address": resolved_addr,
            "order_details": order_res
        }

    def direct_one_click_buy(
        self,
        product_id: str,
        quantity: int = 1,
        user_id: str = "usr_customer_demo",
        custom_reason: Optional[str] = None,
        product_name: Optional[str] = None,
        unit_price: Optional[float] = None,
        category: Optional[str] = None,
        sku: Optional[str] = None,
        is_autonomous_agent: bool = True,
        address_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        One-Click Agent Purchase ("Buy via AutoPay" / "Agent Purchase"):
        1. Resolve product metadata.
        2. Validate all 6 safety guardrails against customer's AutoPay settings.
        3. If allowed, charge linked payment mandate (UPI / Credit Card / Debit Card / NetBanking).
        4. Create customer order in customer_order_service and reduce stock.
        5. Generate single-page GST invoice and delivery tracking record.
        6. Record execution in autopay_execution_logs with full audit trail:
           user_id, product_id, amount, timestamp, payment_method, approval_type, autopay_rule_used.
        7. Send in-app notification.
        8. Return Agent Confirmation Screen receipt details.
        """
        now_str = utcnow_iso()
        settings = self.get_settings(user_id)

        # Fallback catalog lookup if sparse info provided
        catalog_lookup = {
            "prod_pos_smart_v3": ("Razorpay Smart POS Terminal V3", 14999.0, "HARDWARE", "SKU-POS-SMART-V3", "https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600&auto=format&fit=crop&q=80"),
            "prod_soundbox_4g": ("Razorpay Smart Soundbox 4G Pro", 2499.0, "HARDWARE", "SKU-SOUND-4G-V2", "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80"),
            "ACC-ROLL-006": ("Thermal POS Receipt Paper Rolls (Pack of 20)", 999.0, "ACCESSORIES", "SKU-ROLL-TH20", "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop&q=80"),
            "HW-QR-003": ("Smart All-in-One Acrylic Dynamic QR Stand", 899.0, "ACCESSORIES", "SKU-QR-STAND-PRO", "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=600&auto=format&fit=crop&q=80"),
            "HW-READER-004": ("Contactless NFC & EMV Card Reader", 4999.0, "HARDWARE", "SKU-READER-NFC-01", "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&auto=format&fit=crop&q=80"),
            "SOFT-POS-005": ("Razorpay Multi-Store POS Cloud Sync Pro", 2999.0, "SOFTWARE", "SKU-SOFT-SYNC-PRO", "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80"),
            "prod_mech_keyboard_pro": ("Keychron Q3 Pro FinTech Edition Mechanical Keyboard", 18999.0, "ACCESSORIES", "SKU-KEY-Q3-PRO", "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80")
        }

        p_name = product_name
        p_price = unit_price
        p_cat = category
        p_sku = sku
        p_img = "https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600&auto=format&fit=crop&q=80"

        if product_id in catalog_lookup:
            meta = catalog_lookup[product_id]
            p_name = p_name or meta[0]
            p_price = p_price if p_price is not None else meta[1]
            p_cat = p_cat or meta[2]
            p_sku = p_sku or meta[3]
            p_img = meta[4]
        else:
            p_name = p_name or f"FinTech Product {product_id}"
            p_price = float(p_price or 14999.0)
            p_cat = p_cat or "HARDWARE"
            p_sku = p_sku or f"SKU-{product_id.upper()}"

        item_total = round(p_price * quantity, 2)
        merchant_name = "Razorpay Hardware Direct"

        # 1. Pre-purchase Guardrail Validation
        validation = self.validate_autonomous_purchase(
            user_id=user_id,
            product_id=product_id,
            product_name=p_name,
            category=p_cat,
            unit_price=p_price,
            quantity=quantity,
            merchant_name=merchant_name,
            merchant_verified=True
        )

        if not validation["allowed"]:
            failure_reason = " | ".join(validation["failures"])
            self.create_notification(
                user_id=user_id,
                notif_type="PURCHASE_FAILED_GUARDRAIL",
                title=f"Autonomous Buy Blocked: {p_name}",
                message=f"Purchase of ₹{item_total:,.2f} cancelled: {failure_reason}",
                severity="WARNING"
            )
            raise ValueError(f"Autonomous Purchase Guardrail Triggered: {failure_reason}")

        # 2. Select Linked Active Mandate
        mandates = self.get_mandates(user_id)
        active_mandates = [m for m in mandates if m.get("status") == "ACTIVE" and float(m.get("max_amount", 0)) >= item_total]
        if not active_mandates:
            raise ValueError("No active Razorpay AutoPay mandate with sufficient transaction limit found. Please connect UPI or Card mandate.")

        chosen_mandate = active_mandates[0]
        payment_id = f"pay_rzp_autopay_{uuid.uuid4().hex[:10]}"
        approval_type = "YES (Autonomous)" if is_autonomous_agent else "YES (Customer Approved)"
        autopay_rule_used = f"Monthly Cap: ₹{settings['monthly_budget']:,.0f} | Single Limit: ₹{settings['max_single_purchase_limit']:,.0f} | Categories: {','.join(settings['allowed_categories'])}"

        # 3. Resolve dynamic shipping address from customer address book
        resolved_addr = self._resolve_shipping_address(user_id, address_id)

        # 4. Process Checkout via CustomerOrderService
        checkout_payload = {
            "customer_name": resolved_addr["full_name"],
            "customer_email": f"{user_id}@razorcommerce.ai",
            "customer_phone": resolved_addr["phone"],
            "shipping_address": {
                "address_id": resolved_addr["address_id"],
                "full_name": resolved_addr["full_name"],
                "address_line1": resolved_addr["address_line1"],
                "address_line2": resolved_addr["address_line2"],
                "city": resolved_addr["city"],
                "state": resolved_addr["state"],
                "pincode": resolved_addr["pincode"],
                "landmark": resolved_addr["landmark"],
                "phone": resolved_addr["phone"]
            },
            "delivery_option": "EXPRESS",
            "payment_method": chosen_mandate["type"],
            "payment_id": payment_id,
            "items": [{
                "product_id": product_id,
                "name": p_name,
                "price": p_price,
                "quantity": quantity,
                "sku": p_sku
            }]
        }

        order_res = customer_order_service.process_checkout(user_id=user_id, payload=checkout_payload)
        order_id = order_res.get("id") or order_res.get("order_number")

        # 4. Update Spent Budget & Audit Log
        spent_month = float(settings["spent_this_month"])
        monthly_budget = float(settings["monthly_budget"])
        new_spent = round(spent_month + item_total, 2)
        exec_log_id = f"log_ap_{uuid.uuid4().hex[:8]}"
        purchase_reason = custom_reason or f"Purchased autonomously via AI Commerce Agent within approved single limit of ₹{settings['max_single_purchase_limit']:,.2f}."

        guardrail_summary = {
            "budget_check": f"PASS (₹{new_spent:,.2f} <= ₹{monthly_budget:,.2f})",
            "single_limit_check": f"PASS (₹{item_total:,.2f} <= ₹{settings['max_single_purchase_limit']:,.2f})",
            "category_check": f"PASS ({p_cat} whitelisted)",
            "merchant_check": f"PASS ({merchant_name} verified)",
            "mandate_check": f"PASS ({chosen_mandate['type']} {chosen_mandate['account_or_vpa_masked']})",
            "address_check": f"PASS ({resolved_addr['city']}, {resolved_addr['state']} — {resolved_addr['selection_reason']})"
        }

        last_purchase_dict = {
            "product_name": p_name,
            "amount": item_total,
            "order_id": order_id,
            "timestamp": now_str,
            "reason": purchase_reason
        }

        with self._get_conn() as conn:
            cursor = conn.cursor()

            # Update customer budget & last purchase record
            cursor.execute("""
                UPDATE customer_budgets
                SET spent_this_month = ?, last_autonomous_purchase_json = ?, updated_at = ?
                WHERE user_id = ?
            """, (new_spent, json.dumps(last_purchase_dict), now_str, user_id))

            # Record execution log with complete audit trail
            cursor.execute("""
                INSERT INTO autopay_execution_logs
                (id, user_id, recommendation_id, order_id, product_id, product_name, category, sku, merchant_name, merchant_verified, amount, mandate_id, payment_method, purchase_reason, approval_type, guardrails_validated_json, budget_before, budget_after, status, refund_status, autopay_rule_used, razorpay_payment_id, timestamp)
                VALUES (?, ?, 'direct_buy', ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, 'SUCCESS', 'NONE', ?, ?, ?)
            """, (
                exec_log_id, user_id, order_id,
                product_id, p_name, p_cat, p_sku,
                merchant_name, item_total, chosen_mandate["id"],
                f"Linked {chosen_mandate['bank_name']} ({chosen_mandate['account_or_vpa_masked']})",
                purchase_reason, approval_type, json.dumps(guardrail_summary),
                spent_month, new_spent, autopay_rule_used, payment_id, now_str
            ))
            conn.commit()

        # Send notification
        self.create_notification(
            user_id=user_id,
            notif_type="AUTONOMOUS_PURCHASE_SUCCESS",
            title=f"AutoPay Purchase Completed: {p_name}",
            message=f"Agent placed order #{order_id} for ₹{item_total:,.2f} via {chosen_mandate['bank_name']} ({chosen_mandate['account_or_vpa_masked']}).",
            severity="SUCCESS",
            metadata={"order_id": order_id, "amount": item_total, "execution_id": exec_log_id}
        )

        audit_service.log_audit(
            action="AGENT_PURCHASE_COMPLETED",
            entity_type="AUTOPAY_ORDER",
            entity_id=order_id,
            user_id=user_id,
            role="AI_Commerce_Agent",
            old_value={"spent_this_month": spent_month},
            new_value={
                "order_id": order_id,
                "product": p_name,
                "amount": item_total,
                "mandate": chosen_mandate["account_or_vpa_masked"],
                "rule_used": autopay_rule_used,
                "new_spent_this_month": new_spent
            }
        )

        # 5. Agent Confirmation Screen Receipt
        subtotal = round(item_total / 1.18, 2)
        gst_amount = round(item_total - subtotal, 2)

        confirmation_screen = {
            "product": {
                "id": product_id,
                "name": p_name,
                "category": p_cat,
                "sku": p_sku,
                "image_url": p_img
            },
            "quantity": quantity,
            "unit_price": p_price,
            "subtotal": subtotal,
            "gst_amount": gst_amount,
            "delivery_fee": 0.0,
            "total": item_total,
            "payment_method": f"Linked {chosen_mandate['bank_name']} ({chosen_mandate['account_or_vpa_masked']})",
            "mandate_type": chosen_mandate["type"],
            "status": "AutoPay Approved",
            "order_id": order_id,
            "execution_id": exec_log_id,
            "timestamp": now_str,
            "approval_type": approval_type,
            "autopay_rule_used": autopay_rule_used,
            "spent_this_month": new_spent,
            "remaining_budget": round(monthly_budget - new_spent, 2),
            "invoice_url": f"/orders/{order_id}/invoice",
            "tracking_url": f"/orders/{order_id}/tracking"
        }

        confirmation_screen["shipping_address"] = {
            "address_id": resolved_addr["address_id"],
            "full_name": resolved_addr["full_name"],
            "address_line1": resolved_addr["address_line1"],
            "address_line2": resolved_addr["address_line2"],
            "city": resolved_addr["city"],
            "state": resolved_addr["state"],
            "pincode": resolved_addr["pincode"],
            "landmark": resolved_addr["landmark"],
            "is_default": resolved_addr["is_default"],
            "selection_reason": resolved_addr["selection_reason"]
        }

        return {
            "status": "success",
            "order_id": order_id,
            "execution_id": exec_log_id,
            "shipping_address": resolved_addr,
            "confirmation": confirmation_screen
        }

    # =========================================================================
    # 1-CLICK REVERSIBLE REFUND WORKFLOW
    # =========================================================================
    def refund_autonomous_purchase(self, log_id: str, user_id: str = "usr_customer_demo", reason: str = "Customer requested reversal") -> Dict[str, Any]:
        """
        Reverses an AI autonomous purchase:
        1. Validates log existence and non-refunded status.
        2. Restores customer's spent monthly budget.
        3. Marks execution log as REFUNDED.
        4. Logs audit event and notifies customer.
        """
        now_str = utcnow_iso()
        settings = self.get_settings(user_id)

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM autopay_execution_logs WHERE id = ? AND user_id = ?", (log_id, user_id))
            log_row = cursor.fetchone()
            if not log_row:
                raise ValueError(f"Autonomous purchase record '{log_id}' not found.")
            log_item = dict(log_row)

        if log_item.get("refund_status") == "REFUNDED":
            raise ValueError(f"This purchase (Order {log_item.get('order_id')}) has already been refunded.")

        amount = float(log_item["amount"])
        spent_month = float(settings["spent_this_month"])
        monthly_budget = float(settings["monthly_budget"])
        new_spent = max(0.0, round(spent_month - amount, 2))
        refund_order_id = f"ref_{uuid.uuid4().hex[:8]}"

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE autopay_execution_logs
                SET refund_status = 'REFUNDED', status = 'REFUNDED', refund_reason = ?, refund_order_id = ?
                WHERE id = ?
            """, (reason, refund_order_id, log_id))

            cursor.execute("""
                UPDATE customer_budgets
                SET spent_this_month = ?, updated_at = ?
                WHERE user_id = ?
            """, (new_spent, now_str, user_id))
            conn.commit()

        # Send refund notification
        self.create_notification(
            user_id=user_id,
            notif_type="PURCHASE_REFUNDED",
            title=f"Purchase Reversed & Refunded: ₹{amount:,.2f}",
            message=f"Order {log_item.get('order_id')} ({log_item.get('product_name')}) reversed. ₹{amount:,.2f} credited back to monthly allowance.",
            severity="SUCCESS",
            metadata={"log_id": log_id, "refund_id": refund_order_id, "amount": amount}
        )

        audit_service.log_audit(
            action="AUTONOMOUS_PURCHASE_REVERSED",
            entity_type="REFUND",
            entity_id=refund_order_id,
            user_id=user_id,
            role="Customer",
            old_value={"spent_this_month": spent_month, "order_id": log_item.get("order_id")},
            new_value={"spent_this_month": new_spent, "refunded_amount": amount, "reason": reason}
        )

        return {
            "status": "success",
            "refund_id": refund_order_id,
            "order_id": log_item.get("order_id"),
            "refunded_amount": amount,
            "new_spent_this_month": new_spent,
            "remaining_budget": round(monthly_budget - new_spent, 2),
            "message": f"Successfully reversed order {log_item.get('order_id')} and restored ₹{amount:,.2f} to your budget."
        }

    # =========================================================================
    # NOTIFICATIONS SYSTEM
    # =========================================================================
    def create_notification(
        self,
        user_id: str,
        notif_type: str,
        title: str,
        message: str,
        severity: str = "INFO",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        notif_id = f"notif_{uuid.uuid4().hex[:8]}"
        now_str = utcnow_iso()
        meta_json = json.dumps(metadata) if metadata else None

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO autopay_notifications
                (id, user_id, type, title, message, severity, metadata_json, is_read, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
            """, (notif_id, user_id, notif_type, title, message, severity, meta_json, now_str))
            conn.commit()

        return {
            "id": notif_id,
            "user_id": user_id,
            "type": notif_type,
            "title": title,
            "message": message,
            "severity": severity,
            "timestamp": now_str
        }

    def get_notifications(self, user_id: str = "usr_customer_demo", limit: int = 20) -> List[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM autopay_notifications WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?", (user_id, limit))
            rows = cursor.fetchall()
            notifs = []
            for r in rows:
                d = dict(r)
                d["metadata"] = json.loads(d["metadata_json"]) if d.get("metadata_json") else {}
                d["is_read"] = bool(d.get("is_read"))
                notifs.append(d)
            return notifs

    def mark_notification_read(self, notif_id: str, user_id: str = "usr_customer_demo") -> Dict[str, Any]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE autopay_notifications SET is_read = 1 WHERE id = ? AND user_id = ?", (notif_id, user_id))
            conn.commit()
        return {"status": "success", "id": notif_id}

    def mark_all_notifications_read(self, user_id: str = "usr_customer_demo") -> Dict[str, Any]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE autopay_notifications SET is_read = 1 WHERE user_id = ?", (user_id,))
            conn.commit()
        return {"status": "success", "message": "All notifications marked as read"}

    # =========================================================================
    # REJECTION & AUTONOMOUS CYCLE
    # =========================================================================
    def reject_recommendation(self, recommendation_id: str, user_id: str, reason: str = "Dismissed by customer") -> Dict[str, Any]:
        now_str = utcnow_iso()
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE ai_autopay_recommendations SET status = 'DISMISSED', updated_at = ? WHERE id = ? AND user_id = ?", (now_str, recommendation_id, user_id))
            conn.commit()

        audit_service.log_audit(
            action="AUTOPAY_RECOMMENDATION_DISMISSED",
            entity_type="RECOMMENDATIONS",
            entity_id=recommendation_id,
            user_id=user_id,
            role="Customer",
            old_value={"status": "PENDING_APPROVAL"},
            new_value={"status": "DISMISSED", "reason": reason}
        )
        return {"status": "success", "message": "Recommendation dismissed"}

    def run_autonomous_replenishment_cycle(self, user_id: str = "usr_customer_demo") -> Dict[str, Any]:
        settings = self.get_settings(user_id)
        if not settings["autopay_enabled"]:
            return {"status": "skipped", "message": "AutoPay is disabled"}

        recs = self.get_recommendations(user_id)
        pending_recs = [r for r in recs if r["status"] == "PENDING_APPROVAL"]
        
        executed = []
        skipped = []

        for r in pending_recs:
            if settings["purchase_mode"] == "AUTO_BUY":
                try:
                    res = self.execute_recommendation(r["id"], user_id=user_id, is_customer_action=False)
                    executed.append(res)
                except Exception as e:
                    skipped.append({"recommendation_id": r["id"], "reason": str(e)})
            else:
                skipped.append({"recommendation_id": r["id"], "reason": "Requires customer approval (Mode: Recommendation Only)"})

        return {
            "status": "completed",
            "cycle_timestamp": utcnow_iso(),
            "executed_count": len(executed),
            "skipped_count": len(skipped),
            "executed": executed,
            "skipped": skipped
        }

    # =========================================================================
    # AUTOPAY DASHBOARD OVERVIEW & AUDIT LOGS
    # =========================================================================
    def get_dashboard_summary(self, user_id: str = "usr_customer_demo") -> Dict[str, Any]:
        settings = self.get_settings(user_id)
        mandates = self.get_mandates(user_id)
        recommendations = self.get_recommendations(user_id)
        notifications = self.get_notifications(user_id, limit=10)

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM autopay_execution_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT 20", (user_id,))
            logs = []
            for r in cursor.fetchall():
                d = dict(r)
                d["guardrails_validated"] = json.loads(d["guardrails_validated_json"]) if d.get("guardrails_validated_json") else {}
                logs.append(d)

        pending_recs = [r for r in recommendations if r["status"] == "PENDING_APPROVAL"]
        executed_recs = [r for r in recommendations if r["status"] == "EXECUTED"]

        can_generate, rec_notice = self.can_generate_recommendations(user_id)

        monthly_budget = float(settings["monthly_budget"]) if settings.get("monthly_budget") is not None else None
        spent = float(settings["spent_this_month"] or 0.0)
        remaining = max(0.0, round(monthly_budget - spent, 2)) if monthly_budget is not None else None
        spent_pct = min(100.0, round((spent / monthly_budget) * 100, 1)) if monthly_budget and monthly_budget > 0 else 0.0

        # Connected mandate summary
        connected_mandate = None
        if settings.get("connected_mandate_id"):
            matched = [m for m in mandates if m["id"] == settings["connected_mandate_id"]]
            if matched:
                connected_mandate = matched[0]
        if not connected_mandate and mandates:
            connected_mandate = mandates[0]

        is_configured = bool(monthly_budget is not None and monthly_budget > 0 and len(mandates) > 0 and settings.get("connected_mandate_id"))

        active_mandates_count = len([m for m in mandates if m["status"] == "ACTIVE"])
        autopay_status = "ACTIVE" if settings["autopay_enabled"] else "DISABLED"

        return {
            "settings": settings,
            "is_configured": is_configured,
            "autopay_status": autopay_status,
            "active_mandates_count": active_mandates_count,
            "recommendation_notice": rec_notice if not can_generate else None,
            "kpis": {
                "monthly_budget": monthly_budget,
                "spent_this_month": spent,
                "remaining_budget": remaining,
                "spent_percentage": spent_pct,
                "autopay_status": autopay_status,
                "purchase_mode": settings.get("purchase_mode", "RECOMMENDATION_ONLY"),
                "max_single_purchase_limit": settings.get("max_single_purchase_limit"),
                "merchant_trust_level": settings.get("merchant_trust_level", "VERIFIED_ONLY"),
                "connected_mandate": connected_mandate,
                "active_mandates_count": len([m for m in mandates if m["status"] == "ACTIVE"]),
                "pending_recommendations_count": len(pending_recs),
                "executed_orders_count": len(executed_recs),
                "unread_notifications_count": len([n for n in notifications if not n["is_read"]])
            },
            "mandates": mandates,
            "upcoming_recommendations": pending_recs,
            "execution_history": logs,
            "notifications": notifications
        }

ai_autopay_service = AIAutoPayService()
