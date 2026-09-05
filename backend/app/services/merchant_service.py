import sqlite3
import os
import uuid
import json
import random
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional

from app.core.timestamps import utcnow_iso, format_iso, parse_iso
from app.services.audit_service import audit_service

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "merchant.db")

DELIVERY_PARTNERS = [
    {
        "id": "partner_delhivery",
        "name": "Delhivery Express",
        "code": "Delhivery",
        "prefix": "DLV",
        "sla": "1-2 business days",
        "rating": 4.8,
        "status": "CONNECTED",
        "tracking_base_url": "https://www.delhivery.com/track/package/"
    },
    {
        "id": "partner_bluedart",
        "name": "BlueDart Express",
        "code": "BlueDart",
        "prefix": "BLU",
        "sla": "Next Day Air",
        "rating": 4.9,
        "status": "CONNECTED",
        "tracking_base_url": "https://www.bluedart.com/tracking/"
    },
    {
        "id": "partner_xpressbees",
        "name": "XpressBees Logistics",
        "code": "XpressBees",
        "prefix": "XPB",
        "sla": "2-3 business days",
        "rating": 4.7,
        "status": "CONNECTED",
        "tracking_base_url": "https://www.xpressbees.com/track/"
    },
    {
        "id": "partner_ekart",
        "name": "Ekart Logistics",
        "code": "Ekart",
        "prefix": "EKT",
        "sla": "1-2 business days",
        "rating": 4.8,
        "status": "CONNECTED",
        "tracking_base_url": "https://ekartlogistics.com/track/"
    },
    {
        "id": "partner_shadowfax",
        "name": "Shadowfax Express",
        "code": "Shadowfax",
        "prefix": "SFX",
        "sla": "Same Day / Next Day",
        "rating": 4.6,
        "status": "CONNECTED",
        "tracking_base_url": "https://www.shadowfax.in/tracker/"
    }
]

LOCATIONS_BY_CITY = {
    "Bengaluru": ["Central Warehouse Dispatch, Electronic City", "BOM-BLR Sorting Hub", "Koramangala Last-Mile Hub", "Customer Address"],
    "Mumbai": ["Bhiwandi Fulfillment Center", "Mumbai Air Cargo Terminal (BOM)", "Andheri West Delivery Facility", "Customer Address"],
    "Delhi NCR": ["Gurugram Megahub Sort Center", "IGI Cargo Transit Center", "Connaught Place Delivery Hub", "Customer Address"],
    "Hyderabad": ["Shamshabad Logistics Park", "Hyderabad Central Hub", "Hitec City Delivery Station", "Customer Address"],
    "Chennai": ["Sriperumbudur Warehouse", "Chennai Air Freight Station", "T. Nagar Delivery Hub", "Customer Address"],
    "Pune": ["Chakan Fulfillment Center", "Pune Transit Terminal", "Baner Local Depot", "Customer Address"],
    "Ahmedabad": ["Sanand Sorting Depot", "Ahmedabad Transshipment Hub", "Navrangpura Local Delivery", "Customer Address"],
    "Kolkata": ["Dankuni Logistics Center", "CCU Air Hub", "Salt Lake Delivery Center", "Customer Address"]
}

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
            if cols and ("order_placed_at" not in cols or "courier_assigned_at" not in cols):
                cursor.execute("DROP TABLE IF EXISTS merchant_orders")
                cursor.execute("DROP TABLE IF EXISTS merchant_customers")

            # Ensure invoice_number column exists if upgrading
            cursor.execute("PRAGMA table_info(merchant_orders)")
            cols = [row[1] for row in cursor.fetchall()]
            if cols and "invoice_number" not in cols:
                try:
                    cursor.execute("ALTER TABLE merchant_orders ADD COLUMN invoice_number TEXT")
                except Exception:
                    pass

            # Ensure merchant_id column exists if upgrading
            if cols and "merchant_id" not in cols:
                try:
                    cursor.execute("ALTER TABLE merchant_orders ADD COLUMN merchant_id TEXT DEFAULT 'rzp_live_acme_8842'")
                    cursor.execute("UPDATE merchant_orders SET merchant_id = 'rzp_live_acme_8842' WHERE merchant_id IS NULL OR merchant_id = ''")
                except Exception:
                    pass

            # Ensure merchant_id column exists on merchant_customers
            cursor.execute("PRAGMA table_info(merchant_customers)")
            cust_cols = [row[1] for row in cursor.fetchall()]
            if cust_cols and "merchant_id" not in cust_cols:
                try:
                    cursor.execute("ALTER TABLE merchant_customers ADD COLUMN merchant_id TEXT DEFAULT 'rzp_live_acme_8842'")
                    cursor.execute("UPDATE merchant_customers SET merchant_id = 'rzp_live_acme_8842' WHERE merchant_id IS NULL OR merchant_id = ''")
                except Exception:
                    pass

            # Orders Table with full 13 lifecycle timestamps
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS merchant_orders (
                    id TEXT PRIMARY KEY,
                    merchant_id TEXT NOT NULL DEFAULT 'rzp_live_acme_8842',
                    order_number TEXT NOT NULL UNIQUE,
                    customer_id TEXT NOT NULL,
                    customer_name TEXT NOT NULL,
                    customer_email TEXT NOT NULL,
                    customer_phone TEXT,
                    shipping_address TEXT,
                    shipping_address_id TEXT,
                    billing_address_id TEXT,
                    items_json TEXT NOT NULL,
                    subtotal REAL NOT NULL,
                    tax REAL NOT NULL,
                    discount REAL NOT NULL,
                    total_amount REAL NOT NULL,
                    currency TEXT DEFAULT 'INR',
                    payment_status TEXT NOT NULL DEFAULT 'PAID',
                    order_status TEXT NOT NULL DEFAULT 'PAYMENT_RECEIVED',
                    delivery_partner TEXT,
                    awb_number TEXT,
                    tracking_id TEXT,
                    current_location TEXT,
                    estimated_delivery TEXT,
                    timeline_json TEXT,
                    payment_id TEXT,
                    payment_method TEXT DEFAULT 'upi',
                    reconciled INTEGER DEFAULT 1,
                    invoice_number TEXT,
                    order_placed_at TEXT,
                    payment_initiated_at TEXT,
                    payment_completed_at TEXT,
                    merchant_accepted_at TEXT,
                    merchant_rejected_at TEXT,
                    packed_at TEXT,
                    ready_for_pickup_at TEXT,
                    courier_assigned_at TEXT,
                    shipped_at TEXT,
                    out_for_delivery_at TEXT,
                    delivered_at TEXT,
                    cancelled_at TEXT,
                    refunded_at TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """)

            # Customers Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS merchant_customers (
                    id TEXT PRIMARY KEY,
                    merchant_id TEXT NOT NULL DEFAULT 'rzp_live_acme_8842',
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
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """)

            # Ensure address columns exist on merchant_orders
            cursor.execute("PRAGMA table_info(merchant_orders)")
            order_cols = [c["name"] for c in cursor.fetchall()]
            if "shipping_address_id" not in order_cols:
                try:
                    cursor.execute("ALTER TABLE merchant_orders ADD COLUMN shipping_address_id TEXT")
                except Exception:
                    pass
            if "billing_address_id" not in order_cols:
                try:
                    cursor.execute("ALTER TABLE merchant_orders ADD COLUMN billing_address_id TEXT")
                except Exception:
                    pass

            conn.commit()

    def _seed_data(self):
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) as count FROM merchant_orders")
            if cursor.fetchone()["count"] < 10:
                now_utc = datetime.now(timezone.utc)
                
                # 1. Seed 100 Customers
                sample_cities = ["Bengaluru", "Mumbai", "Delhi NCR", "Hyderabad", "Chennai", "Pune", "Ahmedabad", "Kolkata"]
                first_names = ["Rajesh", "Pooja", "Vikram", "Anita", "Siddharth", "Meera", "Arjun", "Neha", "Rohit", "Sneha", "Karan", "Divya", "Suresh", "Kavita", "Amit", "Ritu"]
                last_names = ["Sharma", "Verma", "Malhotra", "Desai", "Rao", "Nambiar", "Patel", "Gupta", "Mehta", "Iyer", "Reddy", "Singh", "Joshi", "Bose", "Kulkarni"]
                company_suffixes = ["Retail", "Fintech", "Logistics", "Enterprises", "Solutions", "Technologies", "Mart", "Hub", "Direct"]

                for i in range(1, 101):
                    cust_id = f"cust_{i:03d}"
                    fn = first_names[i % len(first_names)]
                    ln = last_names[i % len(last_names)]
                    comp = company_suffixes[i % len(company_suffixes)]
                    name = f"{fn} {ln} ({comp})" if i % 3 == 0 else f"{fn} {ln}"
                    email = f"{fn.lower()}.{ln.lower()}{i}@example.com"
                    phone = f"+91 98{random.randint(10000000, 99999999)}"
                    tier = "PLATINUM" if i % 10 == 0 else ("GOLD" if i % 4 == 0 else "SILVER")
                    ltv = round(random.uniform(25000, 480000), 2)
                    orders_count = random.randint(3, 42)
                    aov = round(ltv / max(1, orders_count), 2)
                    city = sample_cities[i % len(sample_cities)]

                    prefs = {
                        "favourite_categories": ["Electronics", "Enterprise Software"] if i % 2 == 0 else ["Consumer Goods", "Audio & Wearables"],
                        "preferred_payment": "UPI" if i % 2 == 0 else "Corporate Card",
                        "city": city,
                        "buying_frequency": "Weekly" if tier == "PLATINUM" else "Monthly",
                        "credit_limit": 500000 if tier == "PLATINUM" else 150000
                    }
                    insights = f"Customer has high affinity for {prefs['favourite_categories'][0]}. SLA adherence sensitivity is High."
                    c_created = (now_utc - timedelta(days=random.randint(60, 365))).strftime("%Y-%m-%dT%H:%M:%SZ")

                    cursor.execute("""
                        INSERT OR REPLACE INTO merchant_customers 
                        (id, name, email, phone, tier, lifetime_value, orders_count, average_order_value, preferences_json, ai_insights, last_purchase_date, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        cust_id, name, email, phone, tier, ltv, orders_count, aov,
                        json.dumps(prefs), insights,
                        (now_utc - timedelta(days=random.randint(1, 20))).strftime("%Y-%m-%d"),
                        c_created, c_created
                    ))

                # 2. Seed 100 Orders across realistic e-commerce lifecycle states
                STATUS_POOL = [
                    ("PAYMENT_RECEIVED", 12),
                    ("ACCEPTED", 14),
                    ("PICKING", 12),
                    ("PACKED", 14),
                    ("READY_FOR_PICKUP", 16),
                    ("PICKED_UP_BY_COURIER", 10),
                    ("IN_TRANSIT", 12),
                    ("OUT_FOR_DELIVERY", 6),
                    ("DELIVERED", 4)
                ]
                
                status_list = []
                for st, cnt in STATUS_POOL:
                    status_list.extend([st] * cnt)
                random.shuffle(status_list)

                catalog_items = [
                    {"sku": "SKU-AURORA-15", "name": "Aurora 15 Enterprise AI Laptop", "price": 145000},
                    {"sku": "SKU-TITAN-KEY", "name": "Titan Mechanical Studio Keyboard", "price": 12500},
                    {"sku": "SKU-ZENITH-4K", "name": "Zenith Ultra HD 4K Monitor 32-inch", "price": 48900},
                    {"sku": "SKU-NEXUS-POD", "name": "Nexus Pro ANC Wireless Earbuds", "price": 14900},
                    {"sku": "SKU-MATRIX-DOK", "name": "Matrix 14-in-1 Thunderbolt 4 Dock", "price": 19500},
                    {"sku": "SKU-APEX-MOUSE", "name": "Apex Ergonomic Wireless Master Mouse", "price": 8400},
                    {"sku": "SKU-VOLT-CHG", "name": "VoltPower 140W GaN Fast Charger", "price": 4500},
                    {"sku": "SKU-SHIELD-BAG", "name": "ShieldTech Waterproof Laptop Backpack", "price": 5900}
                ]

                for i in range(1, 101):
                    order_id = f"ord_{i:03d}"
                    order_num = f"RZP-ORD-{20260000 + i}"
                    cust_idx = (i - 1) % 100 + 1
                    cust_id = f"cust_{cust_idx:03d}"
                    fn = first_names[cust_idx % len(first_names)]
                    ln = last_names[cust_idx % len(last_names)]
                    cust_name = f"{fn} {ln}"
                    cust_email = f"{fn.lower()}.{ln.lower()}{cust_idx}@example.com"
                    city = sample_cities[i % len(sample_cities)]
                    shipping_addr = f"Plot #{random.randint(12, 940)}, Sector {random.randint(1, 45)}, {city}, India"

                    num_items = random.randint(1, 3)
                    selected_sample = random.sample(catalog_items, num_items)
                    items = []
                    subtotal = 0
                    for item in selected_sample:
                        qty = random.randint(1, 3)
                        line_total = item["price"] * qty
                        subtotal += line_total
                        items.append({
                            "sku": item["sku"],
                            "name": item["name"],
                            "price": item["price"],
                            "quantity": qty,
                            "subtotal": line_total
                        })

                    tax = round(subtotal * 0.18, 2)
                    discount = round(subtotal * 0.05, 2) if i % 3 == 0 else 0
                    total_amount = round(subtotal + tax - discount, 2)

                    status = status_list[i - 1]
                    pay_status = "PAID"

                    # Calculate exact sequential milestones
                    base_order_dt = now_utc - timedelta(days=random.randint(1, 8), hours=random.randint(1, 23), minutes=random.randint(5, 50))
                    
                    order_placed_at = base_order_dt.strftime("%Y-%m-%dT%H:%M:%SZ")
                    payment_initiated_at = base_order_dt.strftime("%Y-%m-%dT%H:%M:%SZ")
                    payment_completed_at = (base_order_dt + timedelta(seconds=14)).strftime("%Y-%m-%dT%H:%M:%SZ")
                    
                    merchant_accepted_at = None
                    merchant_rejected_at = None
                    packed_at = None
                    ready_for_pickup_at = None
                    courier_assigned_at = None
                    shipped_at = None
                    out_for_delivery_at = None
                    delivered_at = None
                    cancelled_at = None
                    refunded_at = None

                    if status in ["ACCEPTED", "PICKING", "PACKED", "READY_FOR_PICKUP", "PICKED_UP_BY_COURIER", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"]:
                        merchant_accepted_at = (base_order_dt + timedelta(minutes=15)).strftime("%Y-%m-%dT%H:%M:%SZ")
                    
                    if status in ["PACKED", "READY_FOR_PICKUP", "PICKED_UP_BY_COURIER", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"]:
                        packed_at = (base_order_dt + timedelta(minutes=45)).strftime("%Y-%m-%dT%H:%M:%SZ")
                    
                    if status in ["READY_FOR_PICKUP", "PICKED_UP_BY_COURIER", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"]:
                        ready_for_pickup_at = (base_order_dt + timedelta(hours=1, minutes=10)).strftime("%Y-%m-%dT%H:%M:%SZ")
                    
                    courier = None
                    awb_num = None
                    tracking_id = None
                    curr_loc = "Merchant Central Warehouse"
                    est_delivery = None

                    if status in ["PICKED_UP_BY_COURIER", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"]:
                        partner = DELIVERY_PARTNERS[i % len(DELIVERY_PARTNERS)]
                        courier = partner["name"]
                        awb_num = f"AWB-{partner['prefix']}-{random.randint(1000000, 9999999)}"
                        tracking_id = f"{partner['prefix']}{random.randint(100000, 999999)}"
                        est_delivery = (base_order_dt + timedelta(days=2)).strftime("%d %b %Y, 6:00 PM")
                        courier_assigned_at = (base_order_dt + timedelta(hours=2)).strftime("%Y-%m-%dT%H:%M:%SZ")
                        
                        city_locs = LOCATIONS_BY_CITY.get(city, LOCATIONS_BY_CITY["Bengaluru"])
                        if status == "PICKED_UP_BY_COURIER":
                            curr_loc = city_locs[0]
                        elif status == "IN_TRANSIT":
                            curr_loc = city_locs[1]
                            shipped_at = (base_order_dt + timedelta(hours=3, minutes=30)).strftime("%Y-%m-%dT%H:%M:%SZ")
                        elif status == "OUT_FOR_DELIVERY":
                            curr_loc = city_locs[2]
                            shipped_at = (base_order_dt + timedelta(hours=3, minutes=30)).strftime("%Y-%m-%dT%H:%M:%SZ")
                            out_for_delivery_at = (base_order_dt + timedelta(hours=18)).strftime("%Y-%m-%dT%H:%M:%SZ")
                        elif status == "DELIVERED":
                            curr_loc = shipping_addr
                            shipped_at = (base_order_dt + timedelta(hours=3, minutes=30)).strftime("%Y-%m-%dT%H:%M:%SZ")
                            out_for_delivery_at = (base_order_dt + timedelta(hours=18)).strftime("%Y-%m-%dT%H:%M:%SZ")
                            delivered_at = (base_order_dt + timedelta(hours=22, minutes=45)).strftime("%Y-%m-%dT%H:%M:%SZ")

                    # Generate Full Timeline Array
                    timeline = [
                        {"status": "Order Placed", "time": order_placed_at, "location": "RazorCommerce Online Store", "completed": True},
                        {"status": "Payment Completed", "time": payment_completed_at, "location": "Razorpay Payment Gateway", "completed": True},
                    ]
                    if merchant_accepted_at:
                        timeline.append({"status": "Merchant Accepted", "time": merchant_accepted_at, "location": "Merchant Operations Hub", "completed": True})
                    if packed_at:
                        timeline.append({"status": "Packed", "time": packed_at, "location": "Packaging & Quality Station", "completed": True})
                    if ready_for_pickup_at:
                        timeline.append({"status": "Ready for Pickup", "time": ready_for_pickup_at, "location": "Outbound Dispatch Bay #3", "completed": True})
                    if courier_assigned_at:
                        timeline.append({"status": f"Courier Assigned ({courier})", "time": courier_assigned_at, "location": f"{city} Dispatch Hub", "completed": True})
                    if shipped_at:
                        timeline.append({"status": "Shipped", "time": shipped_at, "location": curr_loc, "completed": True})
                    if out_for_delivery_at:
                        timeline.append({"status": "Out For Delivery", "time": out_for_delivery_at, "location": f"Last-Mile Facility, {city}", "completed": True})
                    if delivered_at:
                        timeline.append({"status": "Delivered", "time": delivered_at, "location": shipping_addr, "completed": True})

                    cursor.execute("""
                        INSERT OR REPLACE INTO merchant_orders
                        (id, order_number, customer_id, customer_name, customer_email, customer_phone, shipping_address, items_json, subtotal, tax, discount, total_amount, currency, payment_status, order_status, delivery_partner, awb_number, tracking_id, current_location, estimated_delivery, timeline_json, payment_id, payment_method, reconciled, order_placed_at, payment_initiated_at, payment_completed_at, merchant_accepted_at, merchant_rejected_at, packed_at, ready_for_pickup_at, courier_assigned_at, shipped_at, out_for_delivery_at, delivered_at, cancelled_at, refunded_at, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        order_id, order_num, cust_id, cust_name, cust_email, f"+91 98{random.randint(10000000, 99999999)}",
                        shipping_addr, json.dumps(items), subtotal, tax, discount, total_amount, "INR",
                        pay_status, status, courier, awb_num, tracking_id, curr_loc, est_delivery, json.dumps(timeline),
                        f"pay_rzp_{uuid.uuid4().hex[:10]}", "upi" if i % 2 == 0 else "card", 1,
                        order_placed_at, payment_initiated_at, payment_completed_at, merchant_accepted_at, merchant_rejected_at,
                        packed_at, ready_for_pickup_at, courier_assigned_at, shipped_at, out_for_delivery_at, delivered_at,
                        cancelled_at, refunded_at, order_placed_at, order_placed_at
                    ))

                conn.commit()

    # Dashboard Metrics
    def get_dashboard_metrics(self, merchant_id: Optional[str] = None, is_demo: bool = False) -> Dict[str, Any]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            
            where_clause = " WHERE merchant_id = ?" if merchant_id else ""
            where_paid = " WHERE payment_status = 'PAID' AND merchant_id = ?" if merchant_id else " WHERE payment_status = 'PAID'"
            params = (merchant_id,) if merchant_id else ()

            cursor.execute(f"SELECT COALESCE(SUM(total_amount), 0) as rev FROM merchant_orders{where_paid}", params)
            revenue = cursor.fetchone()["rev"]

            cursor.execute(f"SELECT COUNT(*) as cnt FROM merchant_orders{where_clause}", params)
            total_orders = cursor.fetchone()["cnt"]

            cursor.execute(f"SELECT COUNT(*) as cnt FROM merchant_orders{where_paid}", params)
            paid_orders = cursor.fetchone()["cnt"]

            pending_where = " WHERE order_status IN ('PAYMENT_RECEIVED', 'PENDING_CONFIRMATION') AND merchant_id = ?" if merchant_id else " WHERE order_status IN ('PAYMENT_RECEIVED', 'PENDING_CONFIRMATION')"
            cursor.execute(f"SELECT COUNT(*) as cnt FROM merchant_orders{pending_where}", params)
            pending_orders = cursor.fetchone()["cnt"]

            ready_where = " WHERE order_status = 'READY_FOR_PICKUP' AND merchant_id = ?" if merchant_id else " WHERE order_status = 'READY_FOR_PICKUP'"
            cursor.execute(f"SELECT COUNT(*) as cnt FROM merchant_orders{ready_where}", params)
            ready_for_pickup = cursor.fetchone()["cnt"]

            active_where = " WHERE order_status IN ('PICKED_UP_BY_COURIER', 'IN_TRANSIT', 'OUT_FOR_DELIVERY') AND merchant_id = ?" if merchant_id else " WHERE order_status IN ('PICKED_UP_BY_COURIER', 'IN_TRANSIT', 'OUT_FOR_DELIVERY')"
            cursor.execute(f"SELECT COUNT(*) as cnt FROM merchant_orders{active_where}", params)
            active_shipments = cursor.fetchone()["cnt"]

            cust_where = " WHERE merchant_id = ?" if merchant_id else ""
            cursor.execute(f"SELECT COUNT(*) as cnt FROM merchant_customers{cust_where}", params)
            total_customers = cursor.fetchone()["cnt"]

            # Query isolated product count for this merchant
            try:
                from app.services.catalog_service import catalog_service
                stats = catalog_service.get_catalog_stats(merchant_id=merchant_id)
                total_products = stats.total_products
            except Exception:
                total_products = 50 if is_demo else 0

            conversion_rate = round((paid_orders / max(1, total_orders) * 100), 1) if total_orders > 0 else 0.0
            aov = round(revenue / max(1, paid_orders), 2) if paid_orders > 0 else 0.0

            cursor.execute(f"SELECT * FROM merchant_orders{where_clause} ORDER BY created_at DESC LIMIT 6", params)
            recent_orders = []
            for row in cursor.fetchall():
                d = dict(row)
                d["items"] = json.loads(d["items_json"]) if d["items_json"] else []
                d["timeline"] = json.loads(d["timeline_json"]) if d["timeline_json"] else []
                recent_orders.append(d)

            if total_orders == 0 and not is_demo:
                revenue_trend = []
                customer_growth_pct = 0.0
            else:
                now_dt = datetime.now(timezone.utc)
                trend_map = {}
                days_list = []
                for d in range(6, -1, -1):
                    day_dt = now_dt - timedelta(days=d)
                    date_str = day_dt.strftime("%Y-%m-%d")
                    day_name = day_dt.strftime("%a")
                    days_list.append((date_str, day_name))
                    trend_map[date_str] = {"date": day_name, "revenue": 0.0, "orders": 0}

                trend_where = " WHERE (UPPER(payment_status) = 'PAID' OR order_status IN ('PAID', 'DELIVERED', 'COMPLETED', 'SHIPPED', 'PACKED', 'ACCEPTED'))"
                trend_params = []
                if merchant_id:
                    trend_where += " AND merchant_id = ?"
                    trend_params.append(merchant_id)

                cursor.execute(f"SELECT substr(created_at, 1, 10) as o_date, COALESCE(SUM(total_amount), 0) as rev, COUNT(*) as cnt FROM merchant_orders{trend_where} GROUP BY substr(created_at, 1, 10)", trend_params)
                for r in cursor.fetchall():
                    od = r["o_date"]
                    if od in trend_map:
                        trend_map[od]["revenue"] = round(float(r["rev"]), 2)
                        trend_map[od]["orders"] = int(r["cnt"])

                revenue_trend = [trend_map[ds] for ds, _ in days_list]
                customer_growth_pct = round(min(100.0, (total_customers / max(1, total_customers + 5)) * 100), 1) if total_customers > 0 else 0.0

            return {
                "gross_revenue": revenue,
                "total_orders": total_orders,
                "paid_orders": paid_orders,
                "pending_orders": pending_orders,
                "ready_for_pickup": ready_for_pickup,
                "active_shipments": active_shipments,
                "total_customers": total_customers,
                "total_products": total_products,
                "conversion_rate_pct": conversion_rate,
                "customer_growth_pct": customer_growth_pct,
                "average_order_value": aov,
                "recent_orders": recent_orders,
                "revenue_trend": revenue_trend,
                "last_updated": utcnow_iso()
            }

    # Order Creation
    def create_order(
        self,
        order_id: str,
        customer_name: Optional[str] = None,
        customer_email: Optional[str] = None,
        customer_phone: Optional[str] = None,
        shipping_address: Optional[str] = None,
        items: Optional[List[Dict[str, Any]]] = None,
        gross_amount: float = 0.0,
        subtotal: Optional[float] = None,
        tax: Optional[float] = None,
        discount: Optional[float] = None,
        payment_id: Optional[str] = None,
        payment_method: str = "upi",
        merchant_id: str = "rzp_live_acme_8842",
        is_ai_order: bool = False,
        order_channel: str = "web",
        campaign_id: Optional[str] = None,
        shipping_address_id: Optional[str] = None,
        billing_address_id: Optional[str] = None
    ) -> Dict[str, Any]:
        existing = self.get_order_by_id(order_id)
        if existing:
            return existing

        now_str = utcnow_iso()
        order_num = f"RZP-ORD-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4].upper()}"

        c_email = (customer_email or "customer@enterprise.in").strip().lower()
        c_name = (customer_name or "Valued Customer").strip()
        c_phone = customer_phone or "+91 98765 43210"

        with self._get_conn() as conn:
            cursor = conn.cursor()
            
            # 1. Customer Association
            cursor.execute("SELECT * FROM merchant_customers WHERE LOWER(email) = ? AND merchant_id = ?", (c_email, merchant_id))
            cust_row = cursor.fetchone()
            
            if cust_row:
                cust_id = cust_row["id"]
                c_name = customer_name or cust_row["name"]
                c_phone = customer_phone or cust_row["phone"] or c_phone
                cursor.execute("""
                    UPDATE merchant_customers SET
                        orders_count = orders_count + 1,
                        lifetime_value = lifetime_value + ?,
                        average_order_value = round((lifetime_value + ?) / (orders_count + 1), 2),
                        last_purchase_date = ?,
                        updated_at = ?
                    WHERE id = ?
                """, (gross_amount, gross_amount, datetime.now().strftime("%Y-%m-%d"), now_str, cust_id))
            else:
                cust_id = f"cust_{uuid.uuid4().hex[:6]}"
                prefs = {
                    "favourite_categories": ["Fintech Hardware", "POS Devices"],
                    "preferred_payment": payment_method.upper(),
                    "city": "Bengaluru",
                    "buying_frequency": "Monthly",
                    "credit_limit": 250000
                }
                cursor.execute("""
                    INSERT INTO merchant_customers
                    (id, merchant_id, name, email, phone, tier, lifetime_value, orders_count, average_order_value, preferences_json, ai_insights, last_purchase_date, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, 'SILVER', ?, 1, ?, ?, 'New customer purchase verified via Razorpay.', ?, ?, ?)
                """, (
                    cust_id, merchant_id, c_name, c_email, c_phone, gross_amount, gross_amount,
                    json.dumps(prefs), datetime.now().strftime("%Y-%m-%d"), now_str, now_str
                ))

            # 2. Items processing
            items_clean = []
            if items:
                for it in items:
                    p_id = it.get("product_id") or it.get("id") or "prod_pos_smart_v3"
                    sku = it.get("sku") or (p_id if "sku" in str(p_id).lower() else f"SKU-{str(p_id).upper()[:12]}")
                    p_name = it.get("name") or it.get("product_name") or "Fintech Device"
                    price = float(it.get("price") or it.get("unit_price") or 0.0)
                    qty = int(it.get("quantity") or it.get("qty") or 1)
                    line_sub = round(price * qty, 2)
                    items_clean.append({
                        "product_id": p_id,
                        "sku": sku,
                        "name": p_name,
                        "price": price,
                        "quantity": qty,
                        "subtotal": line_sub
                    })

            if not items_clean:
                items_clean = [{
                    "product_id": "prod_pos_smart_v3",
                    "sku": "SKU-RZP-POS-V3",
                    "name": "Razorpay Smart POS Terminal V3 Pro",
                    "price": gross_amount or 14999.0,
                    "quantity": 1,
                    "subtotal": gross_amount or 14999.0
                }]

            calc_subtotal = round(sum(i["subtotal"] for i in items_clean), 2)
            final_subtotal = subtotal if subtotal is not None else calc_subtotal
            final_tax = tax if tax is not None else round(final_subtotal - (final_subtotal / 1.18), 2)
            final_discount = discount if discount is not None else 0.0
            final_total = gross_amount if gross_amount > 0 else round(final_subtotal - final_discount, 2)
            ship_addr = (shipping_address or "").strip()
            if not ship_addr:
                try:
                    audit_service.log_audit(
                        action="ORDER_CREATION_FAILED",
                        entity_type="ORDER",
                        entity_id=order_id,
                        user_name=c_name,
                        role="Customer",
                        old_value=None,
                        new_value={"reason": "Missing or invalid shipping address"}
                    )
                except Exception:
                    pass
                raise ValueError("Shipping address is required to create an order.")
            
            # Initial Chronological Timeline
            timeline = [
                {"status": "Order Placed", "time": now_str, "location": "RazorCommerce Online Store", "completed": True},
                {"status": "Payment Completed", "time": now_str, "location": "Razorpay Payment Gateway", "completed": True}
            ]

            # Ensure extra columns exist
            try:
                cursor.execute("ALTER TABLE merchant_orders ADD COLUMN is_ai_order INTEGER DEFAULT 0")
            except Exception:
                pass
            try:
                cursor.execute("ALTER TABLE merchant_orders ADD COLUMN order_channel TEXT DEFAULT 'web'")
            except Exception:
                pass
            try:
                cursor.execute("ALTER TABLE merchant_orders ADD COLUMN campaign_id TEXT")
            except Exception:
                pass

            # 3. Database Persistence
            cursor.execute("""
                INSERT INTO merchant_orders
                (id, merchant_id, order_number, customer_id, customer_name, customer_email, customer_phone, shipping_address, shipping_address_id, billing_address_id, items_json, subtotal, tax, discount, total_amount, currency, payment_status, order_status, delivery_partner, awb_number, tracking_id, current_location, estimated_delivery, timeline_json, payment_id, payment_method, reconciled, order_placed_at, payment_initiated_at, payment_completed_at, is_ai_order, order_channel, campaign_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'INR', 'PAID', 'PAYMENT_RECEIVED', NULL, NULL, NULL, 'Merchant Central Warehouse', NULL, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                order_id, merchant_id, order_num, cust_id, c_name, c_email, c_phone,
                ship_addr, shipping_address_id, billing_address_id, json.dumps(items_clean), final_subtotal, final_tax, final_discount, final_total,
                json.dumps(timeline), payment_id or f"pay_rzp_{uuid.uuid4().hex[:10]}", payment_method,
                now_str, now_str, now_str, 1 if is_ai_order else 0, order_channel, campaign_id, now_str, now_str
            ))
            conn.commit()

        # 4. Analytics Engine Real-Time Recalculation
        try:
            from app.services.analytics_engine import analytics_engine
            ord_obj = self.get_order_by_id(order_id)
            if ord_obj:
                analytics_engine.record_order_event("ORDER_CREATED", ord_obj)
                analytics_engine.record_order_event("ORDER_PAID", ord_obj)
        except Exception as e:
            print(f"Warning: Failed to record order event in analytics engine: {e}")

        # 5. Audit Logging
        try:
            audit_service.log_audit(
                action="ORDER_PLACED",
                entity_type="ORDER",
                entity_id=order_id,
                user_id=cust_id,
                user_name=c_name,
                role="Customer",
                old_value=None,
                new_value={"order_id": order_id, "order_number": order_num, "amount": final_total, "items_count": len(items_clean), "merchant_id": merchant_id}
            )
            audit_service.log_audit(
                action="PAYMENT_COMPLETED",
                entity_type="PAYMENT",
                entity_id=payment_id or order_id,
                user_name="Razorpay Payment Gateway",
                role="Payment Gateway",
                old_value={"status": "INITIATED"},
                new_value={"status": "CAPTURED", "method": payment_method, "amount": final_total, "order_id": order_id, "merchant_id": merchant_id}
            )
        except Exception as ex:
            print(f"Warning: Audit log failure: {ex}")

        return self.get_order_by_id(order_id)

    # Orders Retrieval & Filters
    def get_orders(self, status: Optional[str] = None, search: Optional[str] = None, merchant_id: Optional[str] = None) -> List[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            query = "SELECT * FROM merchant_orders"
            params = []
            where_clauses = []

            if merchant_id:
                where_clauses.append("merchant_id = ?")
                params.append(merchant_id)

            if status and status.upper() != "ALL":
                st = status.upper()
                if st == "PENDING" or st == "PENDING_CONFIRMATION":
                    where_clauses.append("order_status IN ('PAYMENT_RECEIVED', 'PENDING_CONFIRMATION')")
                else:
                    where_clauses.append("order_status = ?")
                    params.append(st)

            if search and search.strip():
                where_clauses.append("(order_number LIKE ? OR customer_name LIKE ? OR customer_email LIKE ? OR tracking_id LIKE ? OR awb_number LIKE ?)")
                q = f"%{search.strip()}%"
                params.extend([q, q, q, q, q])

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
            cursor.execute("SELECT * FROM merchant_orders WHERE id = ? OR order_number = ? OR tracking_id = ? OR awb_number = ?", (order_id, order_id, order_id, order_id))
            row = cursor.fetchone()
            if row:
                d = dict(row)
                d["items"] = json.loads(d["items_json"]) if d["items_json"] else []
                d["timeline"] = json.loads(d["timeline_json"]) if d["timeline_json"] else []
                return d

        # Fallback check in SAMPLE_COMMERCE_ORDERS for Admin/Reconciliation compatibility
        try:
            from app.services.reconciliation_service import SAMPLE_COMMERCE_ORDERS
            for raw in SAMPLE_COMMERCE_ORDERS:
                if raw.get("id") == order_id or raw.get("order_id") == order_id:
                    order_num = raw.get("order_id")
                    qty = int(raw.get("quantity", 1))
                    amount = float(raw.get("amount", 0.0))
                    subtotal = round(amount / 1.18, 2)
                    tax = round(amount - subtotal, 2)

                    items = [{
                        "product_id": "HW-POS-001",
                        "sku": f"SKU-{order_num[-4:]}",
                        "name": raw.get("product_title", "Fintech Payment Hardware"),
                        "quantity": qty,
                        "price": round(amount / qty, 2) if qty else amount
                    }]

                    clean_suffix = order_num.replace("ORD-", "").replace("-", "")
                    inv_num = f"INV-2026-{clean_suffix}"

                    return {
                        "id": raw.get("id"),
                        "order_number": order_num,
                        "customer_id": "cust_recon_enterprise",
                        "customer_name": raw.get("customer_name", "Enterprise Customer"),
                        "customer_email": raw.get("customer_email", "procurement@enterprise.in"),
                        "customer_phone": "+91 98765 43210",
                        "shipping_address": "Ground & 1st Floor, Tower B, Silicon Valley Corridor, Outer Ring Road, Bengaluru, Karnataka 560103",
                        "items": items,
                        "items_json": json.dumps(items),
                        "subtotal": subtotal,
                        "tax": tax,
                        "discount": 0.0,
                        "total_amount": amount,
                        "currency": "INR",
                        "payment_status": raw.get("payment_status", "PAID"),
                        "order_status": raw.get("lifecycle_stage", "DELIVERED").upper().replace(" ", "_"),
                        "delivery_partner": raw.get("carrier", "Delhivery Express"),
                        "awb_number": raw.get("tracking_number", f"AWB-{order_num[-6:]}"),
                        "tracking_id": raw.get("tracking_number", f"TRK-{order_num[-6:]}"),
                        "current_location": "Delivered to recipient address",
                        "estimated_delivery": "Delivered",
                        "timeline": [],
                        "payment_id": f"pay_{raw.get('id')}",
                        "payment_method": raw.get("payment_method", "Razorpay UPI"),
                        "invoice_number": inv_num,
                        "order_placed_at": raw.get("created_at"),
                        "created_at": raw.get("created_at"),
                        "updated_at": raw.get("updated_at")
                    }
        except Exception:
            pass

        return None

    def get_or_create_invoice_number(self, order_id: str) -> str:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, order_number, invoice_number FROM merchant_orders WHERE id = ? OR order_number = ? OR tracking_id = ? OR awb_number = ?", (order_id, order_id, order_id, order_id))
            row = cursor.fetchone()
            if row:
                if row["invoice_number"]:
                    return row["invoice_number"]

                order_num = row["order_number"] or row["id"]
                if "RCM-" in order_num:
                    clean_suffix = order_num.replace("RCM-", "").replace("-", "")
                    inv_num = f"INV-{clean_suffix}"
                else:
                    clean_id = order_id.replace("ord_", "").replace("ORD-", "").replace("-", "").upper()[:6]
                    inv_num = f"INV-2026-{clean_id}"

                cursor.execute("UPDATE merchant_orders SET invoice_number = ? WHERE id = ?", (inv_num, row["id"]))
                conn.commit()
                return inv_num

        clean = order_id.replace("ord_", "").replace("ORD-", "").replace("-", "").upper()[:6]
        return f"INV-2026-{clean}"

    # Merchant Actions:
    # 1. Accept Order: PAYMENT_RECEIVED -> ACCEPTED
    def accept_order(self, order_id: str, merchant_name: str = "Acme Direct Corp") -> Optional[Dict[str, Any]]:
        order = self.get_order_by_id(order_id)
        if not order:
            return None
        now_str = utcnow_iso()
        timeline = order.get("timeline", [])
        timeline.append({"status": "Merchant Accepted", "time": now_str, "location": "Merchant Operations Hub", "completed": True})

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE merchant_orders SET
                    order_status = 'ACCEPTED',
                    merchant_accepted_at = ?,
                    timeline_json = ?,
                    updated_at = ?
                WHERE id = ? OR order_number = ?
            """, (now_str, json.dumps(timeline), now_str, order_id, order_id))
            conn.commit()

        audit_service.log_audit(
            action="ORDER_ACCEPTED",
            entity_type="ORDER",
            entity_id=order_id,
            user_name=merchant_name,
            role="Merchant Admin",
            old_value={"order_status": order.get("order_status")},
            new_value={"order_status": "ACCEPTED", "merchant_accepted_at": now_str}
        )

        return self._notify_analytics(self.get_order_by_id(order_id))

    # 2. Start Picking: ACCEPTED -> PICKING
    def start_picking(self, order_id: str) -> Optional[Dict[str, Any]]:
        order = self.get_order_by_id(order_id)
        if not order:
            return None
        now_str = utcnow_iso()
        timeline = order.get("timeline", [])
        timeline.append({"status": "Warehouse Picking In Progress", "time": now_str, "location": "Central Warehouse Bin #A4", "completed": True})

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE merchant_orders SET
                    order_status = 'PICKING',
                    current_location = 'Central Warehouse Bin #A4',
                    timeline_json = ?,
                    updated_at = ?
                WHERE id = ? OR order_number = ?
            """, (json.dumps(timeline), now_str, order_id, order_id))
            conn.commit()

        return self._notify_analytics(self.get_order_by_id(order_id))

    # 3. Mark Packed: PICKING -> PACKED
    def pack_order(self, order_id: str) -> Optional[Dict[str, Any]]:
        order = self.get_order_by_id(order_id)
        if not order:
            return None
        now_str = utcnow_iso()
        timeline = order.get("timeline", [])
        timeline.append({"status": "Packed", "time": now_str, "location": "Packaging & Quality Station", "completed": True})

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE merchant_orders SET
                    order_status = 'PACKED',
                    current_location = 'Packaging Station',
                    packed_at = ?,
                    timeline_json = ?,
                    updated_at = ?
                WHERE id = ? OR order_number = ?
            """, (now_str, json.dumps(timeline), now_str, order_id, order_id))
            conn.commit()

        audit_service.log_audit(
            action="ORDER_PACKED",
            entity_type="ORDER",
            entity_id=order_id,
            user_name="Warehouse Fulfillment Station",
            role="Warehouse Operator",
            old_value={"order_status": order.get("order_status")},
            new_value={"order_status": "PACKED", "packed_at": now_str}
        )

        return self._notify_analytics(self.get_order_by_id(order_id))

    # 4. Mark Ready for Pickup: PACKED -> READY_FOR_PICKUP
    def mark_ready_for_pickup(self, order_id: str) -> Optional[Dict[str, Any]]:
        order = self.get_order_by_id(order_id)
        if not order:
            return None
        now_str = utcnow_iso()
        timeline = order.get("timeline", [])
        timeline.append({"status": "Ready for Pickup", "time": now_str, "location": "Outbound Dispatch Bay #3", "completed": True})

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE merchant_orders SET
                    order_status = 'READY_FOR_PICKUP',
                    current_location = 'Outbound Dispatch Bay #3',
                    ready_for_pickup_at = ?,
                    timeline_json = ?,
                    updated_at = ?
                WHERE id = ? OR order_number = ?
            """, (now_str, json.dumps(timeline), now_str, order_id, order_id))
            conn.commit()

        audit_service.log_audit(
            action="READY_FOR_PICKUP",
            entity_type="ORDER",
            entity_id=order_id,
            user_name="Outbound Logistics Lead",
            role="Merchant Operations",
            old_value={"order_status": order.get("order_status")},
            new_value={"order_status": "READY_FOR_PICKUP", "ready_for_pickup_at": now_str}
        )

        return self._notify_analytics(self.get_order_by_id(order_id))

    # Courier Actions:
    # 1. Pickup Package & Assign Courier: READY_FOR_PICKUP -> PICKED_UP_BY_COURIER / SHIPPED
    def courier_pickup(self, order_id: str, courier_name: str = "Delhivery Express") -> Optional[Dict[str, Any]]:
        order = self.get_order_by_id(order_id)
        if not order:
            return None
        now_str = utcnow_iso()
        
        partner = next(
            (p for p in DELIVERY_PARTNERS if p["code"].lower() in courier_name.lower() or p["name"].lower() in courier_name.lower()),
            DELIVERY_PARTNERS[0]
        )
        awb_num = f"AWB-{partner['prefix']}-{random.randint(1000000, 9999999)}"
        tracking_id = f"{partner['prefix']}{random.randint(100000, 999999)}"
        est_delivery = (datetime.now(timezone.utc) + timedelta(days=2)).strftime("%d %b %Y, 6:00 PM")
        pickup_loc = f"Dispatch Bay • Handed to {partner['name']}"

        timeline = order.get("timeline", [])
        timeline.append({
            "status": f"Courier Assigned ({partner['name']})",
            "time": now_str,
            "location": pickup_loc,
            "completed": True
        })

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE merchant_orders SET
                    delivery_partner = ?,
                    awb_number = ?,
                    tracking_id = ?,
                    current_location = ?,
                    estimated_delivery = ?,
                    order_status = 'PICKED_UP_BY_COURIER',
                    courier_assigned_at = ?,
                    shipped_at = ?,
                    timeline_json = ?,
                    updated_at = ?
                WHERE id = ? OR order_number = ?
            """, (partner["name"], awb_num, tracking_id, pickup_loc, est_delivery, now_str, now_str, json.dumps(timeline), now_str, order_id, order_id))
            conn.commit()

        audit_service.log_audit(
            action="COURIER_ASSIGNED",
            entity_type="DELIVERY",
            entity_id=order_id,
            user_name=f"{partner['name']} Dispatcher",
            role="Logistics Carrier Partner",
            old_value={"delivery_partner": None, "awb_number": None},
            new_value={"delivery_partner": partner["name"], "awb_number": awb_num, "tracking_id": tracking_id, "courier_assigned_at": now_str}
        )

        return self._notify_analytics(self.get_order_by_id(order_id))

    # 2. Update Shipment Location / In-Transit: PICKED_UP_BY_COURIER -> IN_TRANSIT
    def update_shipment_location(self, order_id: str, location: str) -> Optional[Dict[str, Any]]:
        order = self.get_order_by_id(order_id)
        if not order:
            return None
        now_str = utcnow_iso()
        tracking = order.get("tracking_id") or ""

        timeline = order.get("timeline", [])
        timeline.append({
            "status": f"Shipped • In Transit ({tracking})",
            "time": now_str,
            "location": location,
            "completed": True
        })

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE merchant_orders SET
                    order_status = 'IN_TRANSIT',
                    current_location = ?,
                    shipped_at = COALESCE(shipped_at, ?),
                    timeline_json = ?,
                    updated_at = ?
                WHERE id = ? OR order_number = ?
            """, (location, now_str, json.dumps(timeline), now_str, order_id, order_id))
            conn.commit()

        audit_service.log_audit(
            action="IN_TRANSIT",
            entity_type="DELIVERY",
            entity_id=order_id,
            user_name=order.get("delivery_partner") or "Logistics Carrier",
            role="Logistics Carrier Partner",
            old_value={"current_location": order.get("current_location")},
            new_value={"current_location": location, "order_status": "IN_TRANSIT", "shipped_at": now_str}
        )

        return self._notify_analytics(self.get_order_by_id(order_id))

    # 3. Out For Delivery: IN_TRANSIT -> OUT_FOR_DELIVERY
    def mark_out_for_delivery(self, order_id: str, agent_notes: Optional[str] = None) -> Optional[Dict[str, Any]]:
        order = self.get_order_by_id(order_id)
        if not order:
            return None
        now_str = utcnow_iso()
        loc = agent_notes or f"Last-Mile Delivery Hub ({order.get('shipping_address', 'Destination Area')})"

        timeline = order.get("timeline", [])
        timeline.append({
            "status": "Out For Delivery",
            "time": now_str,
            "location": loc,
            "completed": True
        })

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE merchant_orders SET
                    order_status = 'OUT_FOR_DELIVERY',
                    current_location = ?,
                    out_for_delivery_at = ?,
                    timeline_json = ?,
                    updated_at = ?
                WHERE id = ? OR order_number = ?
            """, (loc, now_str, json.dumps(timeline), now_str, order_id, order_id))
            conn.commit()

        audit_service.log_audit(
            action="OUT_FOR_DELIVERY",
            entity_type="DELIVERY",
            entity_id=order_id,
            user_name=f"{order.get('delivery_partner', 'Courier')} Field Agent",
            role="Logistics Carrier Partner",
            old_value={"order_status": order.get("order_status")},
            new_value={"order_status": "OUT_FOR_DELIVERY", "out_for_delivery_at": now_str, "location": loc}
        )

        return self._notify_analytics(self.get_order_by_id(order_id))

    # 4. Mark Delivered: OUT_FOR_DELIVERY -> DELIVERED
    def mark_delivered(self, order_id: str) -> Optional[Dict[str, Any]]:
        order = self.get_order_by_id(order_id)
        if not order:
            return None
        now_str = utcnow_iso()
        dest = order.get("shipping_address") or "Customer Doorstep"

        timeline = order.get("timeline", [])
        timeline.append({
            "status": "Delivered",
            "time": now_str,
            "location": dest,
            "completed": True
        })

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE merchant_orders SET
                    order_status = 'DELIVERED',
                    current_location = ?,
                    delivered_at = ?,
                    timeline_json = ?,
                    updated_at = ?
                WHERE id = ? OR order_number = ?
            """, (dest, now_str, json.dumps(timeline), now_str, order_id, order_id))
            conn.commit()

        audit_service.log_audit(
            action="ORDER_DELIVERED",
            entity_type="ORDER",
            entity_id=order_id,
            user_name=f"{order.get('delivery_partner', 'Courier')} Delivery Agent",
            role="Logistics Carrier Partner",
            old_value={"order_status": order.get("order_status")},
            new_value={"order_status": "DELIVERED", "delivered_at": now_str, "recipient": order.get("customer_name")}
        )

        return self._notify_analytics(self.get_order_by_id(order_id))

    # 5. Return & Refund
    def mark_returned(self, order_id: str, reason: str = "Customer Return Initiated") -> Optional[Dict[str, Any]]:
        order = self.get_order_by_id(order_id)
        if not order:
            return None
        now_str = utcnow_iso()

        timeline = order.get("timeline", [])
        timeline.append({
            "status": f"Return Processed ({reason})",
            "time": now_str,
            "location": "Return Processing Center",
            "completed": True
        })

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE merchant_orders SET
                    order_status = 'RETURNED',
                    current_location = 'Return Processing Center',
                    timeline_json = ?,
                    updated_at = ?
                WHERE id = ? OR order_number = ?
            """, (json.dumps(timeline), now_str, order_id, order_id))
            conn.commit()

        audit_service.log_audit(
            action="RETURN_INITIATED",
            entity_type="DELIVERY",
            entity_id=order_id,
            user_name="Customer Service Desk",
            role="Support Specialist",
            old_value={"order_status": order.get("order_status")},
            new_value={"order_status": "RETURNED", "reason": reason}
        )

        return self._notify_analytics(self.get_order_by_id(order_id))

    def mark_refunded(self, order_id: str) -> Optional[Dict[str, Any]]:
        order = self.get_order_by_id(order_id)
        if not order:
            return None
        now_str = utcnow_iso()

        timeline = order.get("timeline", [])
        timeline.append({
            "status": "Payment Refunded",
            "time": now_str,
            "location": "Razorpay Settlement Gateway",
            "completed": True
        })

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE merchant_orders SET
                    order_status = 'REFUNDED',
                    payment_status = 'REFUNDED',
                    refunded_at = ?,
                    timeline_json = ?,
                    updated_at = ?
                WHERE id = ? OR order_number = ?
            """, (now_str, json.dumps(timeline), now_str, order_id, order_id))
            conn.commit()

        audit_service.log_audit(
            action="REFUND_PROCESSED",
            entity_type="PAYMENT",
            entity_id=order.get("payment_id") or order_id,
            user_name="Finance Operations Controller",
            role="CFO / Finance Controller",
            old_value={"payment_status": order.get("payment_status"), "amount": order.get("total_amount")},
            new_value={"payment_status": "REFUNDED", "refunded_at": now_str, "amount_refunded": order.get("total_amount")}
        )

        return self._notify_analytics(self.get_order_by_id(order_id))

    def reject_order(self, order_id: str, reason: str = "Out of Stock / Policy Rejection") -> Optional[Dict[str, Any]]:
        order = self.get_order_by_id(order_id)
        if not order:
            return None
        now_str = utcnow_iso()
        timeline = order.get("timeline", [])
        timeline.append({"status": f"Order Rejected ({reason})", "time": now_str, "location": "Merchant Hub", "completed": False})

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE merchant_orders SET
                    order_status = 'REJECTED',
                    payment_status = 'REFUNDED',
                    merchant_rejected_at = ?,
                    cancelled_at = ?,
                    timeline_json = ?,
                    updated_at = ?
                WHERE id = ? OR order_number = ?
            """, (now_str, now_str, json.dumps(timeline), now_str, order_id, order_id))
            conn.commit()

        audit_service.log_audit(
            action="ORDER_REJECTED",
            entity_type="ORDER",
            entity_id=order_id,
            user_name="Merchant Operations Hub",
            role="Merchant Admin",
            old_value={"order_status": order.get("order_status")},
            new_value={"order_status": "REJECTED", "reason": reason, "merchant_rejected_at": now_str}
        )

        return self._notify_analytics(self.get_order_by_id(order_id))


    def _notify_analytics(self, order: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        if order and order.get("order_status"):
            try:
                from app.services.analytics_engine import analytics_engine
                st = str(order.get("order_status", "")).upper()
                analytics_engine.record_order_event(f"ORDER_{st}", order)
            except Exception as e:
                logger.error(f"Failed to record analytics event: {e}")
        return order

    # Universal Status Update Dispatcher
    def update_order_status(self, order_id: str, new_status: str, notes: Optional[str] = None) -> Optional[Dict[str, Any]]:
        st = new_status.upper()
        if st in ["ACCEPTED", "ACCEPT"]:
            return self.accept_order(order_id)
        elif st in ["PICKING", "START_PICKING", "PROCESSING"]:
            return self.start_picking(order_id)
        elif st in ["PACKED", "PACK"]:
            return self.pack_order(order_id)
        elif st in ["READY_FOR_PICKUP", "READY_PICKUP"]:
            return self.mark_ready_for_pickup(order_id)
        elif st in ["PICKED_UP_BY_COURIER", "COURIER_PICKUP", "COURIER_ASSIGNED"]:
            return self.courier_pickup(order_id, notes or "Delhivery Express")
        elif st in ["IN_TRANSIT", "SHIPPED"]:
            return self.update_shipment_location(order_id, notes or "Transshipment Sort Center")
        elif st in ["OUT_FOR_DELIVERY"]:
            return self.mark_out_for_delivery(order_id, notes)
        elif st in ["DELIVERED"]:
            return self.mark_delivered(order_id)
        elif st in ["RETURNED"]:
            return self.mark_returned(order_id, notes or "Customer return")
        elif st in ["REFUNDED"]:
            return self.mark_refunded(order_id)
        elif st in ["REJECTED", "CANCELLED"]:
            return self.reject_order(order_id, notes or "Cancelled")

        # Fallback manual update
        order = self.get_order_by_id(order_id)
        if not order:
            return None
        now_str = utcnow_iso()
        timeline = order.get("timeline", [])
        timeline.append({"status": st.replace("_", " ").title(), "time": now_str, "location": notes or "Hub Checkpoint", "completed": True})

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE merchant_orders SET
                    order_status = ?,
                    timeline_json = ?,
                    updated_at = ?
                WHERE id = ? OR order_number = ?
            """, (st, json.dumps(timeline), now_str, order_id, order_id))
            conn.commit()

        return self._notify_analytics(self.get_order_by_id(order_id))

    def assign_courier(self, order_id: str, courier_name: str) -> Optional[Dict[str, Any]]:
        """Alias for courier_pickup to guarantee backward compatibility."""
        return self.courier_pickup(order_id, courier_name)

    def get_delivery_partners(self, merchant_id: Optional[str] = None) -> List[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            partners = []
            for p in DELIVERY_PARTNERS:
                if merchant_id:
                    cursor.execute("""
                        SELECT COUNT(*) as cnt FROM merchant_orders 
                        WHERE delivery_partner LIKE ? AND order_status IN ('PICKED_UP_BY_COURIER', 'IN_TRANSIT', 'OUT_FOR_DELIVERY') AND merchant_id = ?
                    """, (f"%{p['code']}%", merchant_id))
                else:
                    cursor.execute("""
                        SELECT COUNT(*) as cnt FROM merchant_orders 
                        WHERE delivery_partner LIKE ? AND order_status IN ('PICKED_UP_BY_COURIER', 'IN_TRANSIT', 'OUT_FOR_DELIVERY')
                    """, (f"%{p['code']}%",))
                cnt = cursor.fetchone()["cnt"]
                partner_copy = dict(p)
                partner_copy["active_shipments"] = cnt
                partners.append(partner_copy)
            return partners

    def get_shipments(self, merchant_id: Optional[str] = None) -> List[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            where_m = "WHERE merchant_id = ? AND " if merchant_id else "WHERE "
            params = (merchant_id,) if merchant_id else ()
            cursor.execute(f"""
                SELECT * FROM merchant_orders 
                {where_m}order_status IN ('READY_FOR_PICKUP', 'PICKED_UP_BY_COURIER', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED')
                ORDER BY updated_at DESC
            """, params)
            shipments = []
            for row in cursor.fetchall():
                d = dict(row)
                d["items"] = json.loads(d["items_json"]) if d["items_json"] else []
                d["timeline"] = json.loads(d["timeline_json"]) if d["timeline_json"] else []
                shipments.append(d)
            return shipments

    # Customers Retrieval
    def get_customers(self, merchant_id: Optional[str] = None) -> List[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            where_m = "WHERE merchant_id = ? " if merchant_id else ""
            params = (merchant_id,) if merchant_id else ()
            cursor.execute(f"SELECT * FROM merchant_customers {where_m}ORDER BY lifetime_value DESC", params)
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

    def create_order_from_purchase(
        self,
        order_id: str,
        customer_name: str,
        customer_email: str,
        customer_phone: str,
        shipping_address: str,
        items: List[Dict[str, Any]],
        gross_amount: float,
        subtotal: float,
        tax: float,
        discount: float,
        payment_id: str,
        payment_method: str = "upi",
        merchant_id: str = "rzp_live_acme_8842",
        is_ai_order: bool = False,
        order_channel: str = "web",
        campaign_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            # Check if order already recorded
            cursor.execute("SELECT id FROM merchant_orders WHERE id = ? OR payment_id = ?", (order_id, payment_id))
            if cursor.fetchone():
                return None

            now = datetime.now()
            now_str = now.isoformat()
            short_id = uuid.uuid4().hex[:6].upper()
            order_number = f"RCM-{now.year}-{short_id}"
            tracking_id = f"TRK-{short_id}"
            awb = f"AWB{random.randint(10000000, 99999999)}"
            carrier = random.choice(["BlueDart Apex", "Delhivery Surface", "DTDC Express"])
            eta = (now + timedelta(days=3)).strftime("%d %b %Y")

            timeline = [
                {"status": "ORDER_PLACED", "label": "Order Placed", "time": now.strftime("%I:%M %p"), "date": now.strftime("%d %b"), "completed": True},
                {"status": "PAYMENT_RECEIVED", "label": "Payment Confirmed via Razorpay", "time": now.strftime("%I:%M %p"), "date": now.strftime("%d %b"), "completed": True},
                {"status": "PROCESSING", "label": "Order Processing", "time": "Pending", "date": "-", "completed": False},
                {"status": "SHIPPED", "label": "Shipped", "time": "Pending", "date": "-", "completed": False},
                {"status": "DELIVERED", "label": "Delivered", "time": "Pending", "date": "-", "completed": False}
            ]

            # Ensure extra columns exist
            try:
                cursor.execute("ALTER TABLE merchant_orders ADD COLUMN is_ai_order INTEGER DEFAULT 0")
            except Exception:
                pass
            try:
                cursor.execute("ALTER TABLE merchant_orders ADD COLUMN order_channel TEXT DEFAULT 'web'")
            except Exception:
                pass
            try:
                cursor.execute("ALTER TABLE merchant_orders ADD COLUMN campaign_id TEXT")
            except Exception:
                pass

            cursor.execute("""
                INSERT INTO merchant_orders
                (id, merchant_id, order_number, customer_id, customer_name, customer_email, customer_phone, shipping_address, items_json, subtotal, tax, discount, total_amount, currency, payment_status, order_status, delivery_partner, awb_number, tracking_id, current_location, estimated_delivery, timeline_json, payment_id, payment_method, reconciled, order_placed_at, payment_initiated_at, payment_completed_at, is_ai_order, order_channel, campaign_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'INR', 'PAID', 'PAYMENT_RECEIVED', ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                order_id, merchant_id, order_number, "cust_001", customer_name, customer_email, customer_phone,
                shipping_address, json.dumps(items), subtotal, tax, discount, gross_amount,
                carrier, awb, tracking_id, "Central Warehouse", eta,
                json.dumps(timeline), payment_id, payment_method,
                now_str, now_str, now_str, 1 if is_ai_order else 0, order_channel, campaign_id, now_str, now_str
            ))
            conn.commit()

        try:
            from app.services.analytics_engine import analytics_engine
            ord_obj = self.get_order_by_id(order_id)
            if ord_obj:
                analytics_engine.record_order_event("ORDER_CREATED", ord_obj)
                analytics_engine.record_order_event("ORDER_PAID", ord_obj)
        except Exception as e:
            print(f"Warning: Failed to record order event in analytics engine: {e}")

        return {"order_id": order_id, "order_number": order_number}


merchant_service = MerchantService()
