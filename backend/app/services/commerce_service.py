from __future__ import annotations

import re
import uuid
import datetime
from typing import List, Dict, Any, Optional, Union
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
from app.services.pricing_service import (
    get_applicable_tier,
    calculate_volume_discount,
    apply_volume_pricing,
    pricing_service
)
from app.services.ai_search_service import ai_search_service

# Live merchant inventory from catalog.db via catalog_service is the single source of truth.
# Static SAMPLE_PRODUCTS array removed.
SAMPLE_PRODUCTS: List[ProductDTO] = []

SAVED_ADDRESSES = []

class CommerceService:
    def __init__(self):
        self.saved_addresses = []
        self._cached_products: Optional[List[ProductDTO]] = None

    @property
    def products(self) -> List[ProductDTO]:
        return self._get_live_products()

    @products.setter
    def products(self, value: List[ProductDTO]):
        self._cached_products = value

    def _get_live_products(self) -> List[ProductDTO]:
        """
        Dynamically loads live products directly from catalog.db via catalog_service.
        All static product sources are removed.
        Guarantees that:
        - If stock_quantity <= 0 or in_stock is False, the AI never recommends the product.
        - Updates, stock changes, price updates, and deletions immediately reflect in AI responses.
        """
        try:
            from app.services.catalog_service import catalog_service
            res = catalog_service.get_all_products(limit=1000)
            items = (res.items or res.products) if res else []
            if items:
                live: List[ProductDTO] = []
                for d in items:
                    # Stock rule check: stock_quantity <= 0 or out of stock -> filter out
                    sq = getattr(d, "stock_quantity", None)
                    if sq is None:
                        sq = getattr(d, "stock", 0)
                    if sq is None or sq <= 0:
                        continue

                    in_stk = getattr(d, "in_stock", True)
                    if isinstance(in_stk, (int, float)):
                        in_stk = bool(in_stk)
                    if not in_stk:
                        continue

                    inv_st = getattr(d, "inventory_status", None)
                    if inv_st == "OUT_OF_STOCK":
                        continue

                    specs_list = []
                    for s in (d.specs or []):
                        if hasattr(s, "key") and hasattr(s, "value"):
                            specs_list.append(ProductSpecDTO(key=s.key, value=s.value))
                        elif isinstance(s, dict):
                            specs_list.append(ProductSpecDTO(key=s.get("key", ""), value=s.get("value", "")))

                    features_list = d.features or getattr(d, "key_features", []) or []
                    if isinstance(features_list, str):
                        features_list = [features_list]

                    pros = [f"Verified {d.category} product", "Reliable performance and enterprise durability"]
                    if features_list:
                        pros.append(features_list[0])
                    cons = ["High demand item with limited stock"]

                    imgs = getattr(d, "images", None)
                    fallback_img = imgs[0] if (imgs and isinstance(imgs, list) and len(imgs) > 0) else "https://placehold.co/600x600"
                    img_url = d.image_url or fallback_img

                    stock_status_str = getattr(d, "stock_status", None) or f"In Stock ({sq} units available)"

                    live.append(
                        ProductDTO(
                            id=d.id,
                            name=d.name,
                            brand=d.brand or "Razorpay Verified",
                            category=d.category,
                            price=float(d.price),
                            original_price=float(d.original_price) if d.original_price is not None else round(float(d.price) * 1.15, 2),
                            currency=getattr(d, "currency", "INR") or "INR",
                            rating=float(getattr(d, "rating", 4.8) or 4.8),
                            reviews_count=int(getattr(d, "reviews_count", 12) or 12),
                            image_url=img_url,
                            tagline=d.tagline or f"Official {d.brand} {d.name}",
                            description=d.description or f"High quality {d.name} verified by Razorpay Commerce.",
                            features=features_list,
                            specs=specs_list,
                            pros=pros,
                            cons=cons,
                            stock_status=stock_status_str,
                            delivery_eta="2-3 business days via Express",
                            merchant_trust_score=98.5,
                            in_stock=True,
                            delivery_time=getattr(d, "delivery_time", "2-3 business days") or "2-3 business days",
                            gst_rate_pct=float(getattr(d, "gst_rate_pct", 18.0) or 18.0),
                            price_tiers_json=getattr(d, "price_tiers_json", None),
                            review_sentiment_score=float(getattr(d, "review_sentiment_score", 0.90) or 0.90),
                            popularity_score=float(getattr(d, "popularity_score", 0.88) or 0.88)
                        )
                    )
                return live
        except Exception as e:
            print(f"Error loading live products from catalog_service: {e}")

        return self._cached_products or []

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
                try:
                    from app.services.review_intelligence_service import review_intelligence_service
                    p.review_intelligence = review_intelligence_service.analyze_reviews(p.id)
                except Exception:
                    pass
                return p
        return None


    def calculate_cart_totals(self, cart: CartDTO) -> CartDTO:
        subtotal = 0.0
        total_volume_discount = 0.0

        for item in cart.items:
            prod = self.get_product_by_id(item.product_id)
            if prod:
                pricing = apply_volume_pricing(prod, item.quantity)
                item.tier_used = pricing.get("tier_used")
                item.discount_amount = pricing.get("discount_amount", 0.0)
                item.effective_price = pricing.get("effective_price", item.price)
                line_subtotal = pricing.get("effective_subtotal", round(item.price * item.quantity, 2))
                total_volume_discount += item.discount_amount
            else:
                item.tier_used = None
                item.discount_amount = 0.0
                item.effective_price = item.price
                line_subtotal = round(item.price * item.quantity, 2)
            subtotal += line_subtotal

        subtotal = round(subtotal, 2)
        # GST embedded in items (already included in customer price)
        tax_gst = round(subtotal - (subtotal / 1.18), 2) if subtotal > 0 else 0.0
        shipping = 0.0 # Express Free Delivery
        
        coupon_discount = 0.0
        if cart.coupon_applied:
            code = cart.coupon_applied.strip().upper()
            if code in ["RAZOR2026", "RECON10", "FINTECH2026"]:
                coupon_discount = round(subtotal * 0.10, 2)
            elif code in ["WELCOME20"]:
                coupon_discount = round(subtotal * 0.20, 2)

        total_discount = round(total_volume_discount + coupon_discount, 2)
        total = max(0.0, round(subtotal + shipping - coupon_discount, 2))
        
        cart.subtotal = subtotal
        cart.tax_gst = tax_gst
        cart.shipping = shipping
        cart.discount = total_discount
        cart.total = total
        return cart

    # =========================================================================
    # MULTI-FACTOR RANKING ENGINE (Powered by AISearchService)
    # =========================================================================
    def rank_products(self, query: Optional[str] = None, budget_cap: Optional[float] = None) -> List[ProductDTO]:
        # products fetched live from catalog.db

        q = (query or "").strip()
        if budget_cap and "under" not in q.lower() and "below" not in q.lower():
            q = f"{q} under ₹{budget_cap:,.0f}".strip()

        advisor_res = ai_search_service.recommend(query=q, products=self.products, limit=3)
        return advisor_res.recommended_products


    # =========================================================================
    # SIDE-BY-SIDE COMPARISON TABLE GENERATOR (Step 4 of Advisor Workflow)
    # =========================================================================
    def build_comparison_table(self, top_products: List[ProductDTO]) -> ComparisonDataDTO:
        if not top_products or len(top_products) < 2:
            top_products = self.products[:3]

        attributes: List[ComparisonAttributeDTO] = []

        # 1. Price
        attributes.append(ComparisonAttributeDTO(
            attribute="Final Price (GST Included)",
            values={p.name: f"₹{p.price:,.0f}" for p in top_products}
        ))

        # 2. Customer Rating
        attributes.append(ComparisonAttributeDTO(
            attribute="Customer Rating",
            values={p.name: f"{p.rating} ★ ({p.reviews_count} reviews)" for p in top_products}
        ))

        # 3. Battery / Power Endurance
        battery_map = {}
        for p in top_products:
            bat_spec = next((s.value for s in p.specs if "battery" in s.key.lower() or "power" in s.key.lower()), None)
            battery_map[p.name] = bat_spec or (p.features[3] if len(p.features) > 3 else "Standard Power")
        attributes.append(ComparisonAttributeDTO(attribute="Battery / Power Life", values=battery_map))

        # 4. Key Spec / Storage / Capacity
        spec_map = {}
        for p in top_products:
            core_spec = next((s.value for s in p.specs if any(k in s.key.lower() for k in ["processor", "print speed", "resolution", "audio output", "os"])), None)
            spec_map[p.name] = core_spec or (p.specs[0].value if p.specs else "Enterprise Grade")
        attributes.append(ComparisonAttributeDTO(attribute="Core Performance / Specs", values=spec_map))

        # 5. Warranty & Replacement
        warranty_map = {}
        for p in top_products:
            w_spec = next((s.value for s in p.specs if "warranty" in s.key.lower()), "1 Year Standard")
            warranty_map[p.name] = w_spec
        attributes.append(ComparisonAttributeDTO(attribute="Warranty Coverage", values=warranty_map))

        # 6. Delivery SLA
        attributes.append(ComparisonAttributeDTO(
            attribute="Delivery Speed",
            values={p.name: p.delivery_eta or "1-2 Days via Delhivery" for p in top_products}
        ))

        verdict = f"Comparing {', '.join(p.name for p in top_products)}: Option #1 ({top_products[0].name}) is the highest rated and provides the best balance of commercial features, warranty, and pricing."

        return ComparisonDataDTO(
            product_ids=[p.id for p in top_products],
            products=top_products,
            attributes=attributes,
            verdict=verdict
        )

    def compare_products(self, product_ids: List[str]) -> ComparisonDataDTO:
        selected = [p for p in self.products if p.id in product_ids]
        if not selected:
            selected = self.products[:3]
        return self.build_comparison_table(selected)

    # =========================================================================
    # AI RECOMMENDATION REASONING ("WHY" ENGINE) (Step 5 of Advisor Workflow)
    # =========================================================================
    def generate_ai_why_reasoning(self, lead_product: ProductDTO, budget_cap: Optional[float] = None) -> Dict[str, Any]:
        why_bullets = []

        # Bullet 1: Rating & Trust
        why_bullets.append(f"Highest Customer Satisfaction: Rated {lead_product.rating} ★ with {lead_product.reviews_count} verified commercial reviews.")

        # Bullet 2: Standout Hardware Feature / Pros
        if lead_product.pros:
            why_bullets.append(f"Key Advantage: {lead_product.pros[0]}")
            if len(lead_product.pros) > 1:
                why_bullets.append(f"Performance: {lead_product.pros[1]}")
        else:
            why_bullets.append(f"Performance: {lead_product.features[0] if lead_product.features else 'Enterprise grade hardware'}")

        # Bullet 3: Budget Match
        if budget_cap and lead_product.price <= budget_cap:
            savings = budget_cap - lead_product.price
            why_bullets.append(f"Budget Fit: Priced at ₹{lead_product.price:,.2f} (saves ₹{savings:,.2f} under your ₹{budget_cap:,.0f} limit).")
        else:
            why_bullets.append(f"Transparent Pricing: ₹{lead_product.price:,.2f} inclusive of 18% GST (ITC Eligible) with zero hidden fees.")

        # Bullet 4: Delivery
        why_bullets.append(f"Fast Fulfillment: {lead_product.delivery_eta or 'Next-day priority delivery'}.")

        return {
            "recommended_product_id": lead_product.id,
            "product_name": lead_product.name,
            "headline": f"Why I recommend the {lead_product.name}:",
            "why_bullets": why_bullets
        }

    def _resolve_prod(self, item: Any, query: Optional[str] = None) -> Optional[ProductDTO]:
        if not item and not query:
            return None
        if isinstance(item, ProductDTO):
            return item
        if isinstance(item, str):
            found = self.get_product_by_id(item)
            if found:
                return found
            for p in self.products:
                if item.lower() in p.name.lower() or item.lower() in p.id.lower() or item.lower() in getattr(p, "sku", "").lower():
                    return p
        p_id = getattr(item, "id", None) or (item.get("id") if isinstance(item, dict) else None)
        if p_id:
            found = self.get_product_by_id(p_id)
            if found:
                return found
        p_name = getattr(item, "name", None) or (item.get("name") if isinstance(item, dict) else None)
        if p_name:
            for p in self.products:
                if p_name.lower() in p.name.lower() or p.name.lower() in p_name.lower():
                    return p
        if isinstance(item, dict) and item.get("name"):
            name_val = item.get("name")
            return ProductDTO(
                id=item.get("id") or f"prod_{uuid.uuid4().hex[:8]}",
                name=name_val,
                brand=item.get("brand") or "Razorpay Verified",
                category=item.get("category") or "General",
                price=float(item.get("price", 0.0)),
                image_url=item.get("image_url") or "",
                tagline=item.get("tagline") or f"Official {name_val}",
                description=item.get("description") or f"High quality {name_val} verified by Razorpay Commerce.",
                stock_status="In Stock",
                in_stock=True
            )
        if query:
            q_clean = query.lower()
            for p in self.products:
                if any(w in p.name.lower() or w in p.category.lower() for w in q_clean.split() if len(w) > 2 and w not in ["buy", "order", "want", "please", "with", "show", "find"]):
                    return p
        return None

    # =========================================================================
    # 10-STEP CONVERSATIONAL ADVISOR STATE MACHINE
    # =========================================================================
    def process_chat_query(
        self, 
        query: str, 
        history: List[Any] = [], 
        cart: Optional[CartDTO] = None,
        action: Optional[str] = None,
        selected_product_id: Optional[str] = None,
        selected_address: Optional[Dict[str, Any]] = None,
        quantity: Optional[int] = 1,
        user_id: Optional[str] = None
    ) -> CommerceChatResponseDTO:
        from app.services.ai_autopay_service import ai_autopay_service

        q = query.strip().lower()
        active_cart = cart or CartDTO()
        active_cart = self.calculate_cart_totals(active_cart)

        # Resolve customer addresses with zero demo leak for real registered customers
        active_saved_addresses = self.saved_addresses
        if user_id and user_id != "usr_customer_demo":
            try:
                from app.services.customer_order_service import customer_order_service
                db_addrs = customer_order_service.get_addresses(user_id=user_id)
                active_saved_addresses = [
                    {
                        "id": a.get("id"),
                        "label": a.get("full_name") or "Saved Address",
                        "recipient_name": a.get("full_name") or "Customer",
                        "address_line": f"{a.get('address_line1', '')} {a.get('address_line2', '')}".strip(),
                        "city": a.get("city", "Bengaluru"),
                        "state": a.get("state", "Karnataka"),
                        "pincode": a.get("pincode", "560001"),
                        "phone": a.get("phone", "+91 98765 43210"),
                        "is_default": bool(a.get("is_default", 0))
                    } for a in db_addrs
                ]
            except Exception:
                active_saved_addresses = []

        # Get customer AutoPay rules
        effective_autopay_uid = user_id or "usr_customer_guest"
        autopay_settings = ai_autopay_service.get_settings(user_id=effective_autopay_uid)
        single_limit = float(autopay_settings.get("max_single_purchase_limit") or 0.0)
        monthly_budget = float(autopay_settings.get("monthly_budget") or 0.0)
        spent_month = float(autopay_settings.get("spent_this_month") or 0.0)
        remaining_budget = max(0.0, monthly_budget - spent_month) if monthly_budget > 0 else 0.0
        autopay_enabled = bool(autopay_settings.get("autopay_enabled", False))

        # Check for active payment mandate
        user_mandates = []
        if user_id and user_id != "usr_customer_guest":
            try:
                user_mandates = [m for m in ai_autopay_service.get_mandates(user_id=user_id) if m.get("status") == "ACTIVE"]
            except Exception:
                user_mandates = []

        is_mandate_connected = len(user_mandates) > 0
        is_autopay_ready = bool(is_mandate_connected and autopay_enabled)

        if is_mandate_connected:
            first_m = user_mandates[0]
            payment_method_name = f"{first_m.get('type', 'UPI_AUTOPAY')} ({first_m.get('bank_name', 'Bank')} • {first_m.get('account_or_vpa_masked', 'Connected')})"
        else:
            payment_method_name = "No Linked Payment Mandate"

        autopay_guardrail_info = {
            "autopay_enabled": autopay_enabled,
            "monthly_budget": monthly_budget,
            "spent_this_month": spent_month,
            "remaining_budget": remaining_budget,
            "single_limit": single_limit,
            "payment_method": payment_method_name,
            "autopay_status": "ACTIVE" if autopay_enabled else "PAUSED",
            "is_mandate_connected": is_mandate_connected,
            "is_autopay_ready": is_autopay_ready
        }

        def build_mandate_required_response(target_p: ProductDTO, target_q: int, target_a: Optional[Dict[str, Any]]) -> CommerceChatResponseDTO:
            nonlocal active_cart
            # Add item to active cart
            existing_item = next((i for i in active_cart.items if i.product_id == target_p.id), None)
            if existing_item:
                existing_item.quantity += target_q
            else:
                active_cart.items.append(
                    CartItemDTO(
                        product_id=target_p.id,
                        name=target_p.name,
                        price=target_p.price,
                        quantity=target_q,
                        image_url=target_p.image_url,
                        category=target_p.category
                    )
                )
            active_cart = self.calculate_cart_totals(active_cart)
            checkout_url = f"/checkout?prod={target_p.id}&qty={target_q}"

            if not user_id or user_id == "usr_customer_guest":
                reason_detail = "you are currently shopping as a guest without an active account"
            elif not autopay_enabled:
                reason_detail = "AutoPay is currently disabled or paused in your account settings"
            else:
                reason_detail = "you have not connected a UPI AutoPay or Card payment mandate yet"

            msg = (
                f"⚠️ **AutoPay Mandate Not Connected**\n\n"
                f"Because {reason_detail}, autonomous 1-click purchases cannot be charged directly.\n\n"
                f"🛒 **I have added {target_p.name} (Qty: {target_q}) to your cart!**\n\n"
                f"You can choose to:\n"
                f"1. **[Proceed to Payment Page / Checkout]({checkout_url})** — Complete payment right now using Razorpay Checkout (UPI, Cards, NetBanking, EMI).\n"
                f"2. **[Connect UPI AutoPay](/onboarding/payment)** — Link your UPI or Card mandate in settings to enable autonomous 1-click buying."
            )

            return CommerceChatResponseDTO(
                message=msg,
                flow_step="MANDATE_REQUIRED",
                action_triggered="add_to_cart",
                selected_product=target_p,
                selected_address=target_a,
                cart=active_cart,
                checkout_link=checkout_url,
                suggested_prompts=[
                    "Proceed to Checkout",
                    "Connect UPI AutoPay",
                    "View Shopping Cart",
                    "Browse other products"
                ],
                autopay_guardrail_info=autopay_guardrail_info
            )

        # ---------------------------------------------------------------------
        # CONVERSATION CONTEXT PARSER: Extract previous assistant state
        # ---------------------------------------------------------------------
        last_assistant = None
        for m in reversed(history or []):
            role = getattr(m, "role", None) or (m.get("role") if isinstance(m, dict) else None)
            if role == "assistant":
                last_assistant = m
                break

        prev_flow_step = None
        prev_prod = None
        prev_addr = None
        prev_requires_approval = False
        prev_recs = []

        if last_assistant:
            prev_flow_step = getattr(last_assistant, "flow_step", None) or (last_assistant.get("flow_step") if isinstance(last_assistant, dict) else None)
            prev_prod = getattr(last_assistant, "selected_product", None) or (last_assistant.get("selected_product") if isinstance(last_assistant, dict) else None)
            prev_addr = getattr(last_assistant, "selected_address", None) or (last_assistant.get("selected_address") if isinstance(last_assistant, dict) else None)
            prev_requires_approval = bool(getattr(last_assistant, "requires_approval", False) or (last_assistant.get("requires_approval") if isinstance(last_assistant, dict) else False))
            prev_recs = getattr(last_assistant, "recommended_products", []) or (last_assistant.get("recommended_products") if isinstance(last_assistant, dict) else [])

        is_affirmative = (
            q in ["yes", "y", "yeah", "yep", "sure", "ok", "okay", "approve", "approved", "proceed", "buy", "buy it", "confirm", "confirm it", "i approve", "authorize", "i authorize", "charge it", "continue", "do it", "place order", "yes please", "yes approve", "order now"] or
            any(w in q for w in ["approve purchase", "confirm purchase", "authorize this", "proceed with", "buy with autopay", "place my order", "yes please", "approve order"])
        )

        is_negative = (
            q in ["no", "n", "nope", "cancel", "don't", "dont", "stop", "abort", "reject", "nevermind", "go back"] or
            any(w in q for w in ["cancel order", "don't buy", "do not buy", "cancel purchase", "reject order"])
        )

        # Handle user responding to APPROVAL_REQUIRED (e.g. limit check prompt)
        if (prev_flow_step == "APPROVAL_REQUIRED" or prev_requires_approval) and not action:
            if is_negative:
                return CommerceChatResponseDTO(
                    message="👍 **Purchase Cancelled.**\n\nI have cancelled this order authorization. You have not been charged. What other products would you like to explore or compare?",
                    flow_step="CANCELLED",
                    action_triggered="CANCELLED",
                    suggested_prompts=["Recommend POS machines", "Find laptops under ₹60,000", "View AutoPay budget status"]
                )
            if is_affirmative or any(w in q for w in ["approve", "buy", "proceed", "confirm", "charge", "order"]):
                target_prod = self.get_product_by_id(selected_product_id or "") or self._resolve_prod(prev_prod, query=q) or self._resolve_prod(None, query=q) or (self.products[0] if self.products else None)
                if not target_prod:
                    return CommerceChatResponseDTO(
                        message="I couldn't find that information or product in our catalog.",
                        flow_step="PRODUCT_NOT_FOUND",
                        action_triggered="NONE",
                        suggested_prompts=["Browse all products", "Find laptops", "View POS machines"]
                    )
                chosen_addr = selected_address or prev_addr or (active_saved_addresses[0] if active_saved_addresses else None)
                order_qty = max(1, quantity or 1)
                total_price = float(target_prod.price * order_qty)

                if not is_autopay_ready:
                    return build_mandate_required_response(target_prod, order_qty, chosen_addr)

                effective_buy_uid = user_id or "usr_customer_demo"
                try:
                    buy_res = ai_autopay_service.direct_one_click_buy(
                        product_id=target_prod.id,
                        quantity=order_qty,
                        user_id=effective_buy_uid,
                        custom_reason=f"Customer Manual 1-Click Approval of {target_prod.name}",
                        product_name=target_prod.name,
                        unit_price=target_prod.price,
                        category=target_prod.category,
                        is_autonomous_agent=True
                    )
                except ValueError as ve:
                    return build_mandate_required_response(target_prod, order_qty, chosen_addr)

                order_id = buy_res.get("order_id", f"ord_{uuid.uuid4().hex[:10]}")
                order_conf = buy_res.get("confirmation", {})
                tracking_id = f"DELHIVERY-{uuid.uuid4().hex[:8].upper()}"

                message = (
                    f"🎉 **Order #{order_id} Approved & Placed Successfully!**\n\n"
                    f"• **Product**: {target_prod.name} × {order_qty}\n"
                    f"• **Delivery Address**: {chosen_addr.get('address_line')}, {chosen_addr.get('city')}, {chosen_addr.get('state')} - {chosen_addr.get('pincode')}\n"
                    f"• **Payment Method**: {payment_method_name}\n"
                    f"• **Total Charged**: **₹{total_price:,.2f}** (Inclusive of 18% GST)\n"
                    f"• **Authorization**: Customer Manual 1-Click Approval Granted\n"
                    f"• **Carrier**: Delhivery Express | **Tracking ID**: `{tracking_id}`\n"
                    f"• **Estimated Delivery**: {target_prod.delivery_eta or 'Tomorrow by 5:00 PM'}\n\n"
                    f"Your tax invoice and shipping dossier have been generated and archived in your account."
                )

                return CommerceChatResponseDTO(
                    message=message,
                    flow_step="AUTONOMOUS_PURCHASE",
                    action_triggered="AUTONOMOUS_PURCHASE",
                    selected_product=target_prod,
                    selected_address=chosen_addr,
                    autonomous_order=order_conf,
                    autopay_guardrail_info=autopay_guardrail_info,
                    suggested_prompts=[
                        f"Track order #{order_id}",
                        "View AutoPay Purchase History",
                        "View spending budget balance",
                        "Ask shopping advice for accessories"
                    ]
                )

        # Handle user responding to ORDER_CONFIRMATION
        if prev_flow_step == "ORDER_CONFIRMATION" and not action:
            if is_negative:
                return CommerceChatResponseDTO(
                    message="👍 **Order Cancelled.**\n\nI have cancelled this order. What else can I help you find?",
                    flow_step="CANCELLED",
                    action_triggered="CANCELLED",
                    suggested_prompts=["Recommend POS machines", "Find laptops", "View spending limits"]
                )
            if is_affirmative or any(w in q for w in ["confirm", "buy", "proceed", "order", "charge", "pay", "yes"]):
                action = "confirm_autopay_purchase"

        # Handle user responding to ADDRESS_SELECTION
        if prev_flow_step == "ADDRESS_SELECTION" and not action:
            target_prod = self.get_product_by_id(selected_product_id or "") or self._resolve_prod(prev_prod, query=q) or self._resolve_prod(None, query=q) or (self.products[0] if self.products else None)
            if not target_prod:
                return CommerceChatResponseDTO(
                    message="I couldn't find that information or product in our catalog.",
                    flow_step="PRODUCT_NOT_FOUND",
                    action_triggered="NONE"
                )
            chosen_addr = None
            if is_affirmative or any(w in q for w in ["1", "first", "default", "home", "office", "bangalore", "ship here", "deliver here", "use this"]):
                chosen_addr = active_saved_addresses[0] if active_saved_addresses else None
            elif "2" in q and len(active_saved_addresses) > 1:
                chosen_addr = active_saved_addresses[1]
            elif "3" in q and len(active_saved_addresses) > 2:
                chosen_addr = active_saved_addresses[2]

            if chosen_addr:
                action = "select_address"
                selected_address = chosen_addr
                selected_product_id = target_prod.id

        # Handle user responding to TOP_RECOMMENDATIONS with product choice
        if prev_flow_step == "TOP_RECOMMENDATIONS" and not action:
            picked_prod = None
            if any(q == w or q.startswith(w) for w in ["1", "first", "first one", "option 1", "pick 1", "select 1", "choose 1", "buy 1", "the first"]):
                if prev_recs:
                    picked_prod = self._resolve_prod(prev_recs[0])
            elif any(q == w or q.startswith(w) for w in ["2", "second", "second one", "option 2", "pick 2", "select 2", "choose 2", "buy 2", "the second"]):
                if len(prev_recs) > 1:
                    picked_prod = self._resolve_prod(prev_recs[1])
            elif any(q == w or q.startswith(w) for w in ["3", "third", "third one", "option 3", "pick 3", "select 3", "choose 3", "buy 3", "the third"]):
                if len(prev_recs) > 2:
                    picked_prod = self._resolve_prod(prev_recs[2])
            elif prev_recs:
                for p in prev_recs:
                    p_name = getattr(p, "name", "") or (p.get("name") if isinstance(p, dict) else "")
                    if p_name and any(token in p_name.lower() for token in q.split() if len(token) > 3):
                        picked_prod = self._resolve_prod(p)
                        break

            if picked_prod:
                action = "select_product"
                selected_product_id = picked_prod.id

        # ---------------------------------------------------------------------
        # STEP 10: PURCHASE EXECUTION (Confirm & Execute AutoPay)
        # ---------------------------------------------------------------------
        is_purchase_action = (
            action == "confirm_autopay_purchase" or
            any(w in q for w in [
                "confirm purchase", "confirm autopay", "buy with autopay now", "buy with autopay",
                "execute order", "buy it now", "buy it", "buy this", "order this", "purchase this",
                "can you buy it", "please buy it", "buy autonomusly", "buy autonomously", "order it"
            ])
        )

        if is_purchase_action:
            target_prod = self.get_product_by_id(selected_product_id or "") or self._resolve_prod(prev_prod, query=q) or (self._resolve_prod(prev_recs[0], query=q) if prev_recs else None) or self._resolve_prod(None, query=q) or (self.products[0] if self.products else None)
            if not target_prod:
                return CommerceChatResponseDTO(
                    message="I couldn't find that information or product in our catalog.",
                    flow_step="PRODUCT_NOT_FOUND",
                    action_triggered="NONE"
                )
            chosen_addr = selected_address or prev_addr or (active_saved_addresses[0] if active_saved_addresses else None)
            order_qty = max(1, quantity or 1)
            total_price = float(target_prod.price * order_qty)

            if not is_autopay_ready:
                return build_mandate_required_response(target_prod, order_qty, chosen_addr)

            # Validate guardrails
            is_valid_limit = total_price <= single_limit
            is_valid_budget = (spent_month + total_price) <= monthly_budget
            effective_buy_uid = user_id or "usr_customer_demo"

            if autopay_enabled and is_valid_limit and is_valid_budget:
                try:
                    buy_res = ai_autopay_service.direct_one_click_buy(
                        product_id=target_prod.id,
                        quantity=order_qty,
                        user_id=effective_buy_uid,
                        custom_reason=f"Conversational Advisor Purchase of {target_prod.name}",
                        product_name=target_prod.name,
                        unit_price=target_prod.price,
                        category=target_prod.category,
                        is_autonomous_agent=True
                    )
                except ValueError as ve:
                    return build_mandate_required_response(target_prod, order_qty, chosen_addr)

                order_id = buy_res.get("order_id", f"ord_{uuid.uuid4().hex[:10]}")
                order_conf = buy_res.get("confirmation", {})
                tracking_id = f"DELHIVERY-{uuid.uuid4().hex[:8].upper()}"

                message = (
                    f"🎉 **Order #{order_id} Placed Successfully via AutoPay!**\n\n"
                    f"• **Product**: {target_prod.name} × {order_qty}\n"
                    f"• **Delivery Address**: {chosen_addr.get('address_line')}, {chosen_addr.get('city')}, {chosen_addr.get('state')} - {chosen_addr.get('pincode')}\n"
                    f"• **Payment Method**: {payment_method_name}\n"
                    f"• **Total Charged**: **₹{total_price:,.2f}** (Inclusive of 18% GST)\n"
                    f"• **Carrier**: Delhivery Express | **Tracking ID**: `{tracking_id}`\n"
                    f"• **Estimated Delivery**: {target_prod.delivery_eta or 'Tomorrow by 5:00 PM'}\n\n"
                    f"Your tax invoice and shipping dossier have been generated and archived in your account."
                )

                return CommerceChatResponseDTO(
                    message=message,
                    flow_step="AUTONOMOUS_PURCHASE",
                    action_triggered="AUTONOMOUS_PURCHASE",
                    selected_product=target_prod,
                    selected_address=chosen_addr,
                    autonomous_order=order_conf,
                    autopay_guardrail_info=autopay_guardrail_info,
                    suggested_prompts=[
                        f"Track order #{order_id}",
                        "View AutoPay Purchase History",
                        "View spending budget balance",
                        "Ask shopping advice for accessories"
                    ]
                )
            else:
                message = (
                    f"⚠️ **AutoPay Purchase Limit Check:**\n\n"
                    f"• **Product Price**: ₹{total_price:,.2f}\n"
                    f"• **Single Transaction Cap**: ₹{single_limit:,.2f}\n"
                    f"• **Monthly Budget Balance**: ₹{remaining_budget:,.2f}\n\n"
                    f"This purchase exceeds your configured AutoPay limits. Would you like to authorize this manually or complete checkout?"
                )
                return CommerceChatResponseDTO(
                    message=message,
                    flow_step="APPROVAL_REQUIRED",
                    requires_approval=True,
                    action_triggered="APPROVAL_REQUIRED",
                    selected_product=target_prod,
                    selected_address=chosen_addr,
                    autopay_guardrail_info=autopay_guardrail_info,
                    suggested_prompts=[
                        f"Approve purchase of {target_prod.name}",
                        "Increase my AutoPay limits",
                        "Return to product comparison"
                    ]
                )

        # ---------------------------------------------------------------------
        # STEP 8 & 9: ADDRESS SELECTED ➔ ORDER SUMMARY & AUTOPAY VALIDATION
        # ---------------------------------------------------------------------
        if action == "select_address" or any(w in q for w in ["ship to", "use address", "deliver to", "confirm address"]):
            target_prod = self.get_product_by_id(selected_product_id or "") or self._resolve_prod(None, query=q) or (self.products[0] if self.products else None)
            if not target_prod:
                return CommerceChatResponseDTO(
                    message="I couldn't find that information or product in our catalog.",
                    flow_step="PRODUCT_NOT_FOUND",
                    action_triggered="NONE"
                )
            chosen_addr = selected_address or (active_saved_addresses[0] if active_saved_addresses else None)
            order_qty = max(1, quantity or 1)

            unit_price = target_prod.price
            subtotal = unit_price * order_qty
            gst_amount = round(subtotal - (subtotal / 1.18), 2)
            base_price = round(subtotal - gst_amount, 2)
            delivery_fee = 0.0 # FREE
            total_amount = subtotal

            order_summary = {
                "product_id": target_prod.id,
                "product_name": target_prod.name,
                "product_image": target_prod.image_url,
                "quantity": order_qty,
                "unit_price": unit_price,
                "base_price": base_price,
                "gst_amount": gst_amount,
                "delivery_fee": delivery_fee,
                "total_amount": total_amount,
                "currency": "INR"
            }

            if is_autopay_ready:
                ready_msg = f"• **AutoPay**: {payment_method_name}\n\nReady to proceed? Say **'Confirm Purchase'** or click below to finalize your order autonomously."
                prompts = [
                    "Confirm Purchase with AutoPay",
                    "Change shipping address",
                    "Cancel and choose another product"
                ]
            else:
                ready_msg = f"• **AutoPay**: ⚠️ Not Connected\n\nSay **'Confirm'** to add this to your shopping cart and open Razorpay Checkout, or connect AutoPay in your account settings."
                prompts = [
                    "Confirm & Add to Cart",
                    "Connect UPI AutoPay",
                    "Change shipping address",
                    "Cancel and choose another product"
                ]

            message = (
                f"📋 **Order Summary & AutoPay Verification**\n\n"
                f"• **Item**: {target_prod.name} (Qty: {order_qty})\n"
                f"• **Subtotal**: ₹{subtotal:,.2f} (Includes ₹{gst_amount:,.2f} GST)\n"
                f"• **Delivery**: FREE Priority Delivery\n"
                f"• **Total Payable**: ₹{total_amount:,.2f}\n"
                f"• **Ship to**: {chosen_addr.get('label', 'Default Location')} ({chosen_addr.get('city')}, {chosen_addr.get('pincode')})\n"
                f"{ready_msg}"
            )

            return CommerceChatResponseDTO(
                message=message,
                flow_step="ORDER_CONFIRMATION",
                action_triggered="ORDER_CONFIRMATION",
                selected_product=target_prod,
                selected_address=chosen_addr,
                order_summary=order_summary,
                saved_addresses=active_saved_addresses,
                autopay_guardrail_info=autopay_guardrail_info,
                suggested_prompts=prompts
            )

        # ---------------------------------------------------------------------
        # STEP 7: SPECIFIC PRODUCT SELECTED ➔ SHOW SAVED ADDRESSES & AUTOPAY SUMMARY
        # ---------------------------------------------------------------------
        if action == "select_product" or (selected_product_id and not action):
            target_prod = self.get_product_by_id(selected_product_id or "") or self._resolve_prod(None, query=q) or (self.products[0] if self.products else None)
            if not target_prod:
                return CommerceChatResponseDTO(
                    message="I couldn't find that information or product in our catalog.",
                    flow_step="PRODUCT_NOT_FOUND",
                    action_triggered="NONE"
                )

            message = (
                f"🎯 **Great choice! You selected {target_prod.name}.**\n\n"
                f"• **Unit Price**: ₹{target_prod.price:,.2f} (Inclusive of 18% GST)\n"
                f"• **Estimated Delivery**: {target_prod.delivery_eta or 'Tomorrow by 5:00 PM'}\n\n"
                f"Where would you like us to ship this order? Select a saved delivery address below or add a new location:"
            )

            if active_saved_addresses:
                address_prompts = [f"Ship to {a['label']}" for a in active_saved_addresses[:3]] + ["Change product selection"]
            else:
                address_prompts = ["Add new delivery address", "Change product selection"]

            return CommerceChatResponseDTO(
                message=message,
                flow_step="ADDRESS_SELECTION",
                action_triggered="ADDRESS_SELECTION",
                selected_product=target_prod,
                saved_addresses=active_saved_addresses,
                autopay_guardrail_info=autopay_guardrail_info,
                suggested_prompts=address_prompts
            )

        # ---------------------------------------------------------------------
        # STEP 1 to 5: INTENT UNDERSTANDING ➔ MULTI-FACTOR RANKING ➔ TOP 3 COMPARISON & "WHY"
        # ---------------------------------------------------------------------
        advisor_res = ai_search_service.recommend(query=query or "", products=self.products, limit=3)
        top_3 = advisor_res.recommended_products
        if not top_3:
            top_3 = self.products[:3]
        lead_product = top_3[0]

        # Extract budget cap if present from parsed intent
        detected_budget = advisor_res.parsed_intent.budget if advisor_res.parsed_intent else None

        # Build side-by-side comparison matrix
        comparison_table = self.build_comparison_table(top_3)

        # Build structured AI reasoning ("WHY" engine)
        ai_reason = self.generate_ai_why_reasoning(lead_product, detected_budget)
        if lead_product.why_recommended:
            ai_reason["explanation"] = lead_product.why_recommended

        # Integrate AI Review Intelligence for top recommendations
        lead_intel = None
        try:
            from app.services.review_intelligence_service import review_intelligence_service
            lead_intel = review_intelligence_service.analyze_reviews(lead_product.id)
            lead_product.review_intelligence = lead_intel
            for prod in top_3:
                if not prod.review_intelligence:
                    prod.review_intelligence = review_intelligence_service.analyze_reviews(prod.id)
        except Exception:
            lead_intel = None

        # Generate shopping advisor message
        why_str = "\n".join([f"• {bullet}" for bullet in ai_reason["why_bullets"]])
        if lead_product.why_recommended:
            why_str = f"• **AI Advisor Verdict**: {lead_product.why_recommended}\n" + why_str

        # Check if customer specifically asked about reviews, pros & cons, or returns
        is_review_intent = any(w in q for w in [
            "pros and cons", "pro and con", "pros & cons", "review", "reviews",
            "sentiment", "satisfaction", "return", "dislike", "opinions",
            "what do customers think", "feedback", "rating", "tradeoff", "trade-off"
        ])

        # Check if customer specifically asked about EMI / installments
        is_emi_intent = any(w in q for w in ["emi", "installment", "installments", "pay in parts", "no cost emi", "monthly plan"])
        emi_block = ""
        if is_emi_intent or lead_product.price >= 10000:
            try:
                from app.services.emi_service import emi_service
                emi_res = emi_service.recommend_best_emi(lead_product.price)
                rec = emi_res.recommended_plan
                emi_block = (
                    f"\n\n💳 **AI Recommended EMI Plan for {lead_product.name}**:\n"
                    f"• **Best Option**: **{rec.tenure} Months {rec.emi_type.replace('_', ' ').title()}** at **₹{rec.emi_amount:,.2f}/month**\n"
                    f"• Interest Rate: **{rec.interest_rate}%** (Total Interest: ₹{rec.total_interest:,.2f})\n"
                    f"• Monthly Budget Impact: **Only {rec.monthly_burden_pct}%** of your disposable monthly cashflow\n"
                    f"• Available Tenures: 3, 6, 9, 12, 18, 24 Months (No Cost EMI available on 3 & 6 Months)"
                )
            except Exception:
                pass

        confidence_pct = int(advisor_res.confidence_score * 100) if advisor_res.confidence_score else 95

        review_intelligence_block = ""
        if lead_intel:
            pros_formatted = "\n".join([f"  {p}" for p in lead_intel.pros])
            cons_formatted = "\n".join([f"  {c}" for c in lead_intel.cons])
            review_intelligence_block = (
                f"\n\n### 🛡️ **AI Review Intelligence & Pre-Purchase Analysis**\n"
                f"• **Overall Satisfaction**: **{int(lead_intel.satisfaction_score)}%** ({lead_intel.customer_sentiment})\n"
                f"• **Verified Recommendation Rate**: **{int(lead_intel.recommendation_score)}%**\n"
                f"• **Pros**:\n{pros_formatted}\n"
                f"• **Cons**:\n{cons_formatted}\n"
                f"⚠️ **Before Checkout Notice**: *\"{lead_intel.before_checkout_summary}\"*"
            )

        # Generate dynamic Groq LLM response if API key is configured
        groq_message = None
        try:
            from app.services.groq_service import groq_service
            if groq_service.is_configured():
                groq_message = groq_service.generate_commerce_response(
                    query=query,
                    history=history,
                    products=top_3,
                    guardrails=autopay_guardrail_info,
                    review_intel=lead_intel,
                    is_review_intent=is_review_intent,
                    is_emi_intent=is_emi_intent
                )
        except Exception:
            groq_message = None

        if groq_message:
            from app.services.groq_service import normalize_ai_response
            message = normalize_ai_response(groq_message)
            if is_review_intent and ("pros" not in message.lower() or "cons" not in message.lower()):
                from app.services.groq_service import format_optimized_response
                message = format_optimized_response(
                    product=lead_product,
                    query=query,
                    is_emi_intent=is_emi_intent,
                    is_review_intent=is_review_intent,
                    review_intel=lead_intel
                )
        else:
            from app.services.groq_service import format_optimized_response
            message = format_optimized_response(
                product=lead_product,
                query=query,
                is_emi_intent=is_emi_intent,
                is_review_intent=is_review_intent,
                review_intel=lead_intel
            )


        return CommerceChatResponseDTO(
            message=message,
            flow_step="TOP_RECOMMENDATIONS",
            action_triggered="TOP_RECOMMENDATIONS",
            recommended_products=top_3,
            comparison_data=comparison_table,
            ai_recommendation_reason=ai_reason,
            recommendation_reason=advisor_res.recommendation_reason,
            confidence_score=advisor_res.confidence_score,
            parsed_intent=advisor_res.parsed_intent.model_dump() if advisor_res.parsed_intent else None,
            saved_addresses=active_saved_addresses,
            autopay_guardrail_info=autopay_guardrail_info,
            review_intelligence=lead_intel,
            before_checkout_summary=lead_intel.before_checkout_summary if lead_intel else None,
            suggested_prompts=[
                f"Select {top_3[0].name}",
                f"What are the pros and cons of {top_3[0].name}?",
                f"Select {top_3[1].name}",
                "Filter by another category"
            ]
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

    # =========================================================================
    # VOLUME TIER PRICING HELPER METHODS
    # =========================================================================
    def get_applicable_tier(
        self,
        price_tiers: Optional[Union[List[Dict[str, Any]], str]],
        quantity: int
    ) -> Optional[Dict[str, Any]]:
        return get_applicable_tier(price_tiers, quantity)

    def calculate_volume_discount(
        self,
        unit_price: float,
        quantity: int,
        tier: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        return calculate_volume_discount(unit_price, quantity, tier)

    def apply_volume_pricing(
        self,
        product: Any,
        quantity: int
    ) -> Dict[str, Any]:
        return apply_volume_pricing(product, quantity)


commerce_service = CommerceService()
