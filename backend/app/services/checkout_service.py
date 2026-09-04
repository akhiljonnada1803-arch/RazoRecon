from __future__ import annotations

import os
import sqlite3
import json
import uuid
import re
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple

from app.schemas.checkout import (
    CartItemDTO,
    CartSummaryDTO,
    CartDTO,
    AddToCartRequestDTO,
    UpdateQuantityRequestDTO,
    ApplyCouponRequestDTO,
    CheckoutOrderRequestDTO,
    CheckoutOrderResponseDTO,
    AuditLogDTO,
    TransactionStatusDTO,
    AgentCommandRequestDTO,
    AgentCommandResponseDTO
)
from app.schemas.payments import CreateOrderRequestDTO, OrderItemDTO
from app.services.catalog_service import catalog_service
from app.services.payment_service import payment_service

# SQLite Database Setup
DB_DIR = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data"))
os.makedirs(DB_DIR, exist_ok=True)
CHECKOUT_DB_PATH = os.path.join(DB_DIR, "checkout.db")

AVAILABLE_COUPONS = {
    "RAZOR2026": {"type": "percentage", "value": 10.0, "title": "10% Instant Enterprise Discount", "badge": "BESTSELLER"},
    "FESTIVE15": {"type": "percentage", "value": 15.0, "title": "15% Seasonal Hardware Discount", "badge": "FESTIVE SALE"},
    "ENTERPRISE5000": {"type": "flat", "value": 5000.0, "title": "Flat ₹5,000 Annual Rebate", "badge": "ENTERPRISE"},
    "MODELDOCK12": {"type": "percentage", "value": 12.0, "title": "12% Workstation Fleet Bundle", "badge": "PRO FLEET"},
    "COMPLIANCE20": {"type": "percentage", "value": 20.0, "title": "20% Security & Archive Storage Rebate", "badge": "COMPLIANCE DEAL"},
}

class CheckoutService:
    def __init__(self, db_path: str = CHECKOUT_DB_PATH):
        self.db_path = db_path
        self._init_db()

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_conn() as conn:
            cursor = conn.cursor()
            
            # 1. Carts Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS carts (
                    id TEXT PRIMARY KEY,
                    customer_email TEXT,
                    customer_phone TEXT,
                    customer_name TEXT,
                    status TEXT NOT NULL DEFAULT 'active',
                    coupon_code TEXT,
                    discount_pct REAL DEFAULT 0.0,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """)

            # 2. Cart Items Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS cart_items (
                    id TEXT PRIMARY KEY,
                    cart_id TEXT NOT NULL,
                    product_id TEXT NOT NULL,
                    sku TEXT NOT NULL,
                    name TEXT NOT NULL,
                    brand TEXT NOT NULL,
                    category TEXT NOT NULL,
                    price REAL NOT NULL,
                    quantity INTEGER NOT NULL,
                    subtotal REAL NOT NULL,
                    image_url TEXT NOT NULL,
                    gst_rate_pct REAL DEFAULT 18.0,
                    hsn_sac_code TEXT DEFAULT '8470',
                    active_offer TEXT,
                    FOREIGN KEY (cart_id) REFERENCES carts (id) ON DELETE CASCADE
                )
            """)

            # 3. Checkout Audit Logs Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS checkout_audit_logs (
                    id TEXT PRIMARY KEY,
                    entity_type TEXT NOT NULL,
                    entity_id TEXT NOT NULL,
                    actor TEXT NOT NULL,
                    event_type TEXT NOT NULL,
                    description TEXT NOT NULL,
                    metadata TEXT,
                    created_at TEXT NOT NULL
                )
            """)

            # 4. Checkout Transactions Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS checkout_transactions (
                    transaction_id TEXT PRIMARY KEY,
                    order_id TEXT NOT NULL,
                    payment_id TEXT,
                    cart_id TEXT,
                    amount REAL NOT NULL,
                    currency TEXT NOT NULL DEFAULT 'INR',
                    status TEXT NOT NULL DEFAULT 'created',
                    payment_method TEXT DEFAULT 'upi',
                    customer_email TEXT,
                    reconciled INTEGER NOT NULL DEFAULT 0,
                    reconciliation_id TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """)
            conn.commit()

    def record_audit_event(
        self,
        actor: str,
        event_type: str,
        entity_id: str,
        description: str,
        metadata: Optional[Dict[str, Any]] = None,
        entity_type: str = "cart"
    ):
        now_str = datetime.now().isoformat()
        log_id = f"aud_{uuid.uuid4().hex[:10]}"
        meta_json = json.dumps(metadata or {})
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO checkout_audit_logs (
                    id, entity_type, entity_id, actor, event_type, description, metadata, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (log_id, entity_type, entity_id, actor, event_type, description, meta_json, now_str))
            conn.commit()

    def get_or_create_cart(self, cart_id: Optional[str] = None) -> CartDTO:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            now_str = datetime.now().isoformat()

            if cart_id:
                cursor.execute("SELECT * FROM carts WHERE id = ?", (cart_id,))
                cart_row = cursor.fetchone()
                if cart_row:
                    return self._load_cart(cart_row, cursor)

            # Create new cart
            new_cart_id = f"cart_{uuid.uuid4().hex[:10]}"
            cursor.execute("""
                INSERT INTO carts (id, status, created_at, updated_at)
                VALUES (?, 'active', ?, ?)
            """, (new_cart_id, now_str, now_str))
            conn.commit()

            self.record_audit_event(
                actor="System",
                event_type="CART_CREATED",
                entity_id=new_cart_id,
                description="Initialized new enterprise shopping cart session.",
                entity_type="cart"
            )

            cursor.execute("SELECT * FROM carts WHERE id = ?", (new_cart_id,))
            return self._load_cart(cursor.fetchone(), cursor)

    def _load_cart(self, cart_row: sqlite3.Row, cursor: sqlite3.Cursor) -> CartDTO:
        cart_id = cart_row["id"]
        cursor.execute("SELECT * FROM cart_items WHERE cart_id = ?", (cart_id,))
        items_rows = cursor.fetchall()

        items: List[CartItemDTO] = []
        items_total = 0.0
        gst_included_amount = 0.0
        total_qty = 0

        for r in items_rows:
            item_price = float(r["price"])
            item_qty = int(r["quantity"])
            item_subtotal = round(item_price * item_qty, 2)
            gst_pct = float(r["gst_rate_pct"]) if r["gst_rate_pct"] is not None else 18.0
            
            # Embedded GST component calculation
            base_item_subtotal = round(item_subtotal / (1.0 + (gst_pct / 100.0)), 2)
            item_gst = round(item_subtotal - base_item_subtotal, 2)
            
            items_total += item_subtotal
            gst_included_amount += item_gst
            total_qty += item_qty

            items.append(CartItemDTO(
                product_id=r["product_id"],
                sku=r["sku"],
                name=r["name"],
                brand=r["brand"],
                category=r["category"],
                price=item_price,
                quantity=item_qty,
                subtotal=item_subtotal,
                image_url=r["image_url"],
                gst_rate_pct=gst_pct,
                hsn_sac_code=r["hsn_sac_code"],
                active_offer=r["active_offer"]
            ))

        # Compute Discounts
        coupon_code = cart_row["coupon_code"]
        discount_amount = 0.0
        discount_pct = float(cart_row["discount_pct"] or 0.0)

        if coupon_code and coupon_code in AVAILABLE_COUPONS:
            coupon_info = AVAILABLE_COUPONS[coupon_code]
            if coupon_info["type"] == "percentage":
                discount_amount = round(items_total * (coupon_info["value"] / 100.0), 2)
                discount_pct = coupon_info["value"]
            elif coupon_info["type"] == "flat":
                discount_amount = min(items_total, coupon_info["value"])
                discount_pct = round((discount_amount / max(1.0, items_total)) * 100, 1)

        delivery_fee = 0.0  # Free Delivery
        platform_fee = 0.0  # Zero Platform Fee
        final_amount = max(0.0, round(items_total + delivery_fee + platform_fee - discount_amount, 2))

        summary = CartSummaryDTO(
            items_total=round(items_total, 2),
            subtotal=round(items_total, 2),
            delivery_fee=delivery_fee,
            platform_fee=platform_fee,
            gst_included_amount=round(gst_included_amount, 2),
            tax_amount=round(gst_included_amount, 2),
            discount_amount=round(discount_amount, 2),
            discount_code=coupon_code,
            discount_pct=discount_pct,
            final_amount=final_amount,
            items_count=len(items),
            total_quantity=total_qty,
            currency="INR"
        )

        return CartDTO(
            id=cart_id,
            items=items,
            summary=summary,
            customer_email=cart_row["customer_email"],
            customer_phone=cart_row["customer_phone"],
            customer_name=cart_row["customer_name"],
            status=cart_row["status"],
            created_at=cart_row["created_at"],
            updated_at=cart_row["updated_at"]
        )

    def add_to_cart(self, cart_id: str, product_id: str, quantity: int = 1, actor: str = "User") -> CartDTO:
        cart = self.get_or_create_cart(cart_id)
        product = catalog_service.get_product_by_id(product_id)
        if not product:
            raise ValueError(f"Product with ID or SKU '{product_id}' not found in catalog.")

        now_str = datetime.now().isoformat()
        with self._get_conn() as conn:
            cursor = conn.cursor()
            # Check if item exists in cart
            cursor.execute("SELECT * FROM cart_items WHERE cart_id = ? AND (product_id = ? OR sku = ?)", (cart.id, product.id, product.sku))
            existing = cursor.fetchone()

            if existing:
                new_qty = existing["quantity"] + quantity
                new_subtotal = round(product.price * new_qty, 2)
                cursor.execute("""
                    UPDATE cart_items SET quantity = ?, subtotal = ? WHERE id = ?
                """, (new_qty, new_subtotal, existing["id"]))
            else:
                item_id = f"item_{uuid.uuid4().hex[:10]}"
                subtotal = round(product.price * quantity, 2)
                cursor.execute("""
                    INSERT INTO cart_items (
                        id, cart_id, product_id, sku, name, brand, category,
                        price, quantity, subtotal, image_url, gst_rate_pct, hsn_sac_code, active_offer
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    item_id, cart.id, product.id, product.sku, product.name, product.brand, product.category,
                    product.price, quantity, subtotal, product.image_url, product.gst_rate_pct, product.hsn_sac_code, product.offer_text
                ))

            cursor.execute("UPDATE carts SET updated_at = ? WHERE id = ?", (now_str, cart.id))
            conn.commit()

        self.record_audit_event(
            actor=actor,
            event_type="ITEM_ADDED",
            entity_id=cart.id,
            description=f"Added {quantity}x '{product.name}' (SKU: {product.sku}) to cart.",
            metadata={"product_id": product.id, "sku": product.sku, "quantity": quantity, "price": product.price}
        )

        return self.get_or_create_cart(cart.id)

    def update_quantity(self, cart_id: str, product_id: str, quantity: int, actor: str = "User") -> CartDTO:
        cart = self.get_or_create_cart(cart_id)
        now_str = datetime.now().isoformat()

        with self._get_conn() as conn:
            cursor = conn.cursor()
            if quantity <= 0:
                cursor.execute("DELETE FROM cart_items WHERE cart_id = ? AND (product_id = ? OR sku = ?)", (cart.id, product_id, product_id))
                event_desc = f"Removed item '{product_id}' from cart (quantity reduced to 0)."
                event_type = "ITEM_REMOVED"
            else:
                cursor.execute("SELECT * FROM cart_items WHERE cart_id = ? AND (product_id = ? OR sku = ?)", (cart.id, product_id, product_id))
                row = cursor.fetchone()
                if not row:
                    raise ValueError(f"Product '{product_id}' not found in cart.")
                new_subtotal = round(float(row["price"]) * quantity, 2)
                cursor.execute("UPDATE cart_items SET quantity = ?, subtotal = ? WHERE id = ?", (quantity, new_subtotal, row["id"]))
                event_desc = f"Updated quantity for '{row['name']}' to {quantity} units."
                event_type = "QUANTITY_UPDATED"

            cursor.execute("UPDATE carts SET updated_at = ? WHERE id = ?", (now_str, cart.id))
            conn.commit()

        self.record_audit_event(
            actor=actor,
            event_type=event_type,
            entity_id=cart.id,
            description=event_desc,
            metadata={"product_id": product_id, "quantity": quantity}
        )

        return self.get_or_create_cart(cart.id)

    def remove_item(self, cart_id: str, product_id: str, actor: str = "User") -> CartDTO:
        return self.update_quantity(cart_id=cart_id, product_id=product_id, quantity=0, actor=actor)

    def apply_coupon(self, cart_id: str, code: str, actor: str = "User") -> CartDTO:
        cart = self.get_or_create_cart(cart_id)
        clean_code = code.strip().upper()
        now_str = datetime.now().isoformat()

        if clean_code and clean_code not in AVAILABLE_COUPONS:
            raise ValueError(f"Coupon code '{clean_code}' is invalid or expired. Try 'RAZOR2026' or 'FESTIVE15'.")

        coupon_info = AVAILABLE_COUPONS.get(clean_code)
        discount_pct = coupon_info["value"] if coupon_info and coupon_info["type"] == "percentage" else 0.0

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE carts SET coupon_code = ?, discount_pct = ?, updated_at = ? WHERE id = ?", (clean_code, discount_pct, now_str, cart.id))
            conn.commit()

        self.record_audit_event(
            actor=actor,
            event_type="COUPON_APPLIED",
            entity_id=cart.id,
            description=f"Applied promotional coupon '{clean_code}' ({coupon_info['title']}).",
            metadata={"coupon_code": clean_code, "discount_pct": discount_pct}
        )

        return self.get_or_create_cart(cart.id)

    def create_checkout_order(self, req: CheckoutOrderRequestDTO, actor: str = "User") -> CheckoutOrderResponseDTO:
        cart = self.get_or_create_cart(req.cart_id)
        if not cart.items:
            raise ValueError("Cannot checkout an empty cart. Please add products first.")

        now_str = datetime.now().isoformat()

        # Build order items for Razorpay Test Mode Payment Service
        order_items = [
            OrderItemDTO(
                product_id=it.product_id,
                name=it.name,
                price=it.price,
                quantity=it.quantity,
                subtotal=it.subtotal
            )
            for it in cart.items
        ]

        # Call payment_service to create official Razorpay test order
        create_order_req = CreateOrderRequestDTO(
            amount=cart.summary.final_amount,
            currency="INR",
            receipt=f"rcpt_{cart.id.replace('cart_', '')}",
            customer_email=req.customer_email or "procurement@acme.com",
            customer_phone=req.customer_phone or "+91 98765 43210",
            items=order_items,
            notes={
                "cart_id": cart.id,
                "customer_name": req.customer_name or "Acme Enterprise",
                "coupon_code": cart.summary.discount_code or "NONE",
                "taxes_inr": str(cart.summary.tax_amount),
                "discounts_inr": str(cart.summary.discount_amount),
                "shipping_address": req.shipping_address or ""
            }
        )
        order_res = payment_service.create_order(create_order_req)

        # Generate shareable payment link and dynamic QR
        payment_link = f"https://rzp.io/l/{order_res.order_id.replace('order_rzp_', '')}"
        qr_code_data = f"upi://pay?pa=razorpay.test@icici&pn=RazorRecon%20Enterprise&am={cart.summary.final_amount:.2f}&cu=INR&tn={order_res.order_id}"

        # Record Transaction Status in checkout database
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO checkout_transactions (
                    transaction_id, order_id, cart_id, amount, currency, status,
                    payment_method, customer_email, reconciled, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, 'created', 'upi', ?, 0, ?, ?)
            """, (
                f"tx_{uuid.uuid4().hex[:10]}",
                order_res.order_id,
                cart.id,
                cart.summary.final_amount,
                "INR",
                req.customer_email,
                now_str,
                now_str
            ))
            # Mark cart as converted
            cursor.execute("UPDATE carts SET status = 'converted', updated_at = ? WHERE id = ?", (now_str, cart.id))
            conn.commit()

        self.record_audit_event(
            actor=actor,
            event_type="ORDER_CREATED",
            entity_id=order_res.order_id,
            description=f"Created Razorpay Order '{order_res.order_id}' for ₹{cart.summary.final_amount:,.2f} with payment link.",
            metadata={
                "cart_id": cart.id,
                "order_amount": cart.summary.subtotal,
                "taxes": cart.summary.tax_amount,
                "discounts": cart.summary.discount_amount,
                "final_amount": cart.summary.final_amount,
                "payment_link": payment_link
            },
            entity_type="order"
        )

        return CheckoutOrderResponseDTO(
            order_id=order_res.order_id,
            cart_id=cart.id,
            receipt=order_res.receipt,
            currency="INR",
            items_total=cart.summary.items_total,
            order_amount=cart.summary.items_total,
            delivery_fee=cart.summary.delivery_fee,
            platform_fee=cart.summary.platform_fee,
            gst_included=cart.summary.gst_included_amount,
            taxes=cart.summary.gst_included_amount,
            discounts=cart.summary.discount_amount,
            final_amount=cart.summary.final_amount,
            status="created",
            checkout_session_url=order_res.checkout_session_url,
            payment_link=payment_link,
            qr_code_data=qr_code_data,
            items_count=cart.summary.items_count,
            customer_email=req.customer_email or "procurement@acme.com",
            created_at=now_str
        )

    def get_audit_logs(self, limit: int = 50) -> List[AuditLogDTO]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM checkout_audit_logs ORDER BY created_at DESC LIMIT ?", (limit,))
            rows = cursor.fetchall()
            return [
                AuditLogDTO(
                    id=r["id"],
                    entity_type=r["entity_type"],
                    entity_id=r["entity_id"],
                    actor=r["actor"],
                    event_type=r["event_type"],
                    description=r["description"],
                    metadata=json.loads(r["metadata"] or "{}"),
                    created_at=r["created_at"]
                )
                for r in rows
            ]

    def get_transactions(self, limit: int = 50) -> List[TransactionStatusDTO]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM checkout_transactions ORDER BY created_at DESC LIMIT ?", (limit,))
            rows = cursor.fetchall()
            return [
                TransactionStatusDTO(
                    transaction_id=r["transaction_id"],
                    order_id=r["order_id"],
                    payment_id=r["payment_id"],
                    cart_id=r["cart_id"],
                    amount=float(r["amount"]),
                    currency=r["currency"],
                    status=r["status"],
                    payment_method=r["payment_method"],
                    customer_email=r["customer_email"],
                    reconciled=bool(r["reconciled"]),
                    reconciliation_id=r["reconciliation_id"],
                    created_at=r["created_at"],
                    updated_at=r["updated_at"]
                )
                for r in rows
            ]

    def process_agent_command(self, req: AgentCommandRequestDTO) -> AgentCommandResponseDTO:
        cart = self.get_or_create_cart(req.cart_id)
        prompt = req.prompt.lower().strip()
        all_prods = catalog_service.get_all_products(limit=50).products

        # 1. Coupon Request
        if "coupon" in prompt or "discount" in prompt or "offer" in prompt:
            cart = self.apply_coupon(cart.id, "RAZOR2026", actor="Agent")
            return AgentCommandResponseDTO(
                cart=cart,
                agent_message="I have automatically applied the optimal enterprise promo code **RAZOR2026** (10% instant discount) to your cart!",
                suggested_actions=["Proceed to Razorpay Checkout", "Add POS Terminal V3 Pro", "View Tax Breakdown"],
                applied_action="COUPON_APPLIED"
            )

        # 2. Clear Cart
        if "clear" in prompt or "empty" in prompt or "reset" in prompt:
            with self._get_conn() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM cart_items WHERE cart_id = ?", (cart.id,))
                cursor.execute("UPDATE carts SET coupon_code = NULL, discount_pct = 0.0 WHERE id = ?", (cart.id,))
                conn.commit()
            self.record_audit_event(
                actor="Agent",
                event_type="CART_CLEARED",
                entity_id=cart.id,
                description="Agent cleared all items from the cart session."
            )
            updated_cart = self.get_or_create_cart(cart.id)
            return AgentCommandResponseDTO(
                cart=updated_cart,
                agent_message="Your cart has been reset. What products would you like me to add for your business?",
                suggested_actions=["Add 2x Smart POS V3 Pro", "Add RazorRecon Annual License", "Add 4G Soundbox Pro"],
                applied_action="CART_CLEARED"
            )

        # 3. Add POS / Terminal
        qty_match = re.search(r'(\d+)', prompt)
        qty = int(qty_match.group(1)) if qty_match else 1

        matched_prod = None
        if "pos" in prompt or "terminal" in prompt:
            matched_prod = next((p for p in all_prods if "pos" in p.sku.lower() or "terminal" in p.name.lower()), None)
        elif "soundbox" in prompt or "speaker" in prompt or "audio" in prompt:
            matched_prod = next((p for p in all_prods if "soundbox" in p.name.lower() or "sbox" in p.sku.lower()), None)
        elif "license" in prompt or "recon" in prompt or "software" in prompt:
            matched_prod = next((p for p in all_prods if "recon" in p.sku.lower() or "software" in p.category.lower()), None)
        elif "keychron" in prompt or "keyboard" in prompt:
            matched_prod = next((p for p in all_prods if "keyboard" in p.name.lower() or "keychron" in p.sku.lower()), None)
        elif "monitor" in prompt or "dell" in prompt or "display" in prompt:
            matched_prod = next((p for p in all_prods if "monitor" in p.name.lower() or "display" in p.name.lower()), None)
        elif "security" in prompt or "yubikey" in prompt:
            matched_prod = next((p for p in all_prods if "yubikey" in p.sku.lower() or "security" in p.category.lower()), None)
        else:
            # Fallback to first available enterprise product
            matched_prod = all_prods[0] if all_prods else None

        if matched_prod:
            cart = self.add_to_cart(cart.id, matched_prod.id, quantity=qty, actor="Agent")
            return AgentCommandResponseDTO(
                cart=cart,
                agent_message=f"Added **{qty}x {matched_prod.name}** (₹{matched_prod.price:,.2f} each) to your checkout cart. Would you like me to apply the 'RAZOR2026' coupon or generate your Razorpay checkout link?",
                suggested_actions=["Apply RAZOR2026 Coupon", "Generate Payment Link", "Add 4G Soundbox Pro"],
                applied_action="ITEM_ADDED"
            )

        return AgentCommandResponseDTO(
            cart=cart,
            agent_message="I'm ready to configure your order! You can ask me to add any hardware or licenses, apply promotional coupons, or generate a 1-click Razorpay test payment link.",
            suggested_actions=["Add 2x Smart POS V3 Pro", "Apply RAZOR2026 Coupon", "Proceed to Checkout"],
            applied_action="NONE"
        )

checkout_service = CheckoutService()
