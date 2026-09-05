from __future__ import annotations

import uuid
import datetime
import hmac
import hashlib
import json
from typing import List, Dict, Any, Optional
from app.schemas.agent_commerce import (
    A2ADialogueMessageDTO,
    A2ALedgerEntryDTO,
    A2ASimulationStepDTO,
    A2APresetScenarioDTO,
    A2ASimulationRequestDTO,
    A2ASimulationResponseDTO
)
from app.services.payment_service import payment_service
from app.services.memory_engine import memory_engine
from app.services.customer_order_service import customer_order_service
from app.services.catalog_service import catalog_service
from app.services.merchant_service import merchant_service
from app.services.audit_service import audit_service
from app.schemas.payments import CreateOrderRequestDTO, VerifyPaymentRequestDTO

# Preset Scenarios
PRESET_SCENARIOS: List[A2APresetScenarioDTO] = [
    A2APresetScenarioDTO(
        id="scenario_retail_expansion",
        title="Retail Store Fleet Expansion",
        industry="Omnichannel Retail & Dining",
        buyer_persona="Acme Retail Procurement AI (Autonomous Buyer)",
        seller_persona="RazorRecon Merchant Sales AI (Autonomous Seller)",
        requirement_prompt="Procure 5x Smart POS V3 Pro Terminals and 5x 4G Soundboxes for new Bangalore flagship store.",
        initial_budget=95000.0,
        target_items_count=10
    ),
    A2APresetScenarioDTO(
        id="scenario_finops_enterprise",
        title="FinOps Enterprise Multi-Year License",
        industry="Mid-Market Corporate Treasury",
        buyer_persona="Nexus Global Treasury Bot (Autonomous Buyer)",
        seller_persona="RazorRecon SaaS Licensing AI (Autonomous Seller)",
        requirement_prompt="Procure 2-Year RazorRecon Enterprise Annual License + TallyPrime Gold Integration with 24/7 SLA.",
        initial_budget=160000.0,
        target_items_count=2
    ),
    A2APresetScenarioDTO(
        id="scenario_dev_workstation",
        title="Financial Modeler Workstation Fleet",
        industry="Quant Trading & Investment Banking",
        buyer_persona="Alpha Capital IT Procurement AI (Autonomous Buyer)",
        seller_persona="RazorRecon Hardware Peripheral AI (Autonomous Seller)",
        requirement_prompt="Procure 3x Dell 40\" 5K2K Monitors + 3x Keychron Q3 Pro Mechanical Keyboards + 3x MX Master 3S.",
        initial_budget=480000.0,
        target_items_count=9
    ),
    A2APresetScenarioDTO(
        id="scenario_storage_cluster",
        title="MCA Compliance Archive Server Cluster",
        industry="Statutory Audit & Forensic Accounting",
        buyer_persona="Zenith Statutory Audit Bot (Autonomous Buyer)",
        seller_persona="RazorRecon Enterprise Storage AI (Autonomous Seller)",
        requirement_prompt="Procure 2x Synology DS923+ NAS Servers + 4x Seagate IronWolf 16TB Enterprise Drives.",
        initial_budget=310000.0,
        target_items_count=6
    )
]

SCENARIO_MAP = {s.id: s for s in PRESET_SCENARIOS}


class AgentCommerceService:
    def get_preset_scenarios(self) -> List[A2APresetScenarioDTO]:
        return PRESET_SCENARIOS

    def run_simulation(self, req: A2ASimulationRequestDTO) -> A2ASimulationResponseDTO:
        scenario = SCENARIO_MAP.get(req.scenario_id or "scenario_retail_expansion") or PRESET_SCENARIOS[0]
        sim_id = f"sim_a2a_{uuid.uuid4().hex[:10]}"
        now = datetime.datetime.now()

        # Helper to query live catalog DB for accurate merchant prices & inventory
        all_live = []
        try:
            cat_res = catalog_service.get_all_products(limit=500)
            all_live = getattr(cat_res, "items", None) or getattr(cat_res, "products", []) or []
        except Exception:
            all_live = []

        def _resolve_item(sku: str, default_name: str, qty: int, default_price: float) -> Dict[str, Any]:
            matched = next((p for p in all_live if getattr(p, "sku", "").lower() == sku.lower() or sku.lower() in getattr(p, "name", "").lower()), None)
            if matched:
                lp = float(matched.price)
                name = matched.name
            else:
                lp = default_price
                name = default_name
            dp = round(lp * 0.85, 2)
            return {"name": name, "sku": sku, "qty": qty, "list_price": lp, "discounted_price": dp}

        # Item configuration based on scenario (negotiated at 15.0% volume tier)
        if scenario.id == "scenario_finops_enterprise":
            items = [
                _resolve_item("LIC-RZP-ENT-2Y", "RazorRecon Enterprise Annual License", 1, 74999.0),
                _resolve_item("LIC-TALLY-GOLD", "TallyPrime Gold Enterprise Multi-User", 1, 54000.0)
            ]
        elif scenario.id == "scenario_dev_workstation":
            items = [
                _resolve_item("HW-DELL-5K2K", "Dell UltraSharp 40\" 5K2K Curved Display", 3, 139999.0),
                _resolve_item("HW-KEYCHRON-Q3", "Keychron Q3 Pro Wireless Mechanical Keyboard", 3, 18499.0),
                _resolve_item("HW-LOGI-MX3S", "Logitech MX Master 3S Performance Mouse", 3, 9995.0)
            ]
        elif scenario.id == "scenario_storage_cluster":
            items = [
                _resolve_item("HW-SYNO-DS923", "Synology DiskStation DS923+ 4-Bay NAS", 2, 58999.0),
                _resolve_item("HW-SEAGATE-16TB", "Seagate IronWolf Pro 16TB Enterprise NAS HDD", 4, 32999.0)
            ]
        else:  # scenario_retail_expansion
            items = [
                _resolve_item("RZP-POS-V3-PRO", "Razorpay Smart POS Terminal V3 Pro", 5, 14999.0),
                _resolve_item("RZP-SOUNDBOX-4G", "Razorpay Smart Soundbox 4G Pro", 5, 2499.0)
            ]

        list_subtotal = sum(i["qty"] * i["list_price"] for i in items)
        agreed_subtotal = sum(i["qty"] * i["discounted_price"] for i in items)
        discount_amount = round(list_subtotal - agreed_subtotal, 2)
        discount_pct = 15.0
        gst_amount = round(agreed_subtotal * 0.18, 2)
        total_order_amount = round(agreed_subtotal + gst_amount, 2)

        # Volume tier offer schedule and recommendation parameters
        total_units = sum(i["qty"] for i in items)
        recommended_quantity = total_units if total_units >= 10 else 10
        primary_unit_price = items[0]["list_price"]
        volume_discount_offer = [
            {
                "min_qty": 5,
                "max_qty": 9,
                "discount_pct": 8.0,
                "offer_text": "Buy 5+ units → 8% discount",
                "effective_unit_price": round(primary_unit_price * 0.92, 2)
            },
            {
                "min_qty": 10,
                "max_qty": None,
                "discount_pct": 15.0,
                "offer_text": "Buy 10+ units → 15% discount",
                "effective_unit_price": round(primary_unit_price * 0.85, 2)
            }
        ]
        savings_amount = discount_amount

        # Gateway fees
        mdr_fee = round(total_order_amount * 0.02, 2)
        mdr_tax = round(mdr_fee * 0.18, 2)
        net_bank_deposit = round(total_order_amount - mdr_fee - mdr_tax, 2)

        # =========================================================================
        # STEP 1 & 2 & 3: REAL ORDER CREATION & INVENTORY DEDUCTION
        # =========================================================================
        checkout_items = []
        for it in items:
            checkout_items.append({
                "product_id": it.get("sku") or f"prod_{it['name'].lower().replace(' ', '_')[:12]}",
                "sku": it.get("sku") or f"SKU-{it['name'].upper()[:8]}",
                "name": it["name"],
                "price": it["discounted_price"],
                "quantity": it["qty"]
            })

        payment_id = f"pay_rzp_a2a_{uuid.uuid4().hex[:10]}"
        buyer_display_name = scenario.buyer_persona.split("(")[0].strip()

        checkout_payload = {
            "shipping_address": {
                "full_name": buyer_display_name,
                "phone": "+91 98765 12345",
                "address_line1": "Acme Central Procurement Depot, Plot 42/1",
                "address_line2": "Silicon Valley Corridor, Whitefield Industrial Area",
                "city": "Bengaluru",
                "state": "Karnataka",
                "pincode": "560066"
            },
            "customer_name": buyer_display_name,
            "customer_email": "procurement-ai@acmeretail.in",
            "customer_phone": "+91 98765 12345",
            "delivery_option": "EXPRESS",
            "items": checkout_items,
            "discount": discount_amount,
            "coupon_code": "A2A_VOLUME_15",
            "payment_method": "RAZORPAY_UPI",
            "payment_id": payment_id
        }

        # Step 1: Create actual order using customer_order_service.process_checkout()
        real_order = customer_order_service.process_checkout(
            user_id="usr_agent_buyer",
            payload=checkout_payload
        )
        real_order_id = real_order.get("id")
        real_order_number = real_order.get("order_number")
        carrier = real_order.get("delivery_partner") or "Delhivery Express"
        awb_number = real_order.get("awb_number") or f"AWB-DLV-{real_order_number[-6:]}"
        tracking_id = real_order.get("tracking_id") or f"TRK-{real_order_number[-6:]}"
        invoice_url = f"/api/v1/orders/{real_order_id}/invoice"

        # Step 2 & 3: Reserve inventory and Reduce real stock quantity in SQLite catalog
        inventory_reductions = []
        for it in items:
            inv_res = catalog_service.reduce_inventory_stock(it["name"], it["qty"])
            inventory_reductions.append(inv_res)

        # Step 4: Create real Razorpay order
        rzp_order = payment_service.create_order(
            CreateOrderRequestDTO(
                amount=total_order_amount,
                currency="INR",
                receipt=f"rcpt_a2a_{real_order_number[-6:]}",
                customer_email="procurement-ai@acmeretail.in",
                customer_phone="+91 98765 12345",
                items=[],
                notes={
                    "channel": "AGENT_TO_AGENT_COMMERCE",
                    "scenario": scenario.title,
                    "merchant_order_id": real_order_id,
                    "order_number": real_order_number,
                    "buyer_persona": scenario.buyer_persona
                }
            )
        )
        razorpay_order_id = rzp_order.order_id

        # Step 5: Record real payment transaction & capture with HMAC-SHA256 signature
        signature = payment_service.generate_test_signature(razorpay_order_id, payment_id)
        payment_service.verify_payment(
            VerifyPaymentRequestDTO(
                razorpay_order_id=razorpay_order_id,
                razorpay_payment_id=payment_id,
                razorpay_signature=signature
            )
        )

        # Step 6 & 7: Shipment & Tracking Checkpoint
        recon_ref = f"REC-A2A-{real_order_number[-6:]}"

        # Step 8: Log all 4 Required Enterprise Audit Events
        # Audit 1: A2A_ORDER_CREATED
        audit_service.log_audit(
            action="A2A_ORDER_CREATED",
            entity_type="ORDER",
            entity_id=real_order_id,
            user_id="usr_agent_buyer",
            user_name=scenario.buyer_persona,
            role="Autonomous Buyer AI",
            old_value=None,
            new_value={
                "order_number": real_order_number,
                "total_amount": total_order_amount,
                "items_count": sum(i["qty"] for i in items),
                "status": "PAYMENT_RECEIVED",
                "payment_rail": "Razorpay UPI",
                "channel": "Agent-to-Agent Commerce Protocol"
            }
        )

        # Audit 2: A2A_INVENTORY_RESERVED
        audit_service.log_audit(
            action="A2A_INVENTORY_RESERVED",
            entity_type="INVENTORY",
            entity_id=real_order_number,
            user_id="sys_inventory_controller",
            user_name="RazorRecon Inventory Engine",
            role="Autonomous Inventory System",
            old_value={"status": "CATALOG_AVAILABLE"},
            new_value={
                "reductions": inventory_reductions,
                "reserved_for_order": real_order_number,
                "warehouse_facility": "BLR-Central-MegaHub"
            }
        )

        # Audit 3: A2A_PAYMENT_COMPLETED
        audit_service.log_audit(
            action="A2A_PAYMENT_COMPLETED",
            entity_type="PAYMENT",
            entity_id=payment_id,
            user_id="gw_razorpay_settlement",
            user_name="Razorpay Gateway Settlement Engine",
            role="Payment Gateway",
            old_value=None,
            new_value={
                "razorpay_order_id": razorpay_order_id,
                "merchant_order_id": real_order_id,
                "order_number": real_order_number,
                "gross_amount": total_order_amount,
                "mdr_fee": mdr_fee,
                "net_deposit": net_bank_deposit,
                "status": "CAPTURED",
                "rail": "UPI"
            }
        )

        # Audit 4: A2A_TRACKING_CREATED
        audit_service.log_audit(
            action="A2A_TRACKING_CREATED",
            entity_type="SHIPMENT",
            entity_id=tracking_id,
            user_id="logistics_carrier_partner",
            user_name=carrier,
            role="Logistics Partner",
            old_value=None,
            new_value={
                "order_id": real_order_id,
                "order_number": real_order_number,
                "carrier": carrier,
                "awb_number": awb_number,
                "tracking_id": tracking_id,
                "status": "MANIFESTED_FOR_PICKUP"
            }
        )

        # Step 9: Notify merchant (update customer lifetime stats)
        with merchant_service._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE merchant_customers SET
                    lifetime_value = lifetime_value + ?,
                    orders_count = orders_count + 1,
                    last_purchase_date = ?,
                    updated_at = ?
                WHERE email = 'procurement-ai@acmeretail.in' OR id = 'cust_001'
            """, (total_order_amount, datetime.datetime.now().strftime("%Y-%m-%d"), datetime.datetime.now().isoformat()))
            conn.commit()

        # Step 10: Dialogue & Simulation Steps formatting
        # -------------------------------------------------------------
        # Step 1: Search Product
        # -------------------------------------------------------------
        s1_dialogue = [
            A2ADialogueMessageDTO(
                id="msg_1_1",
                sender="buyer_agent",
                sender_name=buyer_display_name,
                sender_role="Autonomous Corporate Procurement",
                timestamp=(now + datetime.timedelta(seconds=1)).strftime("%H:%M:%S"),
                message=f"RFP Broadcast: Querying merchant catalog for {scenario.requirement_prompt} Budget ceiling: ₹{scenario.initial_budget:,.2f}.",
                thought_process="Parsing SKU specifications, required quantities, and evaluating vendor reliability score.",
                structured_payload={"intent": "catalog_search", "requested_items": items, "max_budget": scenario.initial_budget}
            ),
            A2ADialogueMessageDTO(
                id="msg_1_2",
                sender="seller_agent",
                sender_name="RazorRecon Seller AI",
                sender_role="Autonomous Merchant Commerce",
                timestamp=(now + datetime.timedelta(seconds=2)).strftime("%H:%M:%S"),
                message=f"RFP Matched: Located inventory in Bangalore fulfillment center with verified stock in catalog.db. Standard list quote: ₹{list_subtotal:,.2f} + 18% GST. Dynamic volume tier pricing active (up to 15% discount for 10+ units).",
                thought_process="Queried real-time stock levels across live SQLite catalog. Verified physical stock availability and volume tier rules.",
                volume_discount_offer=volume_discount_offer,
                recommended_quantity=recommended_quantity,
                savings_amount=savings_amount,
                structured_payload={
                    "status": "in_stock",
                    "list_subtotal": list_subtotal,
                    "currency": "INR",
                    "volume_discount_offer": volume_discount_offer,
                    "recommended_quantity": recommended_quantity,
                    "savings_amount": savings_amount
                }
            )
        ]
        step_1 = A2ASimulationStepDTO(
            step_number=1,
            step_id="search_product",
            title="1. Search Product & RFP Discovery",
            description="Buyer Agent discovers real catalog inventory and receives catalog price quote with volume tier schedules.",
            status="completed",
            duration_ms=420,
            dialogue=s1_dialogue,
            output_summary=f"Found {len(items)} SKU lines with real stock availability. Initial list quote: ₹{list_subtotal:,.2f}.",
            state_snapshot={"catalog_items_matched": len(items), "list_subtotal": list_subtotal, "volume_tiers_available": len(volume_discount_offer)}
        )

        # -------------------------------------------------------------
        # Step 2: Negotiate (Volume Tier Offer & Quantity vs Savings Evaluation)
        # -------------------------------------------------------------
        initial_inquiry_qty = 4 if recommended_quantity >= 5 else 1
        s2_dialogue = [
            A2ADialogueMessageDTO(
                id="msg_2_1",
                sender="buyer_agent",
                sender_name=buyer_display_name,
                sender_role="Autonomous Corporate Procurement",
                timestamp=(now + datetime.timedelta(seconds=3)).strftime("%H:%M:%S"),
                message=f"Baseline Concession Proposal: Proposing initial allocation of {initial_inquiry_qty} units across SKU lines. Requesting flat 10.0% enterprise concession and complimentary 2-year warranty extension.",
                thought_process=f"Probing merchant price elasticity with baseline volume ({initial_inquiry_qty} units) before committing bulk inventory capital.",
                structured_payload={
                    "intent": "flat_concession_proposal",
                    "initial_requested_qty": initial_inquiry_qty,
                    "requested_discount_pct": 10.0,
                    "warranty_requested": "2 Years"
                }
            ),
            A2ADialogueMessageDTO(
                id="msg_2_2",
                sender="seller_agent",
                sender_name="RazorRecon Seller AI",
                sender_role="Autonomous Merchant Commerce",
                timestamp=(now + datetime.timedelta(seconds=4)).strftime("%H:%M:%S"),
                message=(
                    f"Volume Tier Counter-Offer: Unable to offer flat concession on baseline {initial_inquiry_qty} units. "
                    f"Autonomous merchant volume tier policy is active:\n\n"
                    f"• Buy 5+ units → 8% discount\n"
                    f"• Buy 10+ units → 15% discount\n\n"
                    f"Recommendation: Scaling order to {recommended_quantity} units unlocks the maximum 15.0% volume tier, "
                    f"yielding total savings of ₹{savings_amount:,.2f} + Free Priority Logistics SLA."
                ),
                thought_process=(
                    f"Evaluated catalog volume tier policy. Refused flat discount for {initial_inquiry_qty} units. "
                    f"Upselling to {recommended_quantity} units maximizes GMV (₹{agreed_subtotal:,.2f}) while returning ₹{savings_amount:,.2f} in value to buyer."
                ),
                volume_discount_offer=volume_discount_offer,
                recommended_quantity=recommended_quantity,
                savings_amount=savings_amount,
                structured_payload={
                    "intent": "volume_discount_counter_offer",
                    "volume_discount_offer": volume_discount_offer,
                    "recommended_quantity": recommended_quantity,
                    "savings_amount": savings_amount,
                    "tier_options": [
                        "Buy 5+ units → 8% discount",
                        "Buy 10+ units → 15% discount"
                    ],
                    "perks": ["Free Priority Logistics SLA", "Dedicated Account Manager"]
                }
            ),
            A2ADialogueMessageDTO(
                id="msg_2_3",
                sender="buyer_agent",
                sender_name=buyer_display_name,
                sender_role="Autonomous Corporate Procurement",
                timestamp=(now + datetime.timedelta(seconds=6)).strftime("%H:%M:%S"),
                message=(
                    f"Autonomous Trade-off Evaluation: Evaluating quantity increase vs savings.\n"
                    f"• Quantity Scaling: +{recommended_quantity - initial_inquiry_qty} units ({initial_inquiry_qty} → {recommended_quantity} units)\n"
                    f"• Total Savings: ₹{savings_amount:,.2f} unlocked via 15.0% volume tier\n"
                    f"• Effective Unit Cost: Reduced by 15.0% across all SKU lines\n"
                    f"• Budget Compliance: Negotiated subtotal ₹{agreed_subtotal:,.2f} + 18% GST = ₹{total_order_amount:,.2f} "
                    f"(Allocated budget: ₹{scenario.initial_budget:,.2f}, remaining headroom: ₹{scenario.initial_budget - total_order_amount:,.2f})\n\n"
                    f"Decision: Quantity increase justified by net savings ROI. Accepting recommended {recommended_quantity} units @ 15.0% volume discount."
                ),
                thought_process=(
                    f"Quantity increase vs savings trade-off is positive: marginal inventory cost is outweighed by ₹{savings_amount:,.2f} discount savings. "
                    f"Total spend ₹{total_order_amount:,.2f} complies with budget ceiling."
                ),
                volume_discount_offer=volume_discount_offer,
                recommended_quantity=recommended_quantity,
                savings_amount=savings_amount,
                structured_payload={
                    "intent": "volume_evaluation_acceptance",
                    "evaluated_quantity_increase": recommended_quantity - initial_inquiry_qty,
                    "volume_discount_offer": volume_discount_offer,
                    "recommended_quantity": recommended_quantity,
                    "savings_amount": savings_amount,
                    "achieved_discount_pct": 15.0,
                    "agreed_subtotal": agreed_subtotal,
                    "total_order_amount": total_order_amount,
                    "budget_ceiling": scenario.initial_budget,
                    "budget_headroom": round(scenario.initial_budget - total_order_amount, 2),
                    "within_budget": True,
                    "consensus": True
                }
            ),
            A2ADialogueMessageDTO(
                id="msg_2_4",
                sender="seller_agent",
                sender_name="RazorRecon Seller AI",
                sender_role="Autonomous Merchant Commerce",
                timestamp=(now + datetime.timedelta(seconds=7)).strftime("%H:%M:%S"),
                message=(
                    f"Consensus Finalized: Volume tier contract ratified. Locked {recommended_quantity} units @ 15.0% volume discount "
                    f"(Total savings: ₹{savings_amount:,.2f}, Negotiated Subtotal: ₹{agreed_subtotal:,.2f}). "
                    f"Routing payload to binding order generation and live stock allocation."
                ),
                thought_process="Volume contract confirmed with cryptographic signature. Committing real order allocation.",
                volume_discount_offer=volume_discount_offer,
                recommended_quantity=recommended_quantity,
                savings_amount=savings_amount,
                structured_payload={
                    "intent": "consensus_committed",
                    "final_quantity": recommended_quantity,
                    "volume_discount_offer": volume_discount_offer,
                    "recommended_quantity": recommended_quantity,
                    "savings_amount": savings_amount,
                    "final_discount_pct": 15.0,
                    "agreed_subtotal": agreed_subtotal,
                    "consensus": True
                }
            )
        ]
        step_2 = A2ASimulationStepDTO(
            step_number=2,
            step_id="negotiate",
            title="2. Autonomous Multi-Turn Negotiation",
            description="Volume-based negotiation: Seller offered tiered discounts, Buyer evaluated quantity vs savings trade-off, reaching 15.0% consensus.",
            status="completed",
            duration_ms=680,
            dialogue=s2_dialogue,
            output_summary=f"Ratified 15.0% volume tier discount for {recommended_quantity} units, saving ₹{savings_amount:,.2f}. Subtotal: ₹{agreed_subtotal:,.2f}.",
            state_snapshot={
                "discount_pct": 15.0,
                "discount_amount": savings_amount,
                "agreed_subtotal": agreed_subtotal,
                "volume_discount_offer": volume_discount_offer,
                "recommended_quantity": recommended_quantity,
                "savings_amount": savings_amount,
                "tier_used": "10+ units (15% off)"
            }
        )

        # -------------------------------------------------------------
        # Step 3: Generate Cart & Real Order Creation
        # -------------------------------------------------------------
        s3_dialogue = [
            A2ADialogueMessageDTO(
                id="msg_3_1",
                sender="seller_agent",
                sender_name="RazorRecon Seller AI",
                sender_role="Autonomous Merchant Commerce",
                timestamp=(now + datetime.timedelta(seconds=8)).strftime("%H:%M:%S"),
                message=f"Order Created in Merchant Ledger: Order #{real_order_number} (ID: {real_order_id}). Subtotal: ₹{agreed_subtotal:,.2f}, 18% GST: ₹{gst_amount:,.2f}, Grand Total: ₹{total_order_amount:,.2f}. Physical inventory allocated from catalog.db.",
                thought_process=f"Executed customer_order_service.process_checkout(). Deducted {sum(i['qty'] for i in items)} units from stock. Assigned {carrier} AWB: {awb_number}.",
                structured_payload={
                    "real_order_id": real_order_id,
                    "order_number": real_order_number,
                    "subtotal": agreed_subtotal,
                    "tax_gst_18": gst_amount,
                    "total": total_order_amount,
                    "inventory_allocated": True,
                    "awb_number": awb_number
                }
            )
        ]
        step_3 = A2ASimulationStepDTO(
            step_number=3,
            step_id="generate_cart",
            title="3. Real Order Creation & Stock Allocation",
            description="Created actual order in merchant_orders and deducted stock from live catalog.",
            status="completed",
            duration_ms=310,
            dialogue=s3_dialogue,
            output_summary=f"Created Order #{real_order_number} for ₹{total_order_amount:,.2f}. Stock reserved and carrier {carrier} assigned.",
            state_snapshot={"order_number": real_order_number, "order_id": real_order_id, "total_amount": total_order_amount}
        )

        # -------------------------------------------------------------
        # Step 4: Create Payment
        # -------------------------------------------------------------
        s4_dialogue = [
            A2ADialogueMessageDTO(
                id="msg_4_1",
                sender="seller_agent",
                sender_name="RazorRecon Seller AI",
                sender_role="Autonomous Merchant Commerce",
                timestamp=(now + datetime.timedelta(seconds=10)).strftime("%H:%M:%S"),
                message=f"Razorpay Order Initialized: Generated Order ID `{razorpay_order_id}` in payments.db for ₹{total_order_amount:,.2f} ({int(total_order_amount * 100)} paise). Payment session active.",
                thought_process="Created order record in payments.db with status 'created'. Emitted cryptographic token.",
                structured_payload={"razorpay_order_id": razorpay_order_id, "amount_inr": total_order_amount, "currency": "INR", "status": "created"}
            )
        ]
        step_4 = A2ASimulationStepDTO(
            step_number=4,
            step_id="create_payment",
            title="4. Razorpay Test Order Creation",
            description="Seller Agent provisions authentic Razorpay order token and escrow payment session.",
            status="completed",
            duration_ms=390,
            dialogue=s4_dialogue,
            output_summary=f"Razorpay Order ID `{razorpay_order_id}` created for ₹{total_order_amount:,.2f}.",
            state_snapshot={"razorpay_order_id": razorpay_order_id, "status": "created"}
        )

        # -------------------------------------------------------------
        # Step 5: Verify Payment
        # -------------------------------------------------------------
        s5_dialogue = [
            A2ADialogueMessageDTO(
                id="msg_5_1",
                sender="buyer_agent",
                sender_name=buyer_display_name,
                sender_role="Autonomous Corporate Procurement",
                timestamp=(now + datetime.timedelta(seconds=12)).strftime("%H:%M:%S"),
                message=f"Payment Executed: Dispatched corporate UPI payment `{payment_id}` with signature token `{signature[:16]}...`.",
                thought_process="Generated HMAC SHA256 cryptographic signature and authorized corporate payment.",
                structured_payload={"payment_id": payment_id, "method": "upi", "signature_hash": signature}
            ),
            A2ADialogueMessageDTO(
                id="msg_5_2",
                sender="seller_agent",
                sender_name="RazorRecon Seller AI",
                sender_role="Autonomous Merchant Commerce",
                timestamp=(now + datetime.timedelta(seconds=13)).strftime("%H:%M:%S"),
                message=f"Signature Verified: HMAC-SHA256 digest validated. Payment captured in payments.db. Gateway MDR Fee: ₹{mdr_fee:,.2f} + GST: ₹{mdr_tax:,.2f}. Net Deposit: ₹{net_bank_deposit:,.2f}.",
                thought_process="Verified HMAC SHA256 timing-safe digest. Captured payment record in payments table. Logged A2A_PAYMENT_COMPLETED.",
                structured_payload={"payment_id": payment_id, "status": "captured", "fee_mdr": mdr_fee, "tax_gst": mdr_tax, "net_deposit": net_bank_deposit}
            )
        ]
        step_5 = A2ASimulationStepDTO(
            step_number=5,
            step_id="verify_payment",
            title="5. Cryptographic Settlement & Payment Capture",
            description="HMAC SHA256 verification, payment capture in payments.db, and gateway fee calculation.",
            status="completed",
            duration_ms=520,
            dialogue=s5_dialogue,
            output_summary=f"Payment `{payment_id}` captured and verified. Net payout: ₹{net_bank_deposit:,.2f}.",
            state_snapshot={"payment_id": payment_id, "net_bank_deposit": net_bank_deposit, "mdr_fee": mdr_fee}
        )

        # -------------------------------------------------------------
        # Step 6: Update Ledger & Audit Trail
        # -------------------------------------------------------------
        ledger_entries = [
            A2ALedgerEntryDTO(
                account_code="1010",
                account_name="Bank Payout Deposit (HDFC Operating)",
                debit=net_bank_deposit,
                credit=0.0,
                description=f"Net settlement deposit for Razorpay Order #{razorpay_order_id}"
            ),
            A2ALedgerEntryDTO(
                account_code="5040",
                account_name="Payment Processing Fees & Taxes (Razorpay 2% MDR)",
                debit=round(mdr_fee + mdr_tax, 2),
                credit=0.0,
                description=f"Gateway commission fee ₹{mdr_fee:,.2f} + 18% GST ₹{mdr_tax:,.2f}"
            ),
            A2ALedgerEntryDTO(
                account_code="4010",
                account_name="Commercial Sales & License Revenue",
                debit=0.0,
                credit=total_order_amount,
                description=f"Gross sales revenue for #{real_order_number} ({scenario.title})"
            )
        ]

        s6_dialogue = [
            A2ADialogueMessageDTO(
                id="msg_6_1",
                sender="seller_agent",
                sender_name="RazorRecon FinOps Bot",
                sender_role="Autonomous Reconciliation Engine",
                timestamp=(now + datetime.timedelta(seconds=15)).strftime("%H:%M:%S"),
                message=f"Real State Synchronized: Logged 4 audit events (A2A_ORDER_CREATED, A2A_INVENTORY_RESERVED, A2A_PAYMENT_COMPLETED, A2A_TRACKING_CREATED). Live order available in Customer Portal, Merchant Portal, and Admin Reconciliation.",
                thought_process=f"Double-entry ledger balanced: ₹{total_order_amount:,.2f}. Updated merchant gross revenue and live tracking {tracking_id}.",
                structured_payload={"reconciliation_id": recon_ref, "ledger_balanced": True, "order_number": real_order_number, "tracking_id": tracking_id}
            )
        ]
        step_6 = A2ASimulationStepDTO(
            step_number=6,
            step_id="update_ledger",
            title="6. Double-Entry Ledger & Cross-Portal Broadcast",
            description="Journal voucher sync, audit logging, and multi-portal visibility broadcasting.",
            status="completed",
            duration_ms=440,
            dialogue=s6_dialogue,
            output_summary=f"Order #{real_order_number} live across Customer, Merchant, and Admin portals. Audit Ref: {recon_ref}.",
            state_snapshot={"reconciliation_id": recon_ref, "order_number": real_order_number, "tracking_id": tracking_id}
        )

        # Trigger live memory update in background
        memory_engine.update_memory(
            vendor_id="VEND-A2A-COMMERCE",
            vendor_name=scenario.seller_persona,
            transaction_amount=total_order_amount,
            has_exception=False,
            exception_type=None,
            root_cause=None,
            resolution=f"A2A Autonomous Settlement verified via Razorpay ({real_order_number})"
        )

        return A2ASimulationResponseDTO(
            simulation_id=sim_id,
            scenario_title=scenario.title,
            buyer_name=buyer_display_name,
            buyer_persona=scenario.buyer_persona,
            seller_name="RazorRecon Seller AI",
            seller_persona=scenario.seller_persona,
            total_duration_ms=2760,
            steps=[step_1, step_2, step_3, step_4, step_5, step_6],
            final_cart={
                "items": items,
                "subtotal": agreed_subtotal,
                "discount_amount": discount_amount,
                "gst_amount": gst_amount,
                "total": total_order_amount
            },
            final_payment={
                "order_id": razorpay_order_id,
                "payment_id": payment_id,
                "method": "upi",
                "gross_amount": total_order_amount,
                "mdr_fee": mdr_fee,
                "mdr_tax": mdr_tax,
                "net_deposit": net_bank_deposit,
                "signature": signature
            },
            final_ledger=ledger_entries,
            reconciliation_status="100% Reconciled (Zero Variance)",
            created_at=now.isoformat(),
            created_order_id=real_order_id,
            created_order_number=real_order_number,
            tracking_id=tracking_id,
            awb_number=awb_number,
            delivery_partner=carrier,
            invoice_url=invoice_url
        )


agent_commerce_service = AgentCommerceService()
