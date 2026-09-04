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
            if cols and ("awb_number" not in cols or "current_location" not in cols):
                cursor.execute("DROP TABLE IF EXISTS merchant_orders")
                cursor.execute("DROP TABLE IF EXISTS merchant_customers")

            # Orders Table (with realistic 11-stage e-commerce logistics lifecycle)
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

                    cursor.execute("""
                        INSERT OR REPLACE INTO merchant_customers 
                        (id, name, email, phone, tier, lifetime_value, orders_count, average_order_value, preferences_json, ai_insights, last_purchase_date, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        cust_id, name, email, phone, tier, ltv, orders_count, aov,
                        json.dumps(prefs), insights,
                        (now - timedelta(days=random.randint(1, 20))).strftime("%Y-%m-%d"),
                        (now - timedelta(days=random.randint(60, 365))).strftime("%Y-%m-%d %H:%M:%S")
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

                    # Realistic Courier Logic:
                    # AWBs and Tracking IDs ONLY generated upon courier pickup!
                    courier = None
                    awb_num = None
                    tracking_id = None
                    curr_loc = "Merchant Central Warehouse"
                    est_delivery = None

                    # If order is picked up or further, assign courier partner and generate AWB & tracking
                    if status in ["PICKED_UP_BY_COURIER", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"]:
                        partner = DELIVERY_PARTNERS[i % len(DELIVERY_PARTNERS)]
                        courier = partner["name"]
                        awb_num = f"AWB-{partner['prefix']}-{random.randint(1000000, 9999999)}"
                        tracking_id = f"{partner['prefix']}{random.randint(100000, 999999)}"
                        est_delivery = (now + timedelta(days=random.randint(1, 3))).strftime("%d %b %Y, 6:00 PM")
                        
                        city_locs = LOCATIONS_BY_CITY.get(city, LOCATIONS_BY_CITY["Bengaluru"])
                        if status == "PICKED_UP_BY_COURIER":
                            curr_loc = city_locs[0]
                        elif status == "IN_TRANSIT":
                            curr_loc = city_locs[1]
                        elif status == "OUT_FOR_DELIVERY":
                            curr_loc = city_locs[2]
                        elif status == "DELIVERED":
                            curr_loc = shipping_addr
                    elif status in ["PAYMENT_RECEIVED", "ACCEPTED", "PICKING", "PACKED", "READY_FOR_PICKUP"]:
                        # Pre-pickup stages have NO AWB and NO tracking ID
                        courier = None
                        awb_num = None
                        tracking_id = None
                        curr_loc = "Fulfillment Center Dispatch Dock" if status == "READY_FOR_PICKUP" else "Central Warehouse"

                    # Generate Chronological Timeline
                    order_time = (now - timedelta(days=random.randint(1, 10))).strftime("%Y-%m-%d %H:%M:%S")
                    timeline = [
                        {"status": "Payment Received", "time": order_time, "location": "Razorpay Payment Gateway (Instant)", "completed": True},
                    ]
                    if status in ["ACCEPTED", "PICKING", "PACKED", "READY_FOR_PICKUP", "PICKED_UP_BY_COURIER", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"]:
                        timeline.append({"status": "Order Accepted by Merchant", "time": order_time, "location": "Merchant Operations Hub", "completed": True})
                    if status in ["PICKING", "PACKED", "READY_FOR_PICKUP", "PICKED_UP_BY_COURIER", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"]:
                        timeline.append({"status": "Warehouse Picking In Progress", "time": order_time, "location": "Central Warehouse Bin #A4", "completed": True})
                    if status in ["PACKED", "READY_FOR_PICKUP", "PICKED_UP_BY_COURIER", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"]:
                        timeline.append({"status": "Order Packed & Barcoded", "time": order_time, "location": "Packaging & Quality Station", "completed": True})
                    if status in ["READY_FOR_PICKUP", "PICKED_UP_BY_COURIER", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"]:
                        timeline.append({"status": "Ready for Courier Pickup", "time": order_time, "location": "Outbound Dispatch Bay #3", "completed": True})
                    if status in ["PICKED_UP_BY_COURIER", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"]:
                        timeline.append({"status": f"Picked up by {courier} (AWB: {awb_num})", "time": order_time, "location": f"{city} Dispatch Bay", "completed": True})
                    if status in ["IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"]:
                        timeline.append({"status": f"In Transit • Hub Sort ({tracking_id})", "time": order_time, "location": curr_loc, "completed": True})
                    if status in ["OUT_FOR_DELIVERY", "DELIVERED"]:
                        timeline.append({"status": "Out for Delivery • Courier Agent Dispatched", "time": order_time, "location": f"Last-Mile Facility, {city}", "completed": True})
                    if status == "DELIVERED":
                        timeline.append({"status": "Delivered & Signed by Customer", "time": order_time, "location": shipping_addr, "completed": True})

                    cursor.execute("""
                        INSERT OR REPLACE INTO merchant_orders
                        (id, order_number, customer_id, customer_name, customer_email, customer_phone, shipping_address, items_json, subtotal, tax, discount, total_amount, currency, payment_status, order_status, delivery_partner, awb_number, tracking_id, current_location, estimated_delivery, timeline_json, payment_id, payment_method, reconciled, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        order_id, order_num, cust_id, cust_name, cust_email, f"+91 98{random.randint(10000000, 99999999)}",
                        shipping_addr, json.dumps(items), subtotal, tax, discount, total_amount, "INR",
                        pay_status, status, courier, awb_num, tracking_id, curr_loc, est_delivery, json.dumps(timeline),
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

            cursor.execute("SELECT COUNT(*) as cnt FROM merchant_orders WHERE order_status IN ('PAYMENT_RECEIVED', 'PENDING_CONFIRMATION')")
            pending_orders = cursor.fetchone()["cnt"]

            cursor.execute("SELECT COUNT(*) as cnt FROM merchant_orders WHERE order_status = 'READY_FOR_PICKUP'")
            ready_for_pickup = cursor.fetchone()["cnt"]

            cursor.execute("SELECT COUNT(*) as cnt FROM merchant_orders WHERE order_status IN ('PICKED_UP_BY_COURIER', 'IN_TRANSIT', 'OUT_FOR_DELIVERY')")
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
                "ready_for_pickup": ready_for_pickup,
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
            if not row:
                return None
            d = dict(row)
            d["items"] = json.loads(d["items_json"]) if d["items_json"] else []
            d["timeline"] = json.loads(d["timeline_json"]) if d["timeline_json"] else []
            return d

    # Merchant Actions:
    # 1. Accept Order: PAYMENT_RECEIVED -> ACCEPTED
    def accept_order(self, order_id: str) -> Optional[Dict[str, Any]]:
        order = self.get_order_by_id(order_id)
        if not order:
            return None
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        timeline = order.get("timeline", [])
        timeline.append({"status": "Order Accepted by Merchant", "time": now_str, "location": "Merchant Operations Hub", "completed": True})

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE merchant_orders SET
                    order_status = 'ACCEPTED',
                    delivery_partner = NULL,
                    awb_number = NULL,
                    tracking_id = NULL,
                    timeline_json = ?,
                    updated_at = ?
                WHERE id = ? OR order_number = ?
            """, (json.dumps(timeline), now_str, order_id, order_id))
            conn.commit()

        return self.get_order_by_id(order_id)

    # 2. Start Picking: ACCEPTED -> PICKING
    def start_picking(self, order_id: str) -> Optional[Dict[str, Any]]:
        order = self.get_order_by_id(order_id)
        if not order:
            return None
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        timeline = order.get("timeline", [])
        timeline.append({"status": "Warehouse Picking In Progress", "time": now_str, "location": "Central Warehouse Bin #A4", "completed": True})

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE merchant_orders SET
                    order_status = 'PICKING',
                    current_location = 'Central Warehouse Bin #A4',
                    delivery_partner = NULL,
                    awb_number = NULL,
                    tracking_id = NULL,
                    timeline_json = ?,
                    updated_at = ?
                WHERE id = ? OR order_number = ?
            """, (json.dumps(timeline), now_str, order_id, order_id))
            conn.commit()

        return self.get_order_by_id(order_id)

    # 3. Mark Packed: PICKING -> PACKED
    def pack_order(self, order_id: str) -> Optional[Dict[str, Any]]:
        order = self.get_order_by_id(order_id)
        if not order:
            return None
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        timeline = order.get("timeline", [])
        timeline.append({"status": "Order Packed & Barcoded", "time": now_str, "location": "Packaging & Quality Station", "completed": True})

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE merchant_orders SET
                    order_status = 'PACKED',
                    current_location = 'Packaging Station',
                    delivery_partner = NULL,
                    awb_number = NULL,
                    tracking_id = NULL,
                    timeline_json = ?,
                    updated_at = ?
                WHERE id = ? OR order_number = ?
            """, (json.dumps(timeline), now_str, order_id, order_id))
            conn.commit()

        return self.get_order_by_id(order_id)

    # 4. Mark Ready for Pickup: PACKED -> READY_FOR_PICKUP
    def mark_ready_for_pickup(self, order_id: str) -> Optional[Dict[str, Any]]:
        order = self.get_order_by_id(order_id)
        if not order:
            return None
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        timeline = order.get("timeline", [])
        timeline.append({"status": "Ready for Courier Pickup", "time": now_str, "location": "Outbound Dispatch Bay #3", "completed": True})

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE merchant_orders SET
                    order_status = 'READY_FOR_PICKUP',
                    current_location = 'Outbound Dispatch Bay #3',
                    delivery_partner = NULL,
                    awb_number = NULL,
                    tracking_id = NULL,
                    timeline_json = ?,
                    updated_at = ?
                WHERE id = ? OR order_number = ?
            """, (json.dumps(timeline), now_str, order_id, order_id))
            conn.commit()

        return self.get_order_by_id(order_id)

    # Courier Actions (Simulated):
    # 1. Pickup Package: READY_FOR_PICKUP -> PICKED_UP_BY_COURIER
    # GENERATES AWB NUMBER AND TRACKING ID STRICTLY HERE!
    def courier_pickup(self, order_id: str, courier_name: str = "Delhivery Express") -> Optional[Dict[str, Any]]:
        order = self.get_order_by_id(order_id)
        if not order:
            return None
        now = datetime.utcnow()
        now_str = now.strftime("%Y-%m-%d %H:%M:%S")
        
        partner = next(
            (p for p in DELIVERY_PARTNERS if p["code"].lower() in courier_name.lower() or p["name"].lower() in courier_name.lower()),
            DELIVERY_PARTNERS[0]
        )
        awb_num = f"AWB-{partner['prefix']}-{random.randint(1000000, 9999999)}"
        tracking_id = f"{partner['prefix']}{random.randint(100000, 999999)}"
        est_delivery = (now + timedelta(days=2)).strftime("%d %b %Y, 6:00 PM")
        pickup_loc = f"Dispatch Bay • Handed to {partner['name']}"

        timeline = order.get("timeline", [])
        timeline.append({
            "status": f"Package Picked Up by {partner['name']} (AWB: {awb_num}, Tracking ID: {tracking_id})",
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
                    timeline_json = ?,
                    updated_at = ?
                WHERE id = ? OR order_number = ?
            """, (partner["name"], awb_num, tracking_id, pickup_loc, est_delivery, json.dumps(timeline), now_str, order_id, order_id))
            conn.commit()

        return self.get_order_by_id(order_id)

    # 2. Update Shipment Location / In-Transit: PICKED_UP_BY_COURIER -> IN_TRANSIT
    def update_shipment_location(self, order_id: str, location: str) -> Optional[Dict[str, Any]]:
        order = self.get_order_by_id(order_id)
        if not order:
            return None
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        courier = order.get("delivery_partner") or "Courier"
        tracking = order.get("tracking_id") or ""

        timeline = order.get("timeline", [])
        timeline.append({
            "status": f"In Transit • Transshipment Scan ({tracking})",
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
                    timeline_json = ?,
                    updated_at = ?
                WHERE id = ? OR order_number = ?
            """, (location, json.dumps(timeline), now_str, order_id, order_id))
            conn.commit()

        return self.get_order_by_id(order_id)

    # 3. Out For Delivery: IN_TRANSIT -> OUT_FOR_DELIVERY
    def mark_out_for_delivery(self, order_id: str, agent_notes: Optional[str] = None) -> Optional[Dict[str, Any]]:
        order = self.get_order_by_id(order_id)
        if not order:
            return None
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        loc = agent_notes or f"Last-Mile Delivery Hub ({order.get('shipping_address', 'Destination Area')})"

        timeline = order.get("timeline", [])
        timeline.append({
            "status": "Out for Delivery • Courier Agent Dispatched",
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
                    timeline_json = ?,
                    updated_at = ?
                WHERE id = ? OR order_number = ?
            """, (loc, json.dumps(timeline), now_str, order_id, order_id))
            conn.commit()

        return self.get_order_by_id(order_id)

    # 4. Mark Delivered: OUT_FOR_DELIVERY -> DELIVERED
    def mark_delivered(self, order_id: str) -> Optional[Dict[str, Any]]:
        order = self.get_order_by_id(order_id)
        if not order:
            return None
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        dest = order.get("shipping_address") or "Customer Doorstep"

        timeline = order.get("timeline", [])
        timeline.append({
            "status": "Delivered • Package Received & Signed",
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
                    timeline_json = ?,
                    updated_at = ?
                WHERE id = ? OR order_number = ?
            """, (dest, json.dumps(timeline), now_str, order_id, order_id))
            conn.commit()

        return self.get_order_by_id(order_id)

    # 5. Return & Refund
    def mark_returned(self, order_id: str, reason: str = "Customer Return Initiated") -> Optional[Dict[str, Any]]:
        order = self.get_order_by_id(order_id)
        if not order:
            return None
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

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

        return self.get_order_by_id(order_id)

    def mark_refunded(self, order_id: str) -> Optional[Dict[str, Any]]:
        order = self.get_order_by_id(order_id)
        if not order:
            return None
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

        timeline = order.get("timeline", [])
        timeline.append({
            "status": "Payment Refunded to Original Payment Source",
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
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
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

        return self.get_order_by_id(order_id)

    def assign_courier(self, order_id: str, courier_name: str) -> Optional[Dict[str, Any]]:
        """Alias for courier_pickup to guarantee backward compatibility."""
        return self.courier_pickup(order_id, courier_name)

    def get_delivery_partners(self) -> List[Dict[str, Any]]:
        # Compute active shipment counts per partner dynamically
        with self._get_conn() as conn:
            cursor = conn.cursor()
            partners = []
            for p in DELIVERY_PARTNERS:
                cursor.execute("""
                    SELECT COUNT(*) as cnt FROM merchant_orders 
                    WHERE delivery_partner LIKE ? AND order_status IN ('PICKED_UP_BY_COURIER', 'IN_TRANSIT', 'OUT_FOR_DELIVERY')
                """, (f"%{p['code']}%",))
                cnt = cursor.fetchone()["cnt"]
                partner_copy = dict(p)
                partner_copy["active_shipments"] = cnt
                partners.append(partner_copy)
            return partners

    def get_shipments(self) -> List[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM merchant_orders 
                WHERE order_status IN ('READY_FOR_PICKUP', 'PICKED_UP_BY_COURIER', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED')
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
