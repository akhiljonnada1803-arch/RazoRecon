from __future__ import annotations

import uuid
import datetime
from typing import List, Dict, Any, Optional
from app.schemas.commerce import (
    ProductDTO,
    ProductSpecDTO,
    CartDTO,
    CartItemDTO,
    ComparisonDataDTO,
    ComparisonAttributeDTO,
    CommerceChatResponseDTO,
    CheckoutResponseDTO
)

# Comprehensive Enterprise & Merchant Product Catalog
SAMPLE_PRODUCTS: List[ProductDTO] = [
    ProductDTO(
        id="prod_pos_smart_v3",
        name="Razorpay Smart POS Terminal V3",
        brand="Razorpay Hardware",
        category="Payment Terminals",
        price=14999.00,
        original_price=17999.00,
        currency="INR",
        rating=4.9,
        reviews_count=284,
        image_url="https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600&auto=format&fit=crop&q=80",
        tagline="Next-gen all-in-one smart Android POS terminal with dual displays and 4G eSIM.",
        description="Enterprise-grade Android 13 POS terminal designed for high-throughput retail and restaurant operations. Features contactless NFC, Dynamic QR, UPI Sound, biometric thermal receipt printing, and instant reconciliation sync.",
        features=[
            "Supports NFC, Chip & PIN, Dynamic BharatQR, UPI AutoPay",
            "High-speed 80mm/s Japanese thermal receipt printer",
            "5.5-inch HD IPS touchscreen with secondary customer-facing display",
            "5200mAh all-day hot-swappable battery with fast charge",
            "Direct webhook & ERP reconciliation integration"
        ],
        specs=[
            ProductSpecDTO(key="OS & Processor", value="Android 13 OS / Quad-Core 2.0 GHz"),
            ProductSpecDTO(key="Connectivity", value="4G Dual-SIM eSIM + Wi-Fi 6 + Bluetooth 5.2"),
            ProductSpecDTO(key="Display", value="5.5\" HD IPS Multi-touch (1280x720)"),
            ProductSpecDTO(key="Battery Life", value="18+ hours continuous operating time"),
            ProductSpecDTO(key="Warranty", value="2 Years Enterprise Replacement Warranty"),
            ProductSpecDTO(key="GST Tax Rate", value="18% (Input Tax Credit Eligible)")
        ],
        in_stock=True,
        delivery_time="1-2 business days",
        gst_rate_pct=18.0
    ),
    ProductDTO(
        id="prod_soundbox_4g",
        name="Razorpay Smart Soundbox 4G Pro",
        brand="Razorpay Hardware",
        category="Payment Audio Alerts",
        price=2499.00,
        original_price=2999.00,
        currency="INR",
        rating=4.8,
        reviews_count=612,
        image_url="https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80",
        tagline="Instant multi-lingual audio confirmation for UPI & QR payments with LED screen.",
        description="High-volume 3W front-firing speaker device with multi-language voice announcements across 11 Indian regional languages. Powered by 4G IoT connectivity with zero Wi-Fi dependency.",
        features=[
            "Instant voice alerts in Hindi, English, Tamil, Telugu, Kannada, Marathi & more",
            "1.8-inch bright LED amount confirmation display",
            "4G Cat-1 IoT module with pre-activated Lifetime SIM",
            "Heavy-duty 2600mAh battery lasting up to 5 days on a single charge",
            "Tamper-proof casing with IP54 water & dust resistance"
        ],
        specs=[
            ProductSpecDTO(key="Audio Output", value="3W High-fidelity Front Speaker (>95dB)"),
            ProductSpecDTO(key="Supported Languages", value="11 Indian Regional Languages"),
            ProductSpecDTO(key="Battery Standby", value="120 hours standby / 5 days active"),
            ProductSpecDTO(key="Network", value="4G VoLTE / 2G Auto-fallback"),
            ProductSpecDTO(key="Warranty", value="1 Year Standard Manufacturer Warranty"),
            ProductSpecDTO(key="GST Tax Rate", value="18% (Input Tax Credit Eligible)")
        ],
        in_stock=True,
        delivery_time="2-3 business days",
        gst_rate_pct=18.0
    ),
    ProductDTO(
        id="prod_finops_ledger_suite",
        name="RazorRecon Enterprise Autonomous FinOps License",
        brand="RazorRecon Software",
        category="Enterprise Software",
        price=49999.00,
        original_price=59999.00,
        currency="INR",
        rating=5.0,
        reviews_count=98,
        image_url="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80",
        tagline="Autonomous multi-channel reconciliation, vendor memory engine & CFO Copilot (Annual).",
        description="Annual enterprise subscription for RazorRecon AI. Includes multi-entity support, unlimited payment gateway ingestion, real-time fraud sentinel, automated month-end period lock, and custom ERP integration connectors.",
        features=[
            "Unlimited transaction ingestion across Razorpay, Stripe, Amazon, Shopify",
            "Forensic Vendor Behavioral Memory & Counterparty Risk Engine",
            "Autonomous 7-phase Month-End Close agent workflow",
            "ReAct CFO Copilot with custom treasury RAG queries",
            "Dedicated 24/7 Solutions Architect & SLA guarantee"
        ],
        specs=[
            ProductSpecDTO(key="Deployment", value="Cloud Managed SaaS / Dedicated VPC Option"),
            ProductSpecDTO(key="User Seats", value="Up to 25 Enterprise Operators (RBAC)"),
            ProductSpecDTO(key="Data Retention", value="7 Years Statutory Audit Compliance"),
            ProductSpecDTO(key="Compliance", value="SOC2 Type II, ISO 27001, GDPR & RBI Compliant"),
            ProductSpecDTO(key="Billing Cycle", value="Annual Enterprise Contract (Billed Yearly)"),
            ProductSpecDTO(key="GST Tax Rate", value="18% (Input Tax Credit Eligible)")
        ],
        in_stock=True,
        delivery_time="Instant Digital Provisioning",
        gst_rate_pct=18.0
    ),
    ProductDTO(
        id="prod_mech_keyboard_pro",
        name="Keychron Q3 Pro FinTech Edition Mechanical Keyboard",
        brand="Keychron",
        category="Workstation Accessories",
        price=18999.00,
        original_price=21499.00,
        currency="INR",
        rating=4.9,
        reviews_count=154,
        image_url="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
        tagline="Custom CNC aluminum wireless QMK/VIA custom mechanical keyboard with macro knob.",
        description="Designed for financial modelers and engineers. Full CNC machined 6063 aluminum body, double-gasket acoustic design, hot-swappable tactile Banana switches, and customizable financial shortcut dial knob.",
        features=[
            "CNC machined aluminum body with sound-dampening acoustic foam",
            "Programmable rotary encoder knob for rapid Excel & dashboard navigation",
            "Wireless Bluetooth 5.1 & Type-C wired dual-mode connectivity",
            "Hot-swappable PCB supporting 3-pin & 5-pin MX mechanical switches",
            "South-facing RGB backlighting with PBT double-shot keycaps"
        ],
        specs=[
            ProductSpecDTO(key="Body Material", value="Full CNC Machined Aluminum"),
            ProductSpecDTO(key="Switch Type", value="Keychron K Pro Brown (Tactile 50g)"),
            ProductSpecDTO(key="Battery Capacity", value="4000mAh Rechargeable Li-Polymer (300h)"),
            ProductSpecDTO(key="Connectivity", value="Bluetooth 5.1 / USB Type-C"),
            ProductSpecDTO(key="Warranty", value="1 Year Replacement Warranty"),
            ProductSpecDTO(key="GST Tax Rate", value="18% (Input Tax Credit Eligible)")
        ],
        in_stock=True,
        delivery_time="2-4 business days",
        gst_rate_pct=18.0
    ),
    ProductDTO(
        id="prod_ultrawide_monitor_40",
        name="Dell UltraSharp 40\" Curved WUHD 5K2K Monitor",
        brand="Dell",
        category="Workstation Displays",
        price=145999.00,
        original_price=165000.00,
        currency="INR",
        rating=4.9,
        reviews_count=77,
        image_url="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
        tagline="Massive 5K2K curved display for complex financial spreadsheets and multi-window ops.",
        description="The ultimate finance control station monitor. 40-inch curved WUHD (5120 x 2160) resolution, 120Hz refresh rate, IPS Black panel with 2000:1 contrast ratio, and single-cable Thunderbolt 4 140W power delivery.",
        features=[
            "40-inch Curved 2500R WUHD 5120x2160 IPS Black panel",
            "Thunderbolt 4 single-cable connectivity with 140W power pass-through",
            "Built-in 2.5GbE RJ45 Ethernet port and multi-device KVM switch",
            "ComfortView Plus low blue light certified with 100% sRGB & 98% DCI-P3",
            "Dual 9W integrated stereo speakers"
        ],
        specs=[
            ProductSpecDTO(key="Screen Size & Res", value="40-inch Curved WUHD (5120 x 2160 at 120Hz)"),
            ProductSpecDTO(key="Panel Tech", value="IPS Black Technology / 2000:1 Contrast"),
            ProductSpecDTO(key="Ports", value="Thunderbolt 4, HDMI 2.1, DisplayPort 1.4, RJ45, USB-C"),
            ProductSpecDTO(key="Power Delivery", value="Up to 140W via Thunderbolt 4"),
            ProductSpecDTO(key="Warranty", value="3 Years Advanced Exchange Service"),
            ProductSpecDTO(key="GST Tax Rate", value="18% (Input Tax Credit Eligible)")
        ],
        in_stock=True,
        delivery_time="3-5 business days",
        gst_rate_pct=18.0
    ),
    ProductDTO(
        id="prod_yubikey_bio_security",
        name="Yubico YubiKey Bio FIDO2 Enterprise Hardware Key",
        brand="Yubico",
        category="Security & Access",
        price=8499.00,
        original_price=9999.00,
        currency="INR",
        rating=4.8,
        reviews_count=210,
        image_url="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&auto=format&fit=crop&q=80",
        tagline="Biometric fingerprint hardware security key for zero-trust banking & SSO access.",
        description="Hardware-based authentication token supporting biometric fingerprint recognition. Meets the highest security requirements for financial controllers, audit teams, and fintech platform admins.",
        features=[
            "On-chip fingerprint template matching with zero cloud biometric storage",
            "Passwordless login and multi-factor authentication (MFA)",
            "Supports FIDO2, WebAuthn, and U2F protocols",
            "Crush-resistant, waterproof (IP68) fiberglass reinforced body",
            "Compatible with macOS, Windows, Linux, Android, and iOS via USB-C"
        ],
        specs=[
            ProductSpecDTO(key="Form Factor", value="USB-C Hardware Token"),
            ProductSpecDTO(key="Biometric Sensor", value="Capacitive Touch Fingerprint Sensor"),
            ProductSpecDTO(key="Protocols", value="FIDO2, WebAuthn, FIDO U2F"),
            ProductSpecDTO(key="Durability", value="IP68 Water & Dust Resistant / Tamper-evident"),
            ProductSpecDTO(key="Warranty", value="1 Year Manufacturer Warranty"),
            ProductSpecDTO(key="GST Tax Rate", value="18% (Input Tax Credit Eligible)")
        ],
        in_stock=True,
        delivery_time="1-2 business days",
        gst_rate_pct=18.0
    ),
    ProductDTO(
        id="prod_anc_headset_executive",
        name="Sony WH-1000XM5 Noise Cancelling Executive Headset",
        brand="Sony",
        category="Workstation Accessories",
        price=26990.00,
        original_price=34990.00,
        currency="INR",
        rating=4.9,
        reviews_count=442,
        image_url="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
        tagline="Industry-leading active noise cancelling headphones for focused finance deep-work.",
        description="Equipped with two processors and eight microphones for unparalleled active noise cancellation. Crystal-clear call quality with 4 beamforming microphones and AI noise suppression for executive board meetings.",
        features=[
            "Industry-leading noise cancellation with Integrated Processor V1 & QN1",
            "Ultra-clear hands-free calling with 4 beamforming microphones & AI noise reduction",
            "Up to 30 hours battery life with quick charging (3 min charge = 3 hours playback)",
            "Multipoint connection allows pairing with laptop & phone simultaneously",
            "Ultra-comfortable lightweight soft-fit leather headband"
        ],
        specs=[
            ProductSpecDTO(key="Battery Life", value="30 hours with ANC On (40 hours ANC Off)"),
            ProductSpecDTO(key="Charging", value="USB-PD Fast Charge (3 min for 3h playback)"),
            ProductSpecDTO(key="Weight", value="250 grams"),
            ProductSpecDTO(key="Bluetooth", value="Bluetooth 5.2 / LDAC / AAC / SBC"),
            ProductSpecDTO(key="Warranty", value="1 Year Comprehensive Warranty"),
            ProductSpecDTO(key="GST Tax Rate", value="18% (Input Tax Credit Eligible)")
        ],
        in_stock=True,
        delivery_time="1-3 business days",
        gst_rate_pct=18.0
    ),
    ProductDTO(
        id="prod_edge_server_box",
        name="Synology DiskStation DS923+ Enterprise NAS & Server",
        brand="Synology",
        category="Server & Storage",
        price=62999.00,
        original_price=69999.00,
        currency="INR",
        rating=4.9,
        reviews_count=130,
        image_url="https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&auto=format&fit=crop&q=80",
        tagline="Compact 4-bay local on-premise encrypted storage for statutory accounting archives.",
        description="4-bay storage solution designed for small-to-medium finance departments requiring air-gapped on-premise backups of sensitive bank statements, vendor tax dossiers, and ledger exports.",
        features=[
            "AMD Ryzen R1600 dual-core processor with hardware encryption engine",
            "4-bay design scalable up to 9 drives with Synology DX517 expansion unit",
            "Dual M.2 NVMe SSD slots for high-speed caching",
            "Dual 1GbE ports with failover support, optional 10GbE network card upgrade",
            "Btrfs file system with automated snapshot replication & ransomware defense"
        ],
        specs=[
            ProductSpecDTO(key="CPU", value="AMD Ryzen R1600 (2-core 2.6 GHz, burst up to 3.1 GHz)"),
            ProductSpecDTO(key="Memory", value="4 GB DDR4 ECC (Expandable up to 32 GB)"),
            ProductSpecDTO(key="Drive Bays", value="4 x 3.5\"/2.5\" SATA HDD/SSD + 2 x M.2 NVMe"),
            ProductSpecDTO(key="Max Raw Capacity", value="72 TB (4 x 18TB drives)"),
            ProductSpecDTO(key="Warranty", value="3 Years Synology Extended Warranty"),
            ProductSpecDTO(key="GST Tax Rate", value="18% (Input Tax Credit Eligible)")
        ],
        in_stock=True,
        delivery_time="2-4 business days",
        gst_rate_pct=18.0
    )
]

class CommerceService:
    def __init__(self):
        self.products = SAMPLE_PRODUCTS

    def get_all_products(self, query: Optional[str] = None, category: Optional[str] = None) -> List[ProductDTO]:
        results = self.products
        if category and category.lower() != "all":
            results = [p for p in results if p.category.lower() == category.lower()]
        if query:
            q = query.lower()
            results = [
                p for p in results 
                if q in p.name.lower() or q in p.tagline.lower() or q in p.description.lower() or q in p.brand.lower() or any(q in f.lower() for f in p.features)
            ]
        return results

    def get_product_by_id(self, product_id: str) -> Optional[ProductDTO]:
        for p in self.products:
            if p.id.lower() == product_id.lower():
                return p
        return None

    def calculate_cart_totals(self, cart: CartDTO) -> CartDTO:
        subtotal = sum(item.price * item.quantity for item in cart.items)
        tax_gst = round(subtotal * 0.18, 2)
        shipping = 0.0 if subtotal > 5000 or len(cart.items) == 0 else 250.0
        
        discount = 0.0
        if cart.coupon_applied:
            code = cart.coupon_applied.strip().upper()
            if code in ["RAZOR2026", "RECON10", "FINTECH2026"]:
                discount = round(subtotal * 0.10, 2) # 10% instant discount
            elif code in ["WELCOME20"]:
                discount = round(subtotal * 0.20, 2) # 20% discount

        total = max(0.0, round(subtotal + tax_gst + shipping - discount, 2))
        
        cart.subtotal = subtotal
        cart.tax_gst = tax_gst
        cart.shipping = shipping
        cart.discount = discount
        cart.total = total
        return cart

    def compare_products(self, product_ids: List[str]) -> ComparisonDataDTO:
        selected = [p for p in self.products if p.id in product_ids or any(pid.lower() in p.id.lower() for pid in product_ids)]
        if len(selected) < 2 and len(self.products) >= 2:
            selected = self.products[:2]

        all_keys = set()
        for p in selected:
            for s in p.specs:
                all_keys.add(s.key)

        attributes: List[ComparisonAttributeDTO] = []
        
        # Price attribute
        attributes.append(ComparisonAttributeDTO(
            attribute="Price (INR)",
            values={p.name: f"₹{p.price:,.2f}" for p in selected}
        ))
        # Category
        attributes.append(ComparisonAttributeDTO(
            attribute="Category",
            values={p.name: p.category for p in selected}
        ))
        # Rating
        attributes.append(ComparisonAttributeDTO(
            attribute="Rating",
            values={p.name: f"{p.rating} ★ ({p.reviews_count} reviews)" for p in selected}
        ))

        # Dynamic Specs
        for key in list(all_keys)[:5]:
            val_map = {}
            for p in selected:
                match = next((s.value for s in p.specs if s.key.lower() == key.lower()), "N/A")
                val_map[p.name] = match
            attributes.append(ComparisonAttributeDTO(
                attribute=key,
                values=val_map
            ))

        verdict = f"Comparing {selected[0].name} vs {selected[1].name}: Choose {selected[0].name} for {selected[0].category.lower()} requirements, or {selected[1].name} for premium features at ₹{selected[1].price:,.2f}."

        return ComparisonDataDTO(
            product_ids=[p.id for p in selected],
            products=selected,
            attributes=attributes,
            verdict=verdict
        )

    def process_chat_query(
        self, 
        query: str, 
        history: List[Any] = [], 
        cart: Optional[CartDTO] = None
    ) -> CommerceChatResponseDTO:
        q = query.strip().lower()
        active_cart = cart or CartDTO()
        active_cart = self.calculate_cart_totals(active_cart)

        recommended_products: List[ProductDTO] = []
        comparison_data: Optional[ComparisonDataDTO] = None
        suggested_prompts: List[str] = []
        action_triggered: Optional[str] = None
        checkout_link: Optional[str] = None
        message = ""

        # Intent 1: Checkout / Payment Link Generation
        if any(w in q for w in ["checkout", "payment link", "pay now", "generate link", "buy now"]):
            if not active_cart.items:
                # Add default recommended POS terminal if cart is empty
                pos_item = self.products[0]
                active_cart.items.append(CartItemDTO(
                    product_id=pos_item.id,
                    name=pos_item.name,
                    price=pos_item.price,
                    quantity=1,
                    image_url=pos_item.image_url,
                    category=pos_item.category
                ))
                active_cart = self.calculate_cart_totals(active_cart)

            checkout_resp = self.generate_checkout_link(active_cart)
            checkout_link = checkout_resp.payment_url
            action_triggered = "checkout"
            message = (
                f"### 💳 Razorpay Checkout Link Generated!\n\n"
                f"Your order of **{len(active_cart.items)} item(s)** totaling **₹{active_cart.total:,.2f}** (inclusive of 18% GST) has been created.\n\n"
                f"• **Order ID**: `{checkout_resp.order_id}`\n"
                f"• **Payment Link**: [{checkout_resp.payment_url}]({checkout_resp.payment_url})\n"
                f"• **Status**: Active (Expires in 24 hours)\n\n"
                f"Click the checkout button or scan the QR code to complete payment via UPI, NetBanking, Credit/Debit Card, or Corporate Wire."
            )
            suggested_prompts = [
                "Apply coupon code RAZOR2026",
                "Show items in my shopping cart",
                "Add 1 more POS terminal",
                "Clear my cart"
            ]

        # Intent 2: Apply Coupon
        elif "coupon" in q or "discount" in q or "razor2026" in q or "recon10" in q:
            code = "RAZOR2026"
            if "recon10" in q:
                code = "RECON10"
            elif "welcome20" in q:
                code = "WELCOME20"
            
            active_cart.coupon_applied = code
            active_cart = self.calculate_cart_totals(active_cart)
            action_triggered = "coupon_applied"
            message = (
                f"🎉 **Coupon '{code}' successfully applied!**\n\n"
                f"You saved **₹{active_cart.discount:,.2f}** on your order.\n"
                f"• **New Subtotal**: ₹{active_cart.subtotal:,.2f}\n"
                f"• **GST (18%)**: ₹{active_cart.tax_gst:,.2f}\n"
                f"• **Final Total**: **₹{active_cart.total:,.2f}**"
            )
            suggested_prompts = [
                "Generate Razorpay checkout link",
                "View shopping cart",
                "Compare POS terminal with Soundbox",
                "Show high-end monitors"
            ]

        # Intent 3: Add to Cart Intent
        elif any(w in q for w in ["add to cart", "add ", "buy ", "purchase ", "put in cart"]):
            target_prod = None
            for p in self.products:
                if (p.id.lower() in q or 
                    any(token in q for token in p.name.lower().split() if len(token) > 3) or
                    p.brand.lower() in q or
                    p.category.lower() in q):
                    target_prod = p
                    break
            
            if not target_prod:
                target_prod = self.products[0]

            # Check if already in cart
            existing = next((item for item in active_cart.items if item.product_id == target_prod.id), None)
            if existing:
                existing.quantity += 1
            else:
                active_cart.items.append(CartItemDTO(
                    product_id=target_prod.id,
                    name=target_prod.name,
                    price=target_prod.price,
                    quantity=1,
                    image_url=target_prod.image_url,
                    category=target_prod.category
                ))

            active_cart = self.calculate_cart_totals(active_cart)
            action_triggered = "add_to_cart"
            message = (
                f"✅ **Added to Cart**: **{target_prod.name}** (₹{target_prod.price:,.2f})\n\n"
                f"Your cart now has **{len(active_cart.items)} unique item(s)** totaling **₹{active_cart.total:,.2f}** (inclusive of 18% GST). Would you like to proceed to checkout or explore compatible accessories?"
            )
            recommended_products = [target_prod]
            suggested_prompts = [
                "Proceed to checkout with Razorpay",
                "Compare with other payment devices",
                "Apply promo coupon code",
                "Show mechanical keyboards"
            ]

        # Intent 4: Remove from Cart / Clear Cart
        elif any(w in q for w in ["remove from cart", "remove ", "delete item", "clear cart"]):
            if "clear" in q or "all" in q:
                active_cart.items = []
                active_cart.coupon_applied = None
                active_cart = self.calculate_cart_totals(active_cart)
                message = "🗑️ Your shopping cart has been cleared."
            else:
                removed_name = "item"
                if active_cart.items:
                    removed = active_cart.items.pop()
                    removed_name = removed.name
                active_cart = self.calculate_cart_totals(active_cart)
                message = f"🗑️ Removed **{removed_name}** from your shopping cart."

            action_triggered = "cart_updated"
            suggested_prompts = [
                "Show smart POS terminals",
                "Recommend developer workstations",
                "Explore enterprise software"
            ]

        # Intent 5: View Cart
        elif any(w in q for w in ["view cart", "show cart", "what is in my cart", "my cart", "cart items"]):
            action_triggered = "view_cart"
            if not active_cart.items:
                message = "🛒 **Your shopping cart is currently empty.**\n\nAsk me about our smart payment terminals, FinOps software licenses, or developer peripherals to get started!"
                recommended_products = self.products[:3]
            else:
                items_str = "\n".join([f"• **{item.name}** × {item.quantity} — ₹{item.price * item.quantity:,.2f}" for item in active_cart.items])
                message = (
                    f"🛒 **Your Shopping Cart:**\n\n{items_str}\n\n"
                    f"• **Subtotal**: ₹{active_cart.subtotal:,.2f}\n"
                    f"• **GST (18%)**: ₹{active_cart.tax_gst:,.2f}\n"
                    f"• **Discount**: -₹{active_cart.discount:,.2f}\n"
                    f"• **Total Payable**: **₹{active_cart.total:,.2f}**"
                )
            suggested_prompts = [
                "Generate Razorpay checkout link",
                "Apply coupon code RAZOR2026",
                "Compare POS terminal with Soundbox"
            ]

        # Intent 6: Compare Products
        elif any(w in q for w in ["compare", "difference between", "vs", "versus"]):
            # Identify which products to compare
            matched = []
            for p in self.products:
                if any(t in q for t in p.name.lower().split() if len(t) > 3) or p.id.lower() in q:
                    matched.append(p.id)
            
            if len(matched) < 2:
                matched = ["prod_pos_smart_v3", "prod_soundbox_4g"]

            comparison_data = self.compare_products(matched[:3])
            action_triggered = "compare"
            message = (
                f"### ⚖️ Side-by-Side Product Comparison\n\n"
                f"Here is a detailed breakdown between **{comparison_data.products[0].name}** and **{comparison_data.products[1].name}**.\n\n"
                f"{comparison_data.verdict}\n\n"
                f"Would you like to add either of these to your cart or inspect full technical specifications?"
            )
            recommended_products = comparison_data.products
            suggested_prompts = [
                f"Add {comparison_data.products[0].name} to cart",
                f"Add {comparison_data.products[1].name} to cart",
                "Show developer keyboards",
                "Generate checkout link"
            ]

        # Intent 7: Natural Language Search & Q&A
        else:
            # Match products based on query keywords
            matched_products = self.get_all_products(query=query)
            if not matched_products:
                matched_products = self.products[:3]

            recommended_products = matched_products[:3]
            
            # Formulate helpful conversational answer
            lead_prod = recommended_products[0]
            message = (
                f"I found **{len(matched_products)} product(s)** matching **\"{query}\"**.\n\n"
                f"The top recommendation is the **{lead_prod.name}** by *{lead_prod.brand}* priced at **₹{lead_prod.price:,.2f}** ({lead_prod.rating} ★ from {lead_prod.reviews_count} reviews).\n\n"
                f"**Key Highlights:**\n" + "\n".join([f"• {f}" for f in lead_prod.features[:3]]) +
                f"\n\nAll items are in stock, come with official manufacturer warranty, and are eligible for 18% GST input tax credit."
            )

            suggested_prompts = [
                f"Add {lead_prod.name} to cart",
                f"Compare {lead_prod.name} with alternatives",
                f"What is the warranty on {lead_prod.name}?",
                "Generate checkout link"
            ]

        return CommerceChatResponseDTO(
            message=message,
            recommended_products=recommended_products,
            comparison_data=comparison_data,
            suggested_prompts=suggested_prompts,
            cart=active_cart,
            action_triggered=action_triggered,
            checkout_link=checkout_link
        )

    def generate_checkout_link(self, cart: CartDTO) -> CheckoutResponseDTO:
        calculated_cart = self.calculate_cart_totals(cart)
        from app.services.payment_service import payment_service
        from app.schemas.payments import CreateOrderRequestDTO, OrderItemDTO

        order_items = [
            OrderItemDTO(
                product_id=i.product_id,
                name=i.name,
                price=i.price,
                quantity=i.quantity
            )
            for i in calculated_cart.items
        ]

        order_res = payment_service.create_order(CreateOrderRequestDTO(
            amount=calculated_cart.total,
            currency="INR",
            customer_email="finance.ops@acmedirect.com",
            customer_phone="+919876543210",
            items=order_items
        ))

        expires_at = (datetime.datetime.utcnow() + datetime.timedelta(hours=24)).strftime("%Y-%m-%d %H:%M:%S UTC")

        return CheckoutResponseDTO(
            payment_link_id=order_res.order_id,
            payment_url=order_res.checkout_session_url,
            order_id=order_res.order_id,
            amount=calculated_cart.total,
            currency="INR",
            status="created",
            qr_code_mock=f"https://api.qrserver.com/v1/create-qr-code/?size=250x250&data={order_res.checkout_session_url}",
            expires_at=expires_at,
            summary_items=calculated_cart.items
        )

commerce_service = CommerceService()
