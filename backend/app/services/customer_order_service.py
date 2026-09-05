import sqlite3
import os
import json
import uuid
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.core.timestamps import utcnow_iso
from app.services.audit_service import audit_service
from app.services.merchant_service import merchant_service, DB_PATH as MERCHANT_DB_PATH
from app.services.catalog_service import catalog_service
from app.services.pricing_service import apply_volume_pricing, calculate_volume_discount

DB_PATH = MERCHANT_DB_PATH

class CustomerOrderService:
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

            # 1. Saved Addresses Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS customer_addresses (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    full_name TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    address_line1 TEXT NOT NULL,
                    address_line2 TEXT,
                    city TEXT NOT NULL,
                    state TEXT NOT NULL,
                    pincode TEXT NOT NULL,
                    landmark TEXT,
                    is_default INTEGER DEFAULT 0,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """)

            # 2. Return Requests Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS customer_returns (
                    id TEXT PRIMARY KEY,
                    order_id TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    product_id TEXT,
                    reason TEXT NOT NULL,
                    details TEXT,
                    image_url TEXT,
                    return_status TEXT NOT NULL, -- REQUESTED, APPROVED, PICKUP_SCHEDULED, PICKUP_COMPLETED, REFUND_PROCESSING, REFUND_COMPLETED, REJECTED
                    refund_amount REAL NOT NULL,
                    pickup_date TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """)

            # 3. Refunds Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS customer_refunds (
                    id TEXT PRIMARY KEY,
                    return_id TEXT NOT NULL,
                    order_id TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    amount REAL NOT NULL,
                    payment_method TEXT NOT NULL,
                    status TEXT NOT NULL, -- INITIATED, PROCESSING, COMPLETED, FAILED
                    transaction_id TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """)

            # 4. Tracking Events Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS tracking_events (
                    id TEXT PRIMARY KEY,
                    order_id TEXT NOT NULL,
                    carrier_name TEXT NOT NULL,
                    tracking_id TEXT NOT NULL,
                    status TEXT NOT NULL,
                    location TEXT NOT NULL,
                    message TEXT NOT NULL,
                    timestamp TEXT NOT NULL
                )
            """)

            # 5. Customer Onboarding Tracking Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS customer_onboarding (
                    user_id TEXT PRIMARY KEY,
                    address_completed INTEGER DEFAULT 0,
                    payment_completed INTEGER DEFAULT 0,
                    payment_skipped INTEGER DEFAULT 0,
                    onboarding_completed INTEGER DEFAULT 0,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """)

            conn.commit()

            # Seed default addresses if empty
            cursor.execute("SELECT COUNT(*) FROM customer_addresses")
            if cursor.fetchone()[0] == 0:
                now_str = utcnow_iso()
                seed_addresses = [
                    (
                        "addr_001", "usr_customer_demo", "Akhil Jonnada", "+91 98765 43210",
                        "Flat 402, Prestige Tech Park Residency", "Aura Block, Outer Ring Road",
                        "Bengaluru", "Karnataka", "560103", "Opposite JP Morgan Campus", 1, now_str, now_str
                    ),
                    (
                        "addr_002", "usr_customer_demo", "Akhil Jonnada (HQ)", "+91 98765 43210",
                        "Floor 6, Razorpay Towers, Pavilion Mall", "Bannerghatta Main Road",
                        "Bengaluru", "Karnataka", "560029", "Near Dairy Circle", 0, now_str, now_str
                    ),
                    (
                        "addr_003", "usr_customer_demo", "Akhil Jonnada (Home)", "+91 98765 43210",
                        "House #42, Madhapur Main Road", "HiTech City Metro Corridor",
                        "Hyderabad", "Telangana", "500081", "Behind Cyber Towers", 0, now_str, now_str
                    )
                ]
                cursor.executemany("""
                    INSERT INTO customer_addresses 
                    (id, user_id, full_name, phone, address_line1, address_line2, city, state, pincode, landmark, is_default, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, seed_addresses)
                conn.commit()

    # =========================================================================
    # ADDRESS BOOK MANAGEMENT
    # =========================================================================
    def get_addresses(self, user_id: str = "usr_customer_demo") -> List[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM customer_addresses 
                WHERE user_id = ? 
                ORDER BY is_default DESC, created_at DESC
            """, (user_id,))
            rows = cursor.fetchall()
            return [dict(r) for r in rows]

    def add_address(self, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        addr_id = f"addr_{uuid.uuid4().hex[:8]}"
        now_str = utcnow_iso()
        is_default = 1 if data.get("is_default") else 0

        with self._get_conn() as conn:
            cursor = conn.cursor()
            if is_default == 1:
                cursor.execute("UPDATE customer_addresses SET is_default = 0 WHERE user_id = ?", (user_id,))

            cursor.execute("""
                INSERT INTO customer_addresses
                (id, user_id, full_name, phone, address_line1, address_line2, city, state, pincode, landmark, is_default, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                addr_id, user_id,
                data.get("full_name", "Valued Customer"),
                data.get("phone", "+91 98765 43210"),
                data.get("address_line1", ""),
                data.get("address_line2", ""),
                data.get("city", "Bengaluru"),
                data.get("state", "Karnataka"),
                data.get("pincode", "560001"),
                data.get("landmark", ""),
                is_default,
                now_str, now_str
            ))
            conn.commit()

        audit_service.log_audit(
            action="ADDRESS_ADDED",
            entity_type="ADDRESS",
            entity_id=addr_id,
            user_id=user_id,
            user_name=data.get("full_name"),
            role="Customer",
            old_value=None,
            new_value=data
        )
        return self.get_address_by_id(addr_id, user_id)

    def update_address(self, addr_id: str, user_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        existing = self.get_address_by_id(addr_id, user_id)
        if not existing:
            return None

        now_str = utcnow_iso()
        is_default = 1 if data.get("is_default") else 0

        with self._get_conn() as conn:
            cursor = conn.cursor()
            if is_default == 1:
                cursor.execute("UPDATE customer_addresses SET is_default = 0 WHERE user_id = ?", (user_id,))

            cursor.execute("""
                UPDATE customer_addresses SET
                    full_name = ?, phone = ?, address_line1 = ?, address_line2 = ?,
                    city = ?, state = ?, pincode = ?, landmark = ?, is_default = ?, updated_at = ?
                WHERE id = ? AND user_id = ?
            """, (
                data.get("full_name", existing["full_name"]),
                data.get("phone", existing["phone"]),
                data.get("address_line1", existing["address_line1"]),
                data.get("address_line2", existing.get("address_line2", "")),
                data.get("city", existing["city"]),
                data.get("state", existing["state"]),
                data.get("pincode", existing["pincode"]),
                data.get("landmark", existing.get("landmark", "")),
                is_default,
                now_str,
                addr_id, user_id
            ))
            conn.commit()

        audit_service.log_audit(
            action="ADDRESS_UPDATED",
            entity_type="ADDRESS",
            entity_id=addr_id,
            user_id=user_id,
            role="Customer",
            old_value=existing,
            new_value=data
        )
        return self.get_address_by_id(addr_id, user_id)

    def delete_address(self, addr_id: str, user_id: str) -> bool:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM customer_addresses WHERE id = ? AND user_id = ?", (addr_id, user_id))
            conn.commit()
            return cursor.rowcount > 0

    def set_default_address(self, addr_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE customer_addresses SET is_default = 0 WHERE user_id = ?", (user_id,))
            cursor.execute("UPDATE customer_addresses SET is_default = 1, updated_at = ? WHERE id = ? AND user_id = ?", (utcnow_iso(), addr_id, user_id))
            conn.commit()
        return self.get_address_by_id(addr_id, user_id)

    def get_address_by_id(self, addr_id: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            if user_id:
                cursor.execute("SELECT * FROM customer_addresses WHERE id = ? AND user_id = ?", (addr_id, user_id))
            else:
                cursor.execute("SELECT * FROM customer_addresses WHERE id = ?", (addr_id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    # =========================================================================
    # CUSTOMER ONBOARDING JOURNEY & PREREQUISITES TRACKING
    # =========================================================================
    def get_onboarding_status(self, user_id: str) -> Dict[str, Any]:
        """
        Check customer onboarding status and AutoPay prerequisites:
        Prerequisite 1: At least 1 delivery address exists in customer_addresses.
        Prerequisite 2: At least 1 payment method / mandate exists.
        Prerequisite 3: At least 1 completed order exists.
        AutoPay is strictly locked until all 3 prerequisites are satisfied.
        """
        addresses = self.get_addresses(user_id=user_id)
        orders = self.get_customer_orders(user_id=user_id)
        
        # Check mandates / payment methods
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM customer_mandates WHERE user_id = ? AND status = 'ACTIVE'", (user_id,))
            mandates = [dict(r) for r in cursor.fetchall()]

            cursor.execute("SELECT * FROM customer_onboarding WHERE user_id = ?", (user_id,))
            ob_row = cursor.fetchone()
            ob_data = dict(ob_row) if ob_row else None

        has_address = len(addresses) > 0
        has_payment = len(mandates) > 0
        has_order = len(orders) > 0
        payment_skipped = bool(ob_data and ob_data.get("payment_skipped"))
        is_onboarding_completed = bool(
            (ob_data and ob_data.get("onboarding_completed")) or 
            (has_address and (has_payment or payment_skipped))
        )

        autopay_eligible = bool(has_address and has_payment and has_order)

        prerequisites = {
            "address": {
                "met": has_address,
                "count": len(addresses),
                "label": "Delivery Address",
                "detail": f"{len(addresses)} saved address(es)" if has_address else "No delivery address added yet",
            },
            "payment": {
                "met": has_payment,
                "count": len(mandates),
                "label": "Payment Method Authorization",
                "detail": f"{mandates[0]['bank_name']} connected" if has_payment else "No payment method on file",
            },
            "order": {
                "met": has_order,
                "count": len(orders),
                "label": "First Completed Order",
                "detail": f"{len(orders)} order(s) placed" if has_order else "No purchase history available yet",
            },
        }

        completed_prereqs = sum(1 for p in prerequisites.values() if p["met"])

        return {
            "user_id": user_id,
            "has_address": has_address,
            "addresses_count": len(addresses),
            "has_payment_method": has_payment,
            "payment_methods_count": len(mandates),
            "payment_skipped": payment_skipped,
            "has_completed_order": has_order,
            "orders_count": len(orders),
            "is_onboarding_completed": is_onboarding_completed,
            "autopay_eligible": autopay_eligible,
            "prerequisites": prerequisites,
            "completed_prerequisites_count": completed_prereqs,
            "total_prerequisites": 3,
            "progress_percentage": round((completed_prereqs / 3.0) * 100)
        }

    def complete_onboarding_address(self, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Save address as default and advance onboarding step."""
        data["is_default"] = 1
        addr = self.add_address(user_id=user_id, data=data)
        now_str = utcnow_iso()

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO customer_onboarding (user_id, address_completed, payment_completed, payment_skipped, onboarding_completed, created_at, updated_at)
                VALUES (?, 1, 0, 0, 0, ?, ?)
                ON CONFLICT(user_id) DO UPDATE SET address_completed = 1, updated_at = ?
            """, (user_id, now_str, now_str, now_str))
            conn.commit()

        status = self.get_onboarding_status(user_id)
        return {
            "success": True,
            "address": addr,
            "onboarding_status": status,
            "next_step": "/onboarding/payment"
        }

    def complete_onboarding_payment(self, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Save payment method or record skipped payment setup."""
        now_str = utcnow_iso()
        skipped = bool(data.get("skipped"))

        from app.services.ai_autopay_service import ai_autopay_service

        mandate = None
        if not skipped and (data.get("account_or_vpa") or data.get("account_number") or data.get("card_number")):
            mandate = ai_autopay_service.add_mandate(user_id=user_id, data=data)

        with self._get_conn() as conn:
            cursor = conn.cursor()
            if skipped:
                cursor.execute("""
                    INSERT INTO customer_onboarding (user_id, address_completed, payment_completed, payment_skipped, onboarding_completed, created_at, updated_at)
                    VALUES (?, 1, 0, 1, 1, ?, ?)
                    ON CONFLICT(user_id) DO UPDATE SET payment_skipped = 1, onboarding_completed = 1, updated_at = ?
                """, (user_id, now_str, now_str, now_str))
            else:
                cursor.execute("""
                    INSERT INTO customer_onboarding (user_id, address_completed, payment_completed, payment_skipped, onboarding_completed, created_at, updated_at)
                    VALUES (?, 1, 1, 0, 1, ?, ?)
                    ON CONFLICT(user_id) DO UPDATE SET payment_completed = 1, onboarding_completed = 1, updated_at = ?
                """, (user_id, now_str, now_str, now_str))
            conn.commit()

        status = self.get_onboarding_status(user_id)
        return {
            "success": True,
            "skipped": skipped,
            "mandate": mandate,
            "onboarding_status": status,
            "next_step": "/"
        }

    # =========================================================================
    # MULTI-STEP CHECKOUT & ORDER CREATION
    # =========================================================================
    def process_checkout(self, user_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes 5-step Amazon/Flipkart checkout:
        - Address Snapshot
        - Delivery Option (Standard, Express, Same-Day)
        - Review & GST computation
        - Payment verification
        - Order ID generation: RCM-2026-XXXXXX
        """
        now_dt = datetime.now()
        now_str = utcnow_iso()
        order_seq = random.randint(100000, 999999)
        order_number = f"RCM-2026-{order_seq}"
        order_id = f"ord_{uuid.uuid4().hex[:10]}"

        # Delivery option fees & speed
        delivery_option = payload.get("delivery_option", "STANDARD").upper()
        if delivery_option == "EXPRESS":
            delivery_fee = 99.0
            eta_days = 2
            eta_label = (now_dt + timedelta(days=2)).strftime("%a, %b %d")
        elif delivery_option == "SAME_DAY":
            delivery_fee = 199.0
            eta_days = 0
            eta_label = "Today, by 9:00 PM"
        else:
            delivery_option = "STANDARD"
            delivery_fee = 0.0
            eta_days = 4
            eta_label = (now_dt + timedelta(days=4)).strftime("%a, %b %d")

        # Address snapshot
        address_data = payload.get("shipping_address", {})
        if isinstance(address_data, str):
            ship_addr_str = address_data
            address_snapshot = {"formatted": address_data}
        else:
            ship_addr_str = f"{address_data.get('address_line1', '')}, {address_data.get('address_line2', '')}, {address_data.get('city', '')}, {address_data.get('state', '')} - {address_data.get('pincode', '')}".strip(" ,")
            address_snapshot = address_data

        # Items & Calculations
        items = payload.get("items", [])
        if not items:
            items = [{
                "product_id": "HW-POS-001",
                "sku": "SKU-POS-SMART-PRO",
                "name": "Razorpay Smart POS Pro",
                "price": 14999.0,
                "quantity": 1,
                "image_url": "https://images.unsplash.com/photo-1556742049-0a67c55cb211?w=300&q=80"
            }]

        items_clean = []
        raw_subtotal = 0.0
        total_volume_discount = 0.0

        for it in items:
            p_id = it.get("product_id") or it.get("id") or "HW-POS-001"
            name = it.get("name") or it.get("product_name") or "Enterprise POS Device"
            price = float(it.get("price") or it.get("unit_price") or 0.0)
            qty = int(it.get("quantity") or it.get("qty") or 1)
            img = it.get("image_url") or it.get("image") or "https://images.unsplash.com/photo-1556742049-0a67c55cb211?w=300&q=80"
            sku = it.get("sku") or f"SKU-{str(p_id).upper()[:10]}"

            # Detect Volume Tier Pricing
            product = catalog_service.get_product_by_id(p_id)
            if product:
                pricing = apply_volume_pricing(product, qty)
                tier_used = pricing.get("tier_used")
                item_discount = float(pricing.get("discount_amount", 0.0))
                eff_price = float(pricing.get("effective_price", price))
                line_tot = float(pricing.get("effective_subtotal", round(price * qty, 2)))
            else:
                tier_used = it.get("tier_used")
                item_discount = float(it.get("discount_amount", 0.0))
                eff_price = float(it.get("effective_price", price))
                line_tot = round(eff_price * qty, 2)

            raw_subtotal += line_tot
            total_volume_discount += item_discount

            items_clean.append({
                "product_id": p_id,
                "sku": sku,
                "name": name,
                "price": price,
                "quantity": qty,
                "image_url": img,
                "subtotal": round(line_tot, 2),
                "tier_used": tier_used,
                "discount_amount": item_discount,
                "effective_price": eff_price
            })

        coupon_discount_amount = float(payload.get("discount", 0.0))
        coupon_code = payload.get("coupon_code")
        discounted_subtotal = max(0.0, raw_subtotal - coupon_discount_amount)
        # GST is embedded within the catalog selling price (18% ITC Eligible)
        tax_amount = round(discounted_subtotal - (discounted_subtotal / 1.18), 2)
        total_amount = round(discounted_subtotal + delivery_fee, 2)
        discount_amount = round(total_volume_discount + coupon_discount_amount, 2)

        # Payment details
        payment_method = payload.get("payment_method", "UPI").upper()
        payment_id = payload.get("payment_id") or f"pay_rzp_{uuid.uuid4().hex[:12]}"
        
        # Delivery partner allocation
        carriers = [
            ("Delhivery Express", "DELHIVERY"),
            ("Blue Dart Priority", "BLUEDART"),
            ("XpressBees Courier", "XPRESSBEES"),
            ("Ekart Logistics", "EKART"),
            ("Shadowfax Prime", "SHADOWFAX")
        ]
        chosen_carrier, carrier_code = random.choice(carriers)
        awb = f"AWB-{carrier_code[:4]}-{random.randint(10000000, 99999999)}"
        tracking_id = f"TRK-{order_number[-6:]}"

        # Timeline initialization
        timeline = [
            {"status": "Order Placed", "time": now_str, "location": "RazorCommerce Online Store", "completed": True},
            {"status": "Payment Confirmed", "time": now_str, "location": f"Razorpay Payment Gateway ({payment_method})", "completed": True},
            {"status": "Merchant Accepted", "time": (now_dt + timedelta(minutes=15)).strftime("%Y-%m-%dT%H:%M:%SZ"), "location": "Central Fulfillment Hub", "completed": False},
            {"status": "Packed", "time": None, "location": "Warehouse Packing Bay 2", "completed": False},
            {"status": "Courier Assigned", "time": None, "location": f"{chosen_carrier} Staging", "completed": False},
            {"status": "Shipped", "time": None, "location": f"{chosen_carrier} Sorting Center", "completed": False},
            {"status": "Out For Delivery", "time": None, "location": f"{address_snapshot.get('city', 'Local')} Delivery Hub", "completed": False},
            {"status": "Delivered", "time": None, "location": ship_addr_str, "completed": False}
        ]

        cust_name = address_data.get("full_name") or payload.get("customer_name")
        cust_email = payload.get("customer_email")
        cust_phone = address_data.get("phone") or payload.get("customer_phone")

        if not cust_name or not cust_email:
            try:
                from app.services.auth_service import auth_service
                u = auth_service.get_user_by_id_or_email(user_id)
                if u:
                    cust_name = cust_name or u.name
                    cust_email = cust_email or u.email
            except Exception:
                pass

        cust_name = cust_name or "Valued Customer"
        cust_email = cust_email or "customer@example.com"
        cust_phone = cust_phone or "+91 98765 43210"

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO merchant_orders
                (id, order_number, customer_id, customer_name, customer_email, customer_phone, shipping_address, items_json, subtotal, tax, discount, total_amount, currency, payment_status, order_status, delivery_partner, awb_number, tracking_id, current_location, estimated_delivery, timeline_json, payment_id, payment_method, reconciled, order_placed_at, payment_initiated_at, payment_completed_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'INR', 'PAID', 'PAYMENT_RECEIVED', ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)
            """, (
                order_id, order_number, user_id, cust_name, cust_email, cust_phone,
                ship_addr_str, json.dumps(items_clean), raw_subtotal, tax_amount, discount_amount, total_amount,
                chosen_carrier, awb, tracking_id, "Central Warehouse (Pre-Packing)", eta_label,
                json.dumps(timeline), payment_id, payment_method,
                now_str, now_str, now_str, now_str, now_str
            ))

            # Initial tracking event
            cursor.execute("""
                INSERT INTO tracking_events
                (id, order_id, carrier_name, tracking_id, status, location, message, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                f"trk_evt_{uuid.uuid4().hex[:8]}", order_id, chosen_carrier, tracking_id,
                "ORDER_CONFIRMED", "RazorCommerce Central Hub",
                f"Order confirmed and scheduled for fulfillment via {chosen_carrier}.", now_str
            ))
            conn.commit()

        # Audit event
        audit_service.log_audit(
            action="ORDER_PLACED",
            entity_type="ORDER",
            entity_id=order_id,
            user_id=user_id,
            user_name=cust_name,
            role="Customer",
            old_value=None,
            new_value={
                "order_number": order_number,
                "total_amount": total_amount,
                "items_count": len(items_clean),
                "delivery_option": delivery_option,
                "payment_method": payment_method
            }
        )

        return self.get_order_details(order_id)

    # =========================================================================
    # ORDERS LISTING, DETAILS & TRACKING
    # =========================================================================
    def get_customer_orders(
        self, 
        user_id: Optional[str] = None, 
        customer_email: Optional[str] = None,
        status: str = "ALL", 
        search: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        # Unauthenticated / guest visitors have zero customer orders - strict zero data leak
        if not user_id and not customer_email:
            return []

        identifiers = []
        if user_id:
            identifiers.append(user_id)
        if customer_email:
            identifiers.append(customer_email.lower())

        # Expand identifiers using auth_service if possible
        try:
            from app.services.auth_service import auth_service
            lookup_val = customer_email or user_id
            u = auth_service.get_user_by_id_or_email(lookup_val) if lookup_val else None
            if u:
                if u.id not in identifiers:
                    identifiers.append(u.id)
                if u.email.lower() not in identifiers:
                    identifiers.append(u.email.lower())
        except Exception:
            pass

        # Demo persona expansion for verified demo customer
        if "usr_customer_demo" in identifiers or "customer@acme.com" in identifiers or "usr_customer" in identifiers:
            for demo_id in ["usr_customer_demo", "customer@acme.com", "usr_customer"]:
                if demo_id not in identifiers:
                    identifiers.append(demo_id)

        placeholders = ",".join(["?"] * len(identifiers))
        with self._get_conn() as conn:
            cursor = conn.cursor()
            query = f"SELECT * FROM merchant_orders WHERE (customer_id IN ({placeholders}) OR LOWER(customer_email) IN ({placeholders}))"
            params: List[Any] = list(identifiers) + [x.lower() for x in identifiers]

            if status and status.upper() != "ALL":
                st = status.upper()
                if st == "PROCESSING":
                    query += " AND order_status IN ('PAYMENT_RECEIVED', 'PENDING_CONFIRMATION', 'ACCEPTED', 'PICKING')"
                elif st == "PACKED":
                    query += " AND order_status IN ('PACKED', 'READY_FOR_PICKUP')"
                elif st == "SHIPPED":
                    query += " AND order_status IN ('PICKED_UP_BY_COURIER', 'IN_TRANSIT', 'OUT_FOR_DELIVERY')"
                elif st == "DELIVERED":
                    query += " AND order_status = 'DELIVERED'"
                elif st == "CANCELLED":
                    query += " AND order_status IN ('CANCELLED', 'REJECTED')"
                elif st == "RETURNED":
                    query += " AND order_status = 'RETURNED'"
                elif st == "REFUNDED":
                    query += " AND order_status = 'REFUNDED'"
                else:
                    query += " AND order_status = ?"
                    params.append(st)

            if search and search.strip():
                query += " AND (order_number LIKE ? OR id LIKE ? OR customer_name LIKE ? OR tracking_id LIKE ? OR awb_number LIKE ? OR items_json LIKE ?)"
                term = f"%{search.strip()}%"
                params.extend([term, term, term, term, term, term])

            query += " ORDER BY created_at DESC"
            cursor.execute(query, params)
            rows = cursor.fetchall()

            orders = []
            for r in rows:
                d = dict(r)
                d["items"] = json.loads(d["items_json"]) if d.get("items_json") else []
                d["timeline"] = json.loads(d["timeline_json"]) if d.get("timeline_json") else []
                
                # Check return eligibility (within 15 days of delivery or order date)
                d["is_return_eligible"] = d.get("order_status") in ("DELIVERED", "OUT_FOR_DELIVERY", "IN_TRANSIT")
                d["return_window_days"] = 15
                
                # Fetch any return request
                cursor.execute("SELECT * FROM customer_returns WHERE order_id = ? ORDER BY created_at DESC LIMIT 1", (d["id"],))
                ret_row = cursor.fetchone()
                d["return_request"] = dict(ret_row) if ret_row else None
                orders.append(d)

            return orders

    def get_order_details(self, order_id: str) -> Optional[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM merchant_orders WHERE id = ? OR order_number = ? OR tracking_id = ? OR awb_number = ?", (order_id, order_id, order_id, order_id))
            row = cursor.fetchone()
            if not row:
                fallback = merchant_service.get_order_by_id(order_id)
                if fallback:
                    return fallback
                return None

            d = dict(row)
            d["items"] = json.loads(d["items_json"]) if d.get("items_json") else []
            d["timeline"] = json.loads(d["timeline_json"]) if d.get("timeline_json") else []
            d["is_return_eligible"] = d.get("order_status") in ("DELIVERED", "OUT_FOR_DELIVERY", "IN_TRANSIT")
            d["return_window_days"] = 15

            # Merchant profile info
            d["merchant"] = {
                "name": "Acme Direct Hardware & Fintech Systems",
                "gstin": "29ABCDE1234F1Z5",
                "support_email": "support@acmedirect.in",
                "support_phone": "+91 80 4719 3300",
                "warehouse_address": "RazorCommerce Hub, Electronic City Phase 1, Bangalore 560100"
            }

            # Return status
            cursor.execute("SELECT * FROM customer_returns WHERE order_id = ? ORDER BY created_at DESC LIMIT 1", (d["id"],))
            ret_row = cursor.fetchone()
            d["return_request"] = dict(ret_row) if ret_row else None

            # Refund info
            if d["return_request"]:
                cursor.execute("SELECT * FROM customer_refunds WHERE return_id = ?", (d["return_request"]["id"],))
                ref_row = cursor.fetchone()
                d["refund"] = dict(ref_row) if ref_row else None
            else:
                d["refund"] = None

            return d

    def get_order_tracking(self, order_id: str) -> Optional[Dict[str, Any]]:
        order = self.get_order_details(order_id)
        if not order:
            return None

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM tracking_events WHERE order_id = ? ORDER BY timestamp ASC", (order["id"],))
            events = [dict(r) for r in cursor.fetchall()]

        # Generate realistic carrier tracking checkpoints if events are few
        carrier_name = order.get("delivery_partner") or "Delhivery Express"
        tracking_id = order.get("tracking_id") or f"TRK-{order['id'][-6:]}"
        awb = order.get("awb_number") or f"AWB-{random.randint(10000000, 99999999)}"

        return {
            "order_id": order["id"],
            "order_number": order.get("order_number") or order["id"],
            "status": order.get("order_status"),
            "estimated_delivery": order.get("estimated_delivery") or "Within 2-4 Business Days",
            "current_location": order.get("current_location") or "In Transit to Destination Hub",
            "carrier": {
                "name": carrier_name,
                "awb_number": awb,
                "tracking_id": tracking_id,
                "tracking_url": f"https://track.razorcommerce.in/shipment/{awb}",
                "support_phone": "1800-102-3456",
                "badge_color": "blue"
            },
            "milestones": [
                {"key": "placed", "label": "Order Placed", "timestamp": order.get("order_placed_at") or order.get("created_at"), "completed": True},
                {"key": "payment", "label": "Payment Confirmed", "timestamp": order.get("payment_completed_at"), "completed": True},
                {"key": "accepted", "label": "Merchant Accepted", "timestamp": order.get("merchant_accepted_at"), "completed": bool(order.get("merchant_accepted_at"))},
                {"key": "packed", "label": "Packed & Ready", "timestamp": order.get("packed_at"), "completed": bool(order.get("packed_at"))},
                {"key": "courier", "label": "Courier Assigned", "timestamp": order.get("courier_assigned_at"), "completed": bool(order.get("courier_assigned_at"))},
                {"key": "shipped", "label": "In Transit", "timestamp": order.get("shipped_at"), "completed": bool(order.get("shipped_at"))},
                {"key": "out_for_delivery", "label": "Out For Delivery", "timestamp": order.get("out_for_delivery_at"), "completed": bool(order.get("out_for_delivery_at"))},
                {"key": "delivered", "label": "Delivered", "timestamp": order.get("delivered_at"), "completed": bool(order.get("delivered_at"))}
            ],
            "live_events": events
        }

    # =========================================================================
    # RETURN & REFUND MANAGEMENT
    # =========================================================================
    def create_return_request(self, order_id: str, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        order = self.get_order_details(order_id)
        if not order:
            raise ValueError(f"Order '{order_id}' not found")

        ret_id = f"ret_{uuid.uuid4().hex[:8]}"
        now_dt = datetime.now()
        now_str = utcnow_iso()
        pickup_date = (now_dt + timedelta(days=2)).strftime("%a, %b %d")

        reason = data.get("reason", "Defective or damaged product")
        details = data.get("details", "Item condition did not match expectations.")
        img_url = data.get("image_url")
        refund_amount = float(data.get("refund_amount") or order.get("total_amount") or 0.0)

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO customer_returns
                (id, order_id, user_id, product_id, reason, details, image_url, return_status, refund_amount, pickup_date, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'REQUESTED', ?, ?, ?, ?)
            """, (
                ret_id, order["id"], user_id,
                data.get("product_id"), reason, details, img_url,
                refund_amount, pickup_date, now_str, now_str
            ))

            # Update order status to RETURN_REQUESTED / RETURNED
            cursor.execute("UPDATE merchant_orders SET order_status = 'RETURNED', updated_at = ? WHERE id = ?", (now_str, order["id"]))

            # Create initiated refund record
            ref_id = f"rfnd_{uuid.uuid4().hex[:8]}"
            cursor.execute("""
                INSERT INTO customer_refunds
                (id, return_id, order_id, user_id, amount, payment_method, status, transaction_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, 'PROCESSING', ?, ?, ?)
            """, (
                ref_id, ret_id, order["id"], user_id, refund_amount,
                order.get("payment_method") or "ORIGINAL_PAYMENT_SOURCE",
                f"rfnd_rzp_{uuid.uuid4().hex[:10]}", now_str, now_str
            ))
            conn.commit()

        audit_service.log_audit(
            action="RETURN_REQUESTED",
            entity_type="RETURN",
            entity_id=ret_id,
            user_id=user_id,
            role="Customer",
            old_value={"order_status": order.get("order_status")},
            new_value={"return_id": ret_id, "reason": reason, "refund_amount": refund_amount, "status": "REQUESTED"}
        )

        return self.get_order_details(order_id)

    # =========================================================================
    # CUSTOMER DASHBOARD WIDGETS
    # =========================================================================
    def get_dashboard_widgets(self, user_id: Optional[str] = None, customer_email: Optional[str] = None) -> Dict[str, Any]:
        if not user_id and not customer_email:
            return {
                "total_orders": 0,
                "in_transit_count": 0,
                "returns_count": 0,
                "saved_addresses_count": 0,
                "recent_orders": [],
                "in_transit_orders": [],
                "active_returns": [],
                "saved_addresses": []
            }

        with self._get_conn() as conn:
            cursor = conn.cursor()

            # 1. Recent Orders (limit 5)
            orders = self.get_customer_orders(user_id=user_id, customer_email=customer_email, status="ALL")
            recent_orders = orders[:5]

            # 2. Orders In Transit
            in_transit = [o for o in orders if o.get("order_status") in ("PICKED_UP_BY_COURIER", "IN_TRANSIT", "OUT_FOR_DELIVERY")]

            # 3. Active Returns & Refunds
            cursor.execute("SELECT * FROM customer_returns WHERE user_id = ? ORDER BY created_at DESC LIMIT 5", (user_id or "",))
            returns = [dict(r) for r in cursor.fetchall()]

            # 4. Saved Addresses
            addresses = self.get_addresses(user_id=user_id) if user_id else []

        return {
            "total_orders": len(orders),
            "in_transit_count": len(in_transit),
            "returns_count": len(returns),
            "saved_addresses_count": len(addresses),
            "recent_orders": recent_orders,
            "in_transit_orders": in_transit,
            "active_returns": returns,
            "saved_addresses": addresses
        }

    # =========================================================================
    # ENTERPRISE GST TAX INVOICE GENERATION
    # =========================================================================
    @staticmethod
    def number_to_words_inr(num: float) -> str:
        """Converts currency amount to Indian numbering words (Crores, Lakhs, Thousands, Rupees)."""
        ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
                "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
                "Seventeen", "Eighteen", "Nineteen"]
        tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

        def two_digits(n: int) -> str:
            if n == 0:
                return ""
            if n < 20:
                return ones[n]
            return tens[n // 10] + (" " + ones[n % 10] if n % 10 != 0 else "")

        def three_digits(n: int) -> str:
            h = n // 100
            r = n % 100
            res = ""
            if h > 0:
                res += ones[h] + " Hundred"
                if r > 0:
                    res += " and "
            if r > 0:
                res += two_digits(r)
            return res

        amt = round(float(num), 2)
        integer_part = int(amt)
        paise = int(round((amt - integer_part) * 100))

        if integer_part == 0 and paise == 0:
            return "INR Zero Only"

        crores = integer_part // 10000000
        integer_part %= 10000000

        lakhs = integer_part // 100000
        integer_part %= 100000

        thousands = integer_part // 1000
        integer_part %= 1000

        hundreds = integer_part

        parts = []
        if crores > 0:
            parts.append(f"{two_digits(crores)} Crore")
        if lakhs > 0:
            parts.append(f"{two_digits(lakhs)} Lakh")
        if thousands > 0:
            parts.append(f"{two_digits(thousands)} Thousand")
        if hundreds > 0:
            parts.append(three_digits(hundreds))

        words = "INR " + " ".join(parts).strip()
        if paise > 0:
            words += f" and {two_digits(paise)} Paise"
        words += " Only"
        return words

    def generate_tax_invoice(self, order_id: str) -> Dict[str, Any]:
        """
        Generates Amazon/Flipkart/Myntra grade GST Tax Invoice with HSN/SAC breakdowns,
        CGST/SGST/IGST computations, reverse charge declarations, and legal compliance metadata.
        """
        order = self.get_order_details(order_id)
        if not order:
            raise ValueError(f"Order '{order_id}' not found")

        # Invoice number retrieval / generation with persistence
        from app.services.merchant_service import merchant_service
        order_num = order.get("order_number") or order_id
        invoice_number = merchant_service.get_or_create_invoice_number(order.get("id") or order_id)

        # Invoice Date
        created_at_raw = order.get("order_placed_at") or order.get("created_at") or utcnow_iso()
        try:
            inv_dt = datetime.fromisoformat(created_at_raw.replace("Z", "+00:00"))
            invoice_date_formatted = inv_dt.strftime("%d-%b-%Y")
            invoice_time_formatted = inv_dt.strftime("%H:%M:%S UTC")
        except Exception:
            invoice_date_formatted = datetime.now().strftime("%d-%b-%Y")
            invoice_time_formatted = datetime.now().strftime("%H:%M:%S UTC")

        # HSN code catalog mapping
        hsn_catalog = {
            "HW-POS-001": ("84713010", "Point of Sale Micro-Terminal Pro"),
            "HW-SOUND-002": ("85176290", "Soundbox 4G Voice Payment Notifier"),
            "HW-QR-003": ("39269099", "Smart All-in-One Acrylic Dynamic QR Stand"),
            "HW-READER-004": ("84719000", "Contactless NFC & EMV Card Reader"),
            "HW-KIOSK-005": ("84714190", "Self-Checkout Smart Interactive Kiosk"),
            "ACC-ROLL-006": ("48119099", "Thermal POS Receipt Paper Rolls (Pack of 20)")
        }

        # Determine Intra-state vs Inter-state (Seller State: Karnataka / 29)
        seller_state_code = "29"
        seller_state_name = "Karnataka"
        cust_addr_str = order.get("shipping_address", "")
        cust_state = "Karnataka"
        # Simple heuristic or default to Karnataka
        known_states = [
            ("Maharashtra", "27"), ("Delhi", "07"), ("Tamil Nadu", "33"),
            ("Telangana", "36"), ("Gujarat", "24"), ("Uttar Pradesh", "09"),
            ("West Bengal", "19"), ("Kerala", "32"), ("Karnataka", "29")
        ]
        for sname, scode in known_states:
            if sname.lower() in cust_addr_str.lower():
                cust_state = sname
                break

        is_intra_state = (cust_state.lower() == seller_state_name.lower())

        # Process Line Items
        items = order.get("items", [])
        invoice_items = []
        tot_taxable_value = 0.0
        tot_cgst = 0.0
        tot_sgst = 0.0
        tot_igst = 0.0

        for idx, item in enumerate(items, 1):
            p_id = item.get("product_id") or "HW-POS-001"
            hsn_code, default_desc = hsn_catalog.get(p_id, ("84713010", "Fintech Payment Terminal"))
            qty = int(item.get("quantity") or 1)
            gross_unit_price = float(item.get("price") or 0.0)
            gross_total = gross_unit_price * qty
            
            # Taxable value computation (assuming 18% inclusive or 18% standard)
            # Standard e-comm: Gross total / 1.18 = Taxable value
            taxable_val = round(gross_total / 1.18, 2)
            unit_taxable = round(taxable_val / qty, 2)
            gst_total_line = round(gross_total - taxable_val, 2)

            if is_intra_state:
                cgst_rate = 9.0
                cgst_amt = round(gst_total_line / 2, 2)
                sgst_rate = 9.0
                sgst_amt = round(gst_total_line - cgst_amt, 2)
                igst_rate = 0.0
                igst_amt = 0.0
            else:
                cgst_rate = 0.0
                cgst_amt = 0.0
                sgst_rate = 0.0
                sgst_amt = 0.0
                igst_rate = 18.0
                igst_amt = gst_total_line

            line_total = gross_total
            tot_taxable_value += taxable_val
            tot_cgst += cgst_amt
            tot_sgst += sgst_amt
            tot_igst += igst_amt

            # MRP and savings calculations
            mrp = round(gross_unit_price * 1.15, 2)
            unit_discount = round(mrp - gross_unit_price, 2)
            line_savings = round(unit_discount * qty, 2)
            savings_pct = round((unit_discount / mrp) * 100) if mrp > 0 else 0

            invoice_items.append({
                "sl_no": idx,
                "product_id": p_id,
                "sku": item.get("sku") or f"SKU-{p_id}",
                "description": item.get("name") or default_desc,
                "hsn_sac": hsn_code,
                "quantity": qty,
                "mrp": mrp,
                "gross_unit_price": gross_unit_price,
                "unit_discount": unit_discount,
                "line_savings": line_savings,
                "savings_pct": savings_pct,
                "unit_taxable_price": unit_taxable,
                "discount": 0.0,
                "taxable_value": taxable_val,
                "gst_rate_pct": 18.0,
                "cgst_rate": cgst_rate,
                "cgst_amount": cgst_amt,
                "sgst_rate": sgst_rate,
                "sgst_amount": sgst_amt,
                "igst_rate": igst_rate,
                "igst_amount": igst_amt,
                "line_total": line_total
            })

        subtotal = float(order.get("subtotal") or (tot_taxable_value + tot_cgst + tot_sgst + tot_igst))
        discount_amount = float(order.get("discount") or 0.0)
        delivery_fee = 0.0
        # Check delivery fee from total minus subtotal + discount if applicable
        calculated_grand_total = float(order.get("total_amount") or (subtotal - discount_amount))
        diff = round(calculated_grand_total - (subtotal - discount_amount), 2)
        if diff in (99.0, 199.0):
            delivery_fee = diff

        grand_total = calculated_grand_total
        amount_in_words = self.number_to_words_inr(grand_total)

        qr_verification_url = f"https://razorcommerce.internal/verify/invoice?no={invoice_number}&gstin=29ABCDE1234F1Z5&amt={grand_total}&dt={invoice_date_formatted}&sec=SEC_RZP_{order_id[-6:]}"


        invoice_payload = {
            "invoice_metadata": {
                "invoice_number": invoice_number,
                "invoice_date": invoice_date_formatted,
                "invoice_time": invoice_time_formatted,
                "order_number": order_num,
                "order_id": order.get("id"),
                "order_date": invoice_date_formatted,
                "place_of_supply": f"{cust_state} (State Code: 29)",
                "reverse_charge": "No",
                "invoice_title": "TAX INVOICE / BILL OF SUPPLY / CASH MEMORANDUM",
                "nature_of_transaction": "B2C E-Commerce Supply of Goods",
                "qr_verification_url": qr_verification_url,
                "generated_timestamp": utcnow_iso()
            },
            "marketplace": {
                "name": "RazorCommerce Network",
                "tagline": "India's Premier Enterprise Fintech Marketplace",
                "logo_url": "/icons/razorpay-logo.svg",
                "website": "https://razorcommerce.internal",
                "support_email": "care@razorcommerce.in",
                "toll_free": "1800-120-RAZOR (72967)"
            },
            "seller_details": {
                "legal_name": "Acme Direct Hardware & Fintech Systems Pvt. Ltd.",
                "trade_name": "Acme Direct Commerce Hub",
                "gstin": "29ABCDE1234F1Z5",
                "pan": "ABCDE1234F",
                "cin": "U72200KA2021PTC145678",
                "state_code": "29",
                "state_name": "Karnataka",
                "registered_address": "Ground & 1st Floor, Tower B, Electronic City Phase 1, Hosur Road, Bengaluru, Karnataka 560100, India",
                "warehouse_address": "RazorCommerce Mega Fulfillment Center BLR-4, Survey #88/2, Electronic City, Bengaluru 560100",
                "contact_email": "support@acmedirect.in",
                "contact_phone": "+91 80 4719 3300",
                "authorized_signatory": {
                    "name": "Authorized Finance Controller",
                    "designation": "Head of Tax Compliance & Accounting",
                    "digital_stamp": "DIGITALLY SIGNED & VERIFIED",
                    "signed_date": invoice_date_formatted
                }
            },
            "customer_details": {
                "customer_name": order.get("customer_name") or "Akhil Jonnada",
                "customer_email": order.get("customer_email") or "akhil@example.com",
                "customer_phone": order.get("customer_phone") or "+91 98765 43210",
                "billing_address": cust_addr_str or "Plot 18, Silicon Valley Corridor, Outer Ring Road, Bengaluru, Karnataka 560103",
                "shipping_address": cust_addr_str or "Plot 18, Silicon Valley Corridor, Outer Ring Road, Bengaluru, Karnataka 560103",
                "place_of_supply": cust_state,
                "state_code": "29",
                "gstin_uin": "Unregistered / Consumer"
            },
            "line_items": invoice_items,
            "order_summary": {
                "subtotal_taxable": round(tot_taxable_value, 2),
                "cgst_total": round(tot_cgst, 2),
                "sgst_total": round(tot_sgst, 2),
                "igst_total": round(tot_igst, 2),
                "total_gst_amount": round(tot_cgst + tot_sgst + tot_igst, 2),
                "delivery_fee": delivery_fee,
                "discount_amount": discount_amount,
                "coupon_savings": discount_amount,
                "grand_total": grand_total,
                "currency": "INR",
                "amount_in_words": amount_in_words
            },
            "payment_details": {
                "payment_method": order.get("payment_method") or "RAZORPAY_UPI",
                "payment_status": "PAID & RECONCILED",
                "transaction_reference": order.get("payment_id") or "pay_rzp_auto_991823",
                "razorpay_payment_id": order.get("payment_id") or "pay_rzp_auto_991823",
                "payment_timestamp": order.get("payment_completed_at") or created_at_raw,
                "settlement_status": "INSTANT_SETTLEMENT_SETTLED"
            },
            "courier_details": {
                "carrier_name": order.get("delivery_partner") or "Delhivery Express",
                "awb_number": order.get("awb_number") or "AWB-DELH-98712345",
                "tracking_id": order.get("tracking_id") or f"TRK-{order_num[-6:]}",
                "estimated_delivery": order.get("estimated_delivery") or "Standard Delivery (2-4 Business Days)"
            },
            "legal_section": {
                "declaration": "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct. The tax charged is in accordance with the provisions of the Central Goods and Services Tax Act, 2017 and Integrated Goods and Services Tax Act, 2017.",
                "reverse_charge_note": "Whether tax is payable on reverse charge basis: No",
                "return_policy": "Goods once sold are covered under a 15-day replacement/return warranty subject to standard electronic hardware return terms. Initiate returns via RazorCommerce account portal.",
                "support_contact": "For any billing queries or disputes, contact billing-support@razorcommerce.in or call 1800-120-RAZOR (Toll Free).",
                "statutory_note": "This is a computer-generated tax invoice and does not require physical signature under Rule 48 of the CGST Rules, 2017."
            }
        }

        return invoice_payload

customer_order_service = CustomerOrderService()

