import sqlite3
import os
import uuid
import json
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "merchant.db")

DELIVERY_PARTNERS = [
    {
        "id": "partner_delhivery",
        "name": "Delhivery Express",
        "code": "Delhivery",
        "prefix": "DLV",
        "sla": "2-3 business days",
        "rating": 4.8,
        "status": "CONNECTED",
        "tracking_base_url": "https://www.delhivery.com/track/package/"
    },
    {
        "id": "partner_bluedart",
        "name": "Blue Dart Air",
        "code": "Blue Dart",
        "prefix": "BLU",
        "sla": "1-2 business days",
        "rating": 4.9,
        "status": "CONNECTED",
        "tracking_base_url": "https://www.bluedart.com/tracking/"
    },
    {
        "id": "partner_shiprocket",
        "name": "Shiprocket Omnichannel",
        "code": "Shiprocket",
        "prefix": "SRK",
        "sla": "2-4 business days",
        "rating": 4.7,
        "status": "CONNECTED",
        "tracking_base_url": "https://shiprocket.co/tracking/"
    },
    {
        "id": "partner_ekart",
        "name": "Ekart Logistics",
        "code": "Ekart",
        "prefix": "EKT",
        "sla": "2-3 business days",
        "rating": 4.6,
        "status": "CONNECTED",
        "tracking_base_url": "https://ekartlogistics.com/track/"
    }
]

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
            
            cursor.execute("PRAGMA table_info(merchant_orders)")
            cols = [row[1] for row in cursor.fetchall()]
            if cols and "order_status" not in cols:
                cursor.execute("DROP TABLE IF EXISTS merchant_orders")
                cursor.execute("DROP TABLE IF EXISTS merchant_customers")

            # Orders Table (with 7-stage status and courier tracking)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS merchant_orders (
                    id TEXT PRIMARY KEY,
                    order_number TEXT NOT NULL UNIQUE,
                    customer_id TEXT NOT NULL,
                    customer_name TEXT NOT NULL,
                    customer_email TEXT NOT NULL,
                    customer_phone TEXT,
                    shipping_address TEXT,
                    items_json TEXT NOT NULL,
                    subtotal REAL NOT NULL,
                    tax REAL NOT NULL,
                    discount REAL NOT NULL,
                    total_amount REAL NOT NULL,
                    currency TEXT DEFAULT 'INR',
                    payment_status TEXT NOT NULL DEFAULT 'PAID',
                    order_status TEXT NOT NULL DEFAULT 'PENDING_CONFIRMATION',
                    delivery_partner TEXT,
                    tracking_id TEXT,
                    estimated_delivery TEXT,
                    timeline_json TEXT,
                    payment_id TEXT,
                    payment_method TEXT DEFAULT 'upi',
                    reconciled INTEGER DEFAULT 1,
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
                    tier TEXT NOT NULL,
                    lifetime_value REAL NOT NULL,
                    orders_count INTEGER NOT NULL,
                    average_order_value REAL NOT NULL,
                    preferences_json TEXT NOT NULL,
                    ai_insights TEXT NOT NULL,
                    last_purchase_date TEXT,
                    created_at TEXT NOT NULL
                )
            """)

            conn.commit()

    def _seed_data(self):
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) as count FROM merchant_orders")
            if cursor.fetchone()["count"] < 10:
                now = datetime.utcnow()
                
                # 1. Seed 100 Customers (First 5 primary + 95 generated)
                sample_cities = ["Mumbai", "Bengaluru", "Delhi NCR", "Hyderabad", "Chennai", "Pune", "Ahmedabad", "Kolkata"]
                first_names = ["Rajesh", "Pooja", "Vikram", "Anita", "Siddharth", "Meera", "Arjun", "Neha", "Rohit", "Sneha", "Karan", "Divya", "Suresh", "Kavita", "Amit", "Ritu"]
                last_names = ["Sharma", "Verma", "Malhotra", "Desai", "Rao", "Nambiar", "Patel", "Gupta", "Mehta", "Iyer", "Reddy", "Singh", "Joshi", "Bose", "Kulkarni"]
                company_suffixes = ["Retail", "Fintech", "Logistics", "Enterprises", "Solutions", "Technologies", "Mart", "Hub", "Direct"]

                for i in range(1, 101):
                    cust_id = f"cust_{i:03d}"
                    fn = first_names[(i - 1) % len(first_names)]
                    ln = last_names[(i * 3) % len(last_names)]
                    comp = company_suffixes[(i * 2) % len(company_suffixes)]
                    full_name = f"{fn} {ln} ({comp})" if i <= 30 else f"{fn} {ln}"
                    email = f"{fn.lower()}.{ln.lower()}{i}@example.in" if i > 5 else ["procurement@relianceretail.com", "finance@tataconsumer.com", "storeops@zepto.in", "manager.mumbai@kroma.in", "customer@acme.com"][i-1]
                    phone = f"+91 {random.randint(97000, 99999)} {random.randint(10000, 99999)}"
                    tier = "Enterprise Platinum" if i <= 15 else ("Growth Gold" if i <= 50 else "Starter")
                    orders_cnt = random.randint(1, 18)
                    aov = round(random.uniform(8000, 65000), 2)
                    ltv = round(orders_cnt * aov, 2)
                    last_date = (now - timedelta(days=random.randint(1, 45))).strftime("%Y-%m-%d %H:%M:%S")

                    prefs = {
                        "favourite_categories": random.sample(["Payment Terminals", "Soundboxes", "FinOps Software", "Workstations", "Security", "Storage"], 2),
                        "preferred_payment": random.choice(["Razorpay UPI", "NetBanking", "Corporate Card"]),
                        "city": sample_cities[i % len(sample_cities)],
                        "credit_limit": round(ltv * 1.5, 2)
                    }

                    insights = f"Verified enterprise buyer in {prefs['city']}. AI Affinity: High propensity for hardware bundles and extended warranties. Score: {random.randint(85, 99)}%."

                    cursor.execute("""
                        INSERT OR REPLACE INTO merchant_customers 
                        (id, name, email, phone, tier, lifetime_value, orders_count, average_order_value, preferences_json, ai_insights, last_purchase_date, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        cust_id, full_name, email, phone, tier, ltv, orders_cnt, aov,
                        json.dumps(prefs), insights, last_date, now.strftime("%Y-%m-%d %H:%M:%S")
                    ))

                # 2. Seed 200 Orders spanning all 7 statuses
                order_statuses = [
                    "PENDING_CONFIRMATION",
                    "ACCEPTED",
                    "PROCESSING",
                    "PACKED",
                    "SHIPPED",
                    "OUT_FOR_DELIVERY",
                    "DELIVERED",
                    "REJECTED"
                ]

                products_catalog = [
                    {"sku": "RZP-POS-V3-PRO", "name": "Razorpay Smart POS Terminal V3 Pro", "price": 14999.0},
                    {"sku": "RZP-SBOX-4G-PRO", "name": "Razorpay Smart Soundbox 4G Pro", "price": 2499.0},
                    {"sku": "RZP-RECON-ENT-ANNUAL", "name": "RazorRecon Enterprise License", "price": 74999.0},
                    {"sku": "KEYCHRON-Q3-PRO", "name": "Keychron Q3 Pro SE Keyboard", "price": 18499.0},
                    {"sku": "DELL-U4025QW-5K2K", "name": "Dell UltraSharp 40\" Curved 5K2K Display", "price": 139999.0},
                    {"sku": "LOGI-MX-MASTER-3S", "name": "Logitech MX Master 3S Mouse", "price": 9995.0},
                    {"sku": "YUBIKEY-BIO-FIDO2", "name": "Yubico YubiKey Bio FIDO Edition", "price": 8999.0},
                    {"sku": "SYNOLOGY-DS923-PLUS", "name": "Synology DiskStation DS923+ NAS", "price": 58999.0},
                    {"sku": "ZEBRA-DS2208-SCANNER", "name": "Zebra DS2208 2D Barcode Scanner", "price": 6499.0},
                    {"sku": "EPSON-TM-T88VII-PRINTER", "name": "Epson TM-T88VII Thermal Printer", "price": 21999.0}
                ]

                couriers = ["Delhivery", "Blue Dart", "Shiprocket", "Ekart"]

                for i in range(1, 201):
                    order_id = f"ord_{i:04d}"
                    order_num = f"ORD-2026-{1000 + i}"
                    cust_idx = (i % 100) + 1
                    cust_id = f"cust_{cust_idx:03d}"
                    cust_name = f"{first_names[i % len(first_names)]} {last_names[(i * 2) % len(last_names)]}"
                    cust_email = f"buyer{i}@example.in" if i > 5 else ["procurement@relianceretail.com", "finance@tataconsumer.com", "storeops@zepto.in", "manager.mumbai@kroma.in", "customer@acme.com"][i-1]
                    city = sample_cities[i % len(sample_cities)]
                    shipping_addr = f"Unit {random.randint(101, 909)}, Trade Tower, {city}, India - {random.randint(400001, 560100)}"
                    
                    # Status distribution
                    if i <= 15:
                        status = "PENDING_CONFIRMATION"
                    elif i <= 35:
                        status = "ACCEPTED"
                    elif i <= 60:
                        status = "PROCESSING"
                    elif i <= 85:
                        status = "PACKED"
                    elif i <= 125:
                        status = "SHIPPED"
                    elif i <= 155:
                        status = "OUT_FOR_DELIVERY"
                    elif i <= 192:
                        status = "DELIVERED"
                    else:
                        status = "REJECTED"

                    pay_status = "PENDING" if status == "PENDING_CONFIRMATION" and i % 3 == 0 else ("REFUNDED" if status == "REJECTED" else "PAID")
                    
                    # Items
                    prod_sample = random.sample(products_catalog, random.randint(1, 3))
                    items = []
                    subtotal = 0.0
                    for p in prod_sample:
                        qty = random.randint(1, 4)
                        item_sub = p["price"] * qty
                        subtotal += item_sub
                        items.append({
                            "sku": p["sku"],
                            "name": p["name"],
                            "price": p["price"],
                            "quantity": qty,
                            "subtotal": item_sub
                        })

                    discount = round(subtotal * 0.10, 2) if i % 2 == 0 else 0.0
                    tax = round((subtotal - discount) * 0.18, 2)
                    total_amount = round((subtotal - discount) + tax, 2)

                    courier = couriers[i % len(couriers)] if status in ["PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"] else None
                    prefix = "DLV" if courier == "Delhivery" else ("BLU" if courier == "Blue Dart" else ("SRK" if courier == "Shiprocket" else "EKT"))
                    tracking_id = f"{prefix}{800000 + i}" if courier else None
                    est_delivery = (now + timedelta(days=random.randint(1, 3))).strftime("%d %b %Y, 6:00 PM") if status in ["SHIPPED", "OUT_FOR_DELIVERY"] else (now - timedelta(days=random.randint(1, 5))).strftime("%d %b %Y, 3:30 PM")

                    # Generate Timeline
                    order_time = (now - timedelta(days=random.randint(1, 14))).strftime("%Y-%m-%d %H:%M:%S")
                    timeline = [
                        {"status": "Order Placed", "time": order_time, "location": "Online Checkout (Razorpay)", "completed": True},
                    ]
                    if status in ["ACCEPTED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"]:
                        timeline.append({"status": "Order Confirmed", "time": order_time, "location": "Merchant Hub", "completed": True})
                    if status in ["PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"]:
                        timeline.append({"status": "Processing & Inventory Allocated", "time": order_time, "location": "Central Warehouse", "completed": True})
                    if status in ["PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"]:
                        timeline.append({"status": f"Packed & Handed to {courier}", "time": order_time, "location": f"{city} Fulfillment Center", "completed": True})
                    if status in ["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"]:
                        timeline.append({"status": f"In Transit ({tracking_id})", "time": order_time, "location": f"Transit Hub, {city}", "completed": True})
                    if status in ["OUT_FOR_DELIVERY", "DELIVERED"]:
                        timeline.append({"status": "Out for Delivery", "time": order_time, "location": f"Local Delivery Station, {city}", "completed": True})
                    if status == "DELIVERED":
                        timeline.append({"status": "Delivered & Signed", "time": order_time, "location": shipping_addr, "completed": True})

                    cursor.execute("""
                        INSERT OR REPLACE INTO merchant_orders
                        (id, order_number, customer_id, customer_name, customer_email, customer_phone, shipping_address, items_json, subtotal, tax, discount, total_amount, currency, payment_status, order_status, delivery_partner, tracking_id, estimated_delivery, timeline_json, payment_id, payment_method, reconciled, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        order_id, order_num, cust_id, cust_name, cust_email, f"+91 98{random.randint(10000000, 99999999)}",
                        shipping_addr, json.dumps(items), subtotal, tax, discount, total_amount, "INR",
                        pay_status, status, courier, tracking_id, est_delivery, json.dumps(timeline),
                        f"pay_rzp_{uuid.uuid4().hex[:10]}", "upi" if i % 2 == 0 else "card", 1,
                        order_time, order_time
                    ))

                conn.commit()

    # Dashboard Metrics
    def get_dashboard_metrics(self) -> Dict[str, Any]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT COALESCE(SUM(total_amount), 0) as rev FROM merchant_orders WHERE payment_status = 'PAID'")
            revenue = cursor.fetchone()["rev"]

            cursor.execute("SELECT COUNT(*) as cnt FROM merchant_orders")
            total_orders = cursor.fetchone()["cnt"]

            cursor.execute("SELECT COUNT(*) as cnt FROM merchant_orders WHERE payment_status = 'PAID'")
            paid_orders = cursor.fetchone()["cnt"]

            cursor.execute("SELECT COUNT(*) as cnt FROM merchant_orders WHERE order_status = 'PENDING_CONFIRMATION'")
            pending_orders = cursor.fetchone()["cnt"]

            cursor.execute("SELECT COUNT(*) as cnt FROM merchant_orders WHERE order_status IN ('PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY')")
            active_shipments = cursor.fetchone()["cnt"]

            cursor.execute("SELECT COUNT(*) as cnt FROM merchant_customers")
            total_customers = cursor.fetchone()["cnt"]

            conversion_rate = round((paid_orders / max(1, total_orders) * 100), 1)
            aov = round(revenue / max(1, paid_orders), 2)

            cursor.execute("SELECT * FROM merchant_orders ORDER BY created_at DESC LIMIT 6")
            recent_orders = []
            for row in cursor.fetchall():
                d = dict(row)
                d["items"] = json.loads(d["items_json"]) if d["items_json"] else []
                d["timeline"] = json.loads(d["timeline_json"]) if d["timeline_json"] else []
                recent_orders.append(d)

            revenue_trend = [
                {"date": "Mon", "revenue": 145000, "orders": 14},
                {"date": "Tue", "revenue": 182000, "orders": 19},
                {"date": "Wed", "revenue": 158000, "orders": 16},
                {"date": "Thu", "revenue": 219000, "orders": 24},
                {"date": "Fri", "revenue": 285000, "orders": 31},
                {"date": "Sat", "revenue": 342000, "orders": 38},
                {"date": "Sun", "revenue": 298000, "orders": 29},
            ]

            return {
                "gross_revenue": revenue,
                "total_orders": total_orders,
                "paid_orders": paid_orders,
                "pending_orders": pending_orders,
                "active_shipments": active_shipments,
                "total_customers": total_customers,
                "total_products": 50,
                "conversion_rate_pct": conversion_rate,
                "customer_growth_pct": 24.8,
                "average_order_value": aov,
                "recent_orders": recent_orders,
                "revenue_trend": revenue_trend
            }

    # Orders Retrieval & Filters
    def get_orders(self, status: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            query = "SELECT * FROM merchant_orders"
            params = []
            where_clauses = []

            if status and status.upper() != "ALL":
                where_clauses.append("order_status = ?")
                params.append(status.upper())

            if search and search.strip():
                where_clauses.append("(order_number LIKE ? OR customer_name LIKE ? OR customer_email LIKE ? OR tracking_id LIKE ?)")
                q = f"%{search.strip()}%"
                params.extend([q, q, q, q])

            if where_clauses:
                query += " WHERE " + " AND ".join(where_clauses)

            query += " ORDER BY created_at DESC"
            cursor.execute(query, tuple(params))
            
            orders = []
            for row in cursor.fetchall():
                d = dict(row)
                d["items"] = json.loads(d["items_json"]) if d["items_json"] else []
                d["timeline"] = json.loads(d["timeline_json"]) if d["timeline_json"] else []
                orders.append(d)
            return orders

    def get_order_by_id(self, order_id: str) -> Optional[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM merchant_orders WHERE id = ? OR order_number = ? OR tracking_id = ?", (order_id, order_id, order_id))
            row = cursor.fetchone()
            if not row:
                return None
            d = dict(row)
            d["items"] = json.loads(d["items_json"]) if d["items_json"] else []
            d["timeline"] = json.loads(d["timeline_json"]) if d["timeline_json"] else []
            return d

    # 7-Stage Workflow Actions
    def accept_order(self, order_id: str) -> Optional[Dict[str, Any]]:
        order = self.get_order_by_id(order_id)
        if not order:
            return None
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        timeline = order.get("timeline", [])
        timeline.append({"status": "Order Confirmed by Merchant", "time": now_str, "location": "Merchant Hub", "completed": True})

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE merchant_orders SET
                    order_status = 'ACCEPTED',
                    timeline_json = ?,
                    updated_at = ?
                WHERE id = ? OR order_number = ?
            """, (json.dumps(timeline), now_str, order_id, order_id))
            conn.commit()

        return self.get_order_by_id(order_id)

    def reject_order(self, order_id: str, reason: str = "Out of Stock / Policy Rejection") -> Optional[Dict[str, Any]]:
        order = self.get_order_by_id(order_id)
        if not order:
            return None
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        timeline = order.get("timeline", [])
        timeline.append({"status": f"Order Rejected ({reason})", "time": now_str, "location": "Merchant Hub", "completed": False})

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE merchant_orders SET
                    order_status = 'REJECTED',
                    payment_status = 'REFUNDED',
                    timeline_json = ?,
                    updated_at = ?
                WHERE id = ? OR order_number = ?
            """, (json.dumps(timeline), now_str, order_id, order_id))
            conn.commit()

        return self.get_order_by_id(order_id)

    def pack_order(self, order_id: str) -> Optional[Dict[str, Any]]:
        order = self.get_order_by_id(order_id)
        if not order:
            return None
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        timeline = order.get("timeline", [])
        timeline.append({"status": "Order Packed & Ready for Courier Dispatch", "time": now_str, "location": "Fulfillment Warehouse", "completed": True})

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE merchant_orders SET
                    order_status = 'PACKED',
                    timeline_json = ?,
                    updated_at = ?
                WHERE id = ? OR order_number = ?
            """, (json.dumps(timeline), now_str, order_id, order_id))
            conn.commit()

        return self.get_order_by_id(order_id)

    def assign_courier(self, order_id: str, courier_name: str) -> Optional[Dict[str, Any]]:
        order = self.get_order_by_id(order_id)
        if not order:
            return None
        now = datetime.utcnow()
        now_str = now.strftime("%Y-%m-%d %H:%M:%S")
        
        partner = next((p for p in DELIVERY_PARTNERS if p["code"].lower() == courier_name.lower() or p["name"].lower() == courier_name.lower()), DELIVERY_PARTNERS[0])
        tracking_id = f"{partner['prefix']}{random.randint(100000, 999999)}"
        est_delivery = (now + timedelta(days=2)).strftime("%d %b %Y, 6:00 PM")

        timeline = order.get("timeline", [])
        timeline.append({"status": f"Courier Assigned: {partner['name']} (AWB: {tracking_id})", "time": now_str, "location": "Logistics Dispatch Desk", "completed": True})

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE merchant_orders SET
                    delivery_partner = ?,
                    tracking_id = ?,
                    estimated_delivery = ?,
                    order_status = 'SHIPPED',
                    timeline_json = ?,
                    updated_at = ?
                WHERE id = ? OR order_number = ?
            """, (partner["code"], tracking_id, est_delivery, json.dumps(timeline), now_str, order_id, order_id))
            conn.commit()

        return self.get_order_by_id(order_id)

    def ship_order(self, order_id: str, courier: Optional[str] = None, tracking_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        if courier:
            return self.assign_courier(order_id, courier)
        return self.assign_courier(order_id, "Delhivery")

    def update_order_status(self, order_id: str, new_status: str, notes: Optional[str] = None) -> Optional[Dict[str, Any]]:
        order = self.get_order_by_id(order_id)
        if not order:
            return None
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        timeline = order.get("timeline", [])
        location = notes or "Hub Checkpoint"
        timeline.append({"status": new_status.replace("_", " ").title(), "time": now_str, "location": location, "completed": True})

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE merchant_orders SET
                    order_status = ?,
                    timeline_json = ?,
                    updated_at = ?
                WHERE id = ? OR order_number = ?
            """, (new_status.upper(), json.dumps(timeline), now_str, order_id, order_id))
            conn.commit()

        return self.get_order_by_id(order_id)

    def get_delivery_partners(self) -> List[Dict[str, Any]]:
        return DELIVERY_PARTNERS

    def get_shipments(self) -> List[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM merchant_orders 
                WHERE delivery_partner IS NOT NULL AND order_status IN ('PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED')
                ORDER BY updated_at DESC
            """)
            shipments = []
            for row in cursor.fetchall():
                d = dict(row)
                d["items"] = json.loads(d["items_json"]) if d["items_json"] else []
                d["timeline"] = json.loads(d["timeline_json"]) if d["timeline_json"] else []
                shipments.append(d)
            return shipments

    # Customers Retrieval
    def get_customers(self) -> List[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM merchant_customers ORDER BY lifetime_value DESC")
            customers = []
            for row in cursor.fetchall():
                d = dict(row)
                d["preferences"] = json.loads(d["preferences_json"]) if d["preferences_json"] else {}
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
            d["preferences"] = json.loads(d["preferences_json"]) if d["preferences_json"] else {}
            return d

merchant_service = MerchantService()
