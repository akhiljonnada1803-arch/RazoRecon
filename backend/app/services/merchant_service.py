import sqlite3
import os
import uuid
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "merchant.db")

class MerchantService:
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
            
            # Orders Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS merchant_orders (
                    id TEXT PRIMARY KEY,
                    order_number TEXT NOT NULL UNIQUE,
                    customer_id TEXT NOT NULL,
                    customer_name TEXT NOT NULL,
                    customer_email TEXT NOT NULL,
                    items_json TEXT NOT NULL,
                    subtotal REAL NOT NULL,
                    tax REAL NOT NULL,
                    discount REAL NOT NULL,
                    total_amount REAL NOT NULL,
                    currency TEXT DEFAULT 'INR',
                    status TEXT NOT NULL, -- PENDING, PAID, CANCELLED, REFUNDED
                    payment_id TEXT,
                    payment_method TEXT,
                    reconciled INTEGER DEFAULT 0,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """)

            # Customers Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS merchant_customers (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    phone TEXT,
                    tier TEXT NOT NULL, -- Enterprise Platinum, Growth Gold, Starter
                    lifetime_value REAL NOT NULL,
                    orders_count INTEGER NOT NULL,
                    average_order_value REAL NOT NULL,
                    preferences_json TEXT NOT NULL, -- categories, payment methods, channel
                    ai_insights TEXT NOT NULL,
                    last_purchase_date TEXT,
                    created_at TEXT NOT NULL
                )
            """)

            conn.commit()

    def _seed_data(self):
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) as count FROM merchant_customers")
            if cursor.fetchone()["count"] == 0:
                now = datetime.utcnow()
                
                # Seed Customers
                customers = [
                    {
                        "id": "cust_01",
                        "name": "Reliance Retail Infra",
                        "email": "procurement@relianceretail.com",
                        "phone": "+91 98201 11223",
                        "tier": "Enterprise Platinum",
                        "lifetime_value": 485000.0,
                        "orders_count": 14,
                        "average_order_value": 34642.85,
                        "preferences": {
                            "favourite_categories": ["Payment Terminals", "Soundboxes"],
                            "preferred_payment": "Razorpay NetBanking",
                            "buying_frequency": "Bi-weekly",
                            "credit_limit": 1000000.0
                        },
                        "ai_insights": "High-velocity retail buyer. Strong propensity to adopt Android POS upgrades and thermal paper roll bundles. Zero chargeback history.",
                        "last_purchase_date": (now - timedelta(days=2)).strftime("%Y-%m-%d %H:%M:%S")
                    },
                    {
                        "id": "cust_02",
                        "name": "Tata Consumer Logistics",
                        "email": "finance@tataconsumer.com",
                        "phone": "+91 98112 44556",
                        "tier": "Enterprise Platinum",
                        "lifetime_value": 390000.0,
                        "orders_count": 8,
                        "average_order_value": 48750.0,
                        "preferences": {
                            "favourite_categories": ["FinOps Software", "Workstations"],
                            "preferred_payment": "Corporate Card",
                            "buying_frequency": "Monthly",
                            "credit_limit": 750000.0
                        },
                        "ai_insights": "Procures ERP audit connectors and financial terminal suites. Responds well to early-bird annual license discount campaigns.",
                        "last_purchase_date": (now - timedelta(days=5)).strftime("%Y-%m-%d %H:%M:%S")
                    },
                    {
                        "id": "cust_03",
                        "name": "Zepto Quick Delivery Hubs",
                        "email": "storeops@zepto.in",
                        "phone": "+91 99300 77889",
                        "tier": "Growth Gold",
                        "lifetime_value": 185000.0,
                        "orders_count": 6,
                        "average_order_value": 30833.33,
                        "preferences": {
                            "favourite_categories": ["Soundboxes", "Retail Peripherals"],
                            "preferred_payment": "UPI AutoPay",
                            "buying_frequency": "Monthly",
                            "credit_limit": 300000.0
                        },
                        "ai_insights": "Rapid dark-store fleet expansion. Likely to upgrade to 4G Dual-SIM Voice Soundboxes with multi-language prompts.",
                        "last_purchase_date": (now - timedelta(days=9)).strftime("%Y-%m-%d %H:%M:%S")
                    },
                    {
                        "id": "cust_04",
                        "name": "Kroma Electronics Store #14",
                        "email": "manager.mumbai@kroma.in",
                        "phone": "+91 98450 99112",
                        "tier": "Growth Gold",
                        "lifetime_value": 142000.0,
                        "orders_count": 4,
                        "average_order_value": 35500.0,
                        "preferences": {
                            "favourite_categories": ["Workstations", "Security"],
                            "preferred_payment": "Razorpay UPI",
                            "buying_frequency": "Quarterly",
                            "credit_limit": 250000.0
                        },
                        "ai_insights": "High interest in mechanical keyboards, 4K curved displays, and YubiKey 5 hardware tokens for cashier desks.",
                        "last_purchase_date": (now - timedelta(days=14)).strftime("%Y-%m-%d %H:%M:%S")
                    },
                    {
                        "id": "cust_05",
                        "name": "Blinkit Micro-Fulfillment",
                        "email": "infra@blinkit.com",
                        "phone": "+91 97170 33445",
                        "tier": "Starter",
                        "lifetime_value": 68000.0,
                        "orders_count": 2,
                        "average_order_value": 34000.0,
                        "preferences": {
                            "favourite_categories": ["Payment Terminals"],
                            "preferred_payment": "UPI QR",
                            "buying_frequency": "Ad-hoc",
                            "credit_limit": 100000.0
                        },
                        "ai_insights": "New onboarding merchant. High cart abandonment risk unless greeted with welcome offer RAZOR2026.",
                        "last_purchase_date": (now - timedelta(days=22)).strftime("%Y-%m-%d %H:%M:%S")
                    }
                ]

                for c in customers:
                    cursor.execute("""
                        INSERT INTO merchant_customers 
                        (id, name, email, phone, tier, lifetime_value, orders_count, average_order_value, preferences_json, ai_insights, last_purchase_date, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        c["id"], c["name"], c["email"], c["phone"], c["tier"],
                        c["lifetime_value"], c["orders_count"], c["average_order_value"],
                        json.dumps(c["preferences"]), c["ai_insights"], c["last_purchase_date"],
                        now.strftime("%Y-%m-%d %H:%M:%S")
                    ))

                # Seed Orders
                orders = [
                    {
                        "id": "ord_001",
                        "order_number": "ORD-2026-9810",
                        "customer_id": "cust_01",
                        "customer_name": "Reliance Retail Infra",
                        "customer_email": "procurement@relianceretail.com",
                        "items": [
                            {"sku": "POS-AND-01", "name": "Razorpay Smart POS Terminal Pro V3", "price": 12999.0, "quantity": 4, "subtotal": 51996.0},
                            {"sku": "ACC-POS-01", "name": "High-Grade BPA-Free Thermal Paper Rolls (50-pack)", "price": 1499.0, "quantity": 4, "subtotal": 5996.0}
                        ],
                        "subtotal": 57992.0,
                        "tax": 10438.56,
                        "discount": 5799.20,
                        "total_amount": 62631.36,
                        "status": "PAID",
                        "payment_id": "pay_rzp_98101",
                        "payment_method": "netbanking",
                        "reconciled": 1,
                        "created_at": (now - timedelta(days=2)).strftime("%Y-%m-%d %H:%M:%S")
                    },
                    {
                        "id": "ord_002",
                        "order_number": "ORD-2026-9811",
                        "customer_id": "cust_02",
                        "customer_name": "Tata Consumer Logistics",
                        "customer_email": "finance@tataconsumer.com",
                        "items": [
                            {"sku": "SFT-FIN-01", "name": "RazorRecon FinOps Enterprise Suite (Annual)", "price": 49999.0, "quantity": 1, "subtotal": 49999.0},
                            {"sku": "ACC-FIN-01", "name": "Multi-Channel ERP Connector Pack", "price": 9999.0, "quantity": 1, "subtotal": 9999.0}
                        ],
                        "subtotal": 59998.0,
                        "tax": 10799.64,
                        "discount": 6000.0,
                        "total_amount": 64797.64,
                        "status": "PAID",
                        "payment_id": "pay_rzp_98112",
                        "payment_method": "card",
                        "reconciled": 1,
                        "created_at": (now - timedelta(days=5)).strftime("%Y-%m-%d %H:%M:%S")
                    },
                    {
                        "id": "ord_003",
                        "order_number": "ORD-2026-9812",
                        "customer_id": "cust_03",
                        "customer_name": "Zepto Quick Delivery Hubs",
                        "customer_email": "storeops@zepto.in",
                        "items": [
                            {"sku": "SND-VOX-01", "name": "Razorpay Voice Soundbox Pro 4G", "price": 2499.0, "quantity": 8, "subtotal": 19992.0}
                        ],
                        "subtotal": 19992.0,
                        "tax": 3598.56,
                        "discount": 1999.20,
                        "total_amount": 21591.36,
                        "status": "PAID",
                        "payment_id": "pay_rzp_98123",
                        "payment_method": "upi",
                        "reconciled": 1,
                        "created_at": (now - timedelta(days=9)).strftime("%Y-%m-%d %H:%M:%S")
                    },
                    {
                        "id": "ord_004",
                        "order_number": "ORD-2026-9813",
                        "customer_id": "cust_04",
                        "customer_name": "Kroma Electronics Store #14",
                        "customer_email": "manager.mumbai@kroma.in",
                        "items": [
                            {"sku": "SEC-TOK-01", "name": "YubiKey 5 NFC Hardware Security Key", "price": 4999.0, "quantity": 6, "subtotal": 29994.0}
                        ],
                        "subtotal": 29994.0,
                        "tax": 5398.92,
                        "discount": 0.0,
                        "total_amount": 35392.92,
                        "status": "PENDING",
                        "payment_id": None,
                        "payment_method": "upi",
                        "reconciled": 0,
                        "created_at": (now - timedelta(hours=4)).strftime("%Y-%m-%d %H:%M:%S")
                    },
                    {
                        "id": "ord_005",
                        "order_number": "ORD-2026-9814",
                        "customer_id": "cust_05",
                        "customer_name": "Blinkit Micro-Fulfillment",
                        "customer_email": "infra@blinkit.com",
                        "items": [
                            {"sku": "POS-MIN-02", "name": "Razorpay Micro mPOS Reader", "price": 1999.0, "quantity": 2, "subtotal": 3998.0}
                        ],
                        "subtotal": 3998.0,
                        "tax": 719.64,
                        "discount": 0.0,
                        "total_amount": 4717.64,
                        "status": "CANCELLED",
                        "payment_id": None,
                        "payment_method": "upi",
                        "reconciled": 0,
                        "created_at": (now - timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S")
                    },
                    {
                        "id": "ord_006",
                        "order_number": "ORD-2026-9815",
                        "customer_id": "cust_01",
                        "customer_name": "Reliance Retail Infra",
                        "customer_email": "procurement@relianceretail.com",
                        "items": [
                            {"sku": "POS-AND-01", "name": "Razorpay Smart POS Terminal Pro V3", "price": 12999.0, "quantity": 1, "subtotal": 12999.0}
                        ],
                        "subtotal": 12999.0,
                        "tax": 2339.82,
                        "discount": 0.0,
                        "total_amount": 15338.82,
                        "status": "REFUNDED",
                        "payment_id": "pay_rzp_refund_99",
                        "payment_method": "netbanking",
                        "reconciled": 1,
                        "created_at": (now - timedelta(days=3)).strftime("%Y-%m-%d %H:%M:%S")
                    }
                ]

                for o in orders:
                    cursor.execute("""
                        INSERT INTO merchant_orders
                        (id, order_number, customer_id, customer_name, customer_email, items_json, subtotal, tax, discount, total_amount, currency, status, payment_id, payment_method, reconciled, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        o["id"], o["order_number"], o["customer_id"], o["customer_name"], o["customer_email"],
                        json.dumps(o["items"]), o["subtotal"], o["tax"], o["discount"], o["total_amount"],
                        "INR", o["status"], o["payment_id"], o["payment_method"], o["reconciled"],
                        o["created_at"], o["created_at"]
                    ))

                conn.commit()

    # Dashboard Metrics
    def get_dashboard_metrics(self) -> Dict[str, Any]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            
            # Gross Revenue from PAID orders
            cursor.execute("SELECT COALESCE(SUM(total_amount), 0) as rev FROM merchant_orders WHERE status = 'PAID'")
            revenue = cursor.fetchone()["rev"]

            # Total orders
            cursor.execute("SELECT COUNT(*) as cnt FROM merchant_orders")
            total_orders = cursor.fetchone()["cnt"]

            # Paid orders
            cursor.execute("SELECT COUNT(*) as cnt FROM merchant_orders WHERE status = 'PAID'")
            paid_orders = cursor.fetchone()["cnt"]

            # Total Customers
            cursor.execute("SELECT COUNT(*) as cnt FROM merchant_customers")
            total_customers = cursor.fetchone()["cnt"]

            # Calculate conversion rate & average order value
            conversion_rate = round((paid_orders / total_orders * 100), 1) if total_orders > 0 else 85.0
            aov = round(revenue / paid_orders, 2) if paid_orders > 0 else 0.0

            # Recent Orders
            cursor.execute("SELECT * FROM merchant_orders ORDER BY created_at DESC LIMIT 5")
            recent_orders = []
            for row in cursor.fetchall():
                d = dict(row)
                d["items"] = json.loads(d["items_json"])
                recent_orders.append(d)

            # Revenue trend (simulated 7 days)
            revenue_trend = [
                {"date": "Mon", "revenue": 45000, "orders": 3},
                {"date": "Tue", "revenue": 62000, "orders": 5},
                {"date": "Wed", "revenue": 58000, "orders": 4},
                {"date": "Thu", "revenue": 89000, "orders": 7},
                {"date": "Fri", "revenue": 115000, "orders": 9},
                {"date": "Sat", "revenue": 142000, "orders": 12},
                {"date": "Sun", "revenue": 98000, "orders": 8},
            ]

            return {
                "gross_revenue": revenue,
                "total_orders": total_orders,
                "paid_orders": paid_orders,
                "total_products": 50,
                "conversion_rate_pct": conversion_rate,
                "customer_growth_pct": 18.4,
                "average_order_value": aov,
                "recent_orders": recent_orders,
                "revenue_trend": revenue_trend
            }

    # Orders CRUD
    def get_orders(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            if status and status.upper() != "ALL":
                cursor.execute("SELECT * FROM merchant_orders WHERE status = ? ORDER BY created_at DESC", (status.upper(),))
            else:
                cursor.execute("SELECT * FROM merchant_orders ORDER BY created_at DESC")
            
            orders = []
            for row in cursor.fetchall():
                d = dict(row)
                d["items"] = json.loads(d["items_json"])
                orders.append(d)
            return orders

    def get_order_by_id(self, order_id: str) -> Optional[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM merchant_orders WHERE id = ? OR order_number = ?", (order_id, order_id))
            row = cursor.fetchone()
            if not row:
                return None
            d = dict(row)
            d["items"] = json.loads(d["items_json"])
            return d

    def create_order(self, data: Dict[str, Any]) -> Dict[str, Any]:
        order_id = f"ord_{uuid.uuid4().hex[:8]}"
        order_number = f"ORD-2026-{uuid.uuid4().hex[:4].upper()}"
        now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO merchant_orders
                (id, order_number, customer_id, customer_name, customer_email, items_json, subtotal, tax, discount, total_amount, currency, status, payment_id, payment_method, reconciled, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                order_id, order_number, data.get("customer_id", "cust_guest"),
                data.get("customer_name", "Guest Buyer"), data.get("customer_email", "guest@razorcommerce.ai"),
                json.dumps(data.get("items", [])), data.get("subtotal", 0.0), data.get("tax", 0.0),
                data.get("discount", 0.0), data.get("total_amount", 0.0), "INR",
                data.get("status", "PAID"), data.get("payment_id", f"pay_rzp_{uuid.uuid4().hex[:8]}"),
                data.get("payment_method", "upi"), 1, now, now
            ))
            conn.commit()

        return self.get_order_by_id(order_id)

    # Customers CRUD
    def get_customers(self) -> List[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM merchant_customers ORDER BY lifetime_value DESC")
            customers = []
            for row in cursor.fetchall():
                d = dict(row)
                d["preferences"] = json.loads(d["preferences_json"])
                customers.append(d)
            return customers

    def get_customer_by_id(self, customer_id: str) -> Optional[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM merchant_customers WHERE id = ? OR email = ?", (customer_id, customer_id))
            row = cursor.fetchone()
            if not row:
                return None
            d = dict(row)
            d["preferences"] = json.loads(d["preferences_json"])
            return d

merchant_service = MerchantService()
