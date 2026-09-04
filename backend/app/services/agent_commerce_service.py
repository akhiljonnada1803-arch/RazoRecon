from __future__ import annotations

import uuid
import datetime
import hmac
import hashlib
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

        # Item configuration based on scenario
        if scenario.id == "scenario_finops_enterprise":
            items = [
                {"name": "RazorRecon Enterprise Annual License", "qty": 1, "list_price": 74999.0, "discounted_price": 67499.10},
                {"name": "TallyPrime Gold Enterprise Multi-User", "qty": 1, "list_price": 54000.0, "discounted_price": 48600.00}
            ]
        elif scenario.id == "scenario_dev_workstation":
            items = [
                {"name": "Dell UltraSharp 40\" 5K2K Curved Display", "qty": 3, "list_price": 139999.0, "discounted_price": 125999.10},
                {"name": "Keychron Q3 Pro Wireless Mechanical Keyboard", "qty": 3, "list_price": 18499.0, "discounted_price": 16649.10},
                {"name": "Logitech MX Master 3S Performance Mouse", "qty": 3, "list_price": 9995.0, "discounted_price": 8995.50}
            ]
        elif scenario.id == "scenario_storage_cluster":
            items = [
                {"name": "Synology DiskStation DS923+ 4-Bay NAS", "qty": 2, "list_price": 58999.0, "discounted_price": 53099.10},
                {"name": "Seagate IronWolf Pro 16TB Enterprise NAS HDD", "qty": 4, "list_price": 32999.0, "discounted_price": 29699.10}
            ]
        else: # scenario_retail_expansion
            items = [
                {"name": "Razorpay Smart POS Terminal V3 Pro", "qty": 5, "list_price": 14999.0, "discounted_price": 13499.10},
                {"name": "Razorpay Smart Soundbox 4G Pro", "qty": 5, "list_price": 2499.0, "discounted_price": 2249.10}
            ]

        list_subtotal = sum(i["qty"] * i["list_price"] for i in items)
        agreed_subtotal = sum(i["qty"] * i["discounted_price"] for i in items)
        discount_amount = round(list_subtotal - agreed_subtotal, 2)
        discount_pct = 10.0
        gst_amount = round(agreed_subtotal * 0.18, 2)
        total_order_amount = round(agreed_subtotal + gst_amount, 2)

        # Gateway fees
        mdr_fee = round(total_order_amount * 0.02, 2)
        mdr_tax = round(mdr_fee * 0.18, 2)
        net_bank_deposit = round(total_order_amount - mdr_fee - mdr_tax, 2)

        order_id = f"order_rzp_{uuid.uuid4().hex[:12]}"
        payment_id = f"pay_rzp_{uuid.uuid4().hex[:12]}"
        signature = payment_service.generate_test_signature(order_id, payment_id)
        recon_ref = f"REC-RZP-{uuid.uuid4().hex[:8].upper()}"

        # -------------------------------------------------------------
        # Step 1: Search Product
        # -------------------------------------------------------------
        s1_dialogue = [
            A2ADialogueMessageDTO(
                id="msg_1_1",
                sender="buyer_agent",
                sender_name="Acme Buyer AI",
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
                message=f"RFP Matched: Located inventory in Bangalore fulfillment center with 100% in-stock confirmation. Standard list quote: ₹{list_subtotal:,.2f} + 18% GST.",
                thought_process="Queried real-time stock levels across 50 SKUs. Inventory confirmed with 2-day SLA delivery guarantee.",
                structured_payload={"status": "in_stock", "list_subtotal": list_subtotal, "currency": "INR"}
            )
        ]
        step_1 = A2ASimulationStepDTO(
            step_number=1,
            step_id="search_product",
            title="1. Search Product & RFP Discovery",
            description="Buyer Agent discovers inventory availability and receives initial catalog price quote.",
            status="completed",
            duration_ms=420,
            dialogue=s1_dialogue,
            output_summary=f"Found {len(items)} SKU lines with 100% stock availability. Initial list quote: ₹{list_subtotal:,.2f}.",
            state_snapshot={"catalog_items_matched": len(items), "list_subtotal": list_subtotal}
        )

        # -------------------------------------------------------------
        # Step 2: Negotiate
        # -------------------------------------------------------------
        s2_dialogue = [
            A2ADialogueMessageDTO(
                id="msg_2_1",
                sender="buyer_agent",
                sender_name="Acme Buyer AI",
                sender_role="Autonomous Corporate Procurement",
                timestamp=(now + datetime.timedelta(seconds=4)).strftime("%H:%M:%S"),
                message=f"Volume Concession Proposal: Based on order volume ({sum(i['qty'] for i in items)} total units), our procurement policy mandates a 12% enterprise volume discount and complimentary 2-year warranty extension.",
                thought_process="Evaluating price elasticity curve and competitor pricing benchmarks. Requesting 12% discount to reach internal target ROI.",
                structured_payload={"target_discount_pct": 12.0, "warranty_requested": "2 Years"}
            ),
            A2ADialogueMessageDTO(
                id="msg_2_2",
                sender="seller_agent",
                sender_name="RazorRecon Seller AI",
                sender_role="Autonomous Merchant Commerce",
                timestamp=(now + datetime.timedelta(seconds=5)).strftime("%H:%M:%S"),
                message=f"Counter-Offer Formulated: Evaluating margin floor and volume threshold. Can offer a binding 10.0% volume rebate (saving ₹{discount_amount:,.2f}) + Free 4G eSIM Priority Activation.",
                thought_process="Cross-checked gross margin expansion model. 10% concession maintains 31.5% net margin while securing instantaneous payment.",
                structured_payload={"concession_discount_pct": 10.0, "total_savings_inr": discount_amount, "perks": ["Free 4G eSIM", "Priority SLA"]}
            ),
            A2ADialogueMessageDTO(
                id="msg_2_3",
                sender="buyer_agent",
                sender_name="Acme Buyer AI",
                sender_role="Autonomous Corporate Procurement",
                timestamp=(now + datetime.timedelta(seconds=6)).strftime("%H:%M:%S"),
                message=f"Consensus Reached: Counter-offer of 10.0% discount accepted. Final negotiated subtotal: ₹{agreed_subtotal:,.2f}. Proceeding to binding cart commitment.",
                thought_process="Counter-offer fits within procurement budget. Consensus logged with cryptographic handshake.",
                structured_payload={"consensus": True, "final_discount_pct": 10.0, "agreed_subtotal": agreed_subtotal}
            )
        ]
        step_2 = A2ASimulationStepDTO(
            step_number=2,
            step_id="negotiate",
            title="2. Autonomous Multi-Turn Negotiation",
            description="Dynamic price elasticity negotiation reaching mutual 10.0% volume discount consensus.",
            status="completed",
            duration_ms=680,
            dialogue=s2_dialogue,
            output_summary=f"Negotiated 10.0% enterprise rebate, saving ₹{discount_amount:,.2f}. Subtotal: ₹{agreed_subtotal:,.2f}.",
            state_snapshot={"discount_pct": 10.0, "discount_amount": discount_amount, "agreed_subtotal": agreed_subtotal}
        )

        # -------------------------------------------------------------
        # Step 3: Generate Cart
        # -------------------------------------------------------------
        s3_dialogue = [
            A2ADialogueMessageDTO(
                id="msg_3_1",
                sender="seller_agent",
                sender_name="RazorRecon Seller AI",
                sender_role="Autonomous Merchant Commerce",
                timestamp=(now + datetime.timedelta(seconds=8)).strftime("%H:%M:%S"),
                message=f"Cart Compiled: Generated binding cart #{uuid.uuid4().hex[:8]}. Subtotal: ₹{agreed_subtotal:,.2f}, 18% GST: ₹{gst_amount:,.2f}, Total Payable: ₹{total_order_amount:,.2f}.",
                thought_process="Applied negotiated unit rate tariffs, calculated HSN-wise 18% GST tax ledgering, and set free shipping.",
                structured_payload={
                    "cart_items": items,
                    "subtotal": agreed_subtotal,
                    "tax_gst_18": gst_amount,
                    "shipping": 0.0,
                    "total": total_order_amount
                }
            )
        ]
        step_3 = A2ASimulationStepDTO(
            step_number=3,
            step_id="generate_cart",
            title="3. Binding Cart Generation & Tax Ledgering",
            description="Assembling binding order commitment with 18% GST tax breakdown and free delivery terms.",
            status="completed",
            duration_ms=310,
            dialogue=s3_dialogue,
            output_summary=f"Total Payable: ₹{total_order_amount:,.2f} (Subtotal: ₹{agreed_subtotal:,.2f} + GST: ₹{gst_amount:,.2f}).",
            state_snapshot={"total_amount": total_order_amount, "gst_tax": gst_amount}
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
                message=f"Order Created in Razorpay Test Gateway: Generated Order ID `{order_id}` for ₹{total_order_amount:,.2f} ({int(total_order_amount * 100)} paise). Payment session ready.",
                thought_process="Initialized order entity in SQLite orders table with status 'created'. Emitted checkout session payload.",
                structured_payload={"order_id": order_id, "amount_inr": total_order_amount, "currency": "INR", "status": "created"}
            )
        ]
        step_4 = A2ASimulationStepDTO(
            step_number=4,
            step_id="create_payment",
            title="4. Razorpay Test Order Creation",
            description="Seller Agent provisions cryptographic Razorpay order token and escrow payment session.",
            status="completed",
            duration_ms=390,
            dialogue=s4_dialogue,
            output_summary=f"Razorpay Order ID `{order_id}` created for ₹{total_order_amount:,.2f}.",
            state_snapshot={"order_id": order_id, "status": "created"}
        )

        # -------------------------------------------------------------
        # Step 5: Verify Payment
        # -------------------------------------------------------------
        s5_dialogue = [
            A2ADialogueMessageDTO(
                id="msg_5_1",
                sender="buyer_agent",
                sender_name="Acme Buyer AI",
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
                message=f"Signature Verified: HMAC-SHA256 digest validated. Payment captured. Gateway MDR Fee: ₹{mdr_fee:,.2f} + GST: ₹{mdr_tax:,.2f}. Net Bank Deposit: ₹{net_bank_deposit:,.2f}.",
                thought_process="Verified HMAC SHA256 timing-safe digest. Transitioned order to 'paid'. Calculated net settlement.",
                structured_payload={"payment_id": payment_id, "status": "captured", "fee_mdr": mdr_fee, "tax_gst": mdr_tax, "net_deposit": net_bank_deposit}
            )
        ]
        step_5 = A2ASimulationStepDTO(
            step_number=5,
            step_id="verify_payment",
            title="5. Cryptographic Settlement & Signature Verification",
            description="HMAC SHA256 verification, payment capture, and gateway fee calculation.",
            status="completed",
            duration_ms=520,
            dialogue=s5_dialogue,
            output_summary=f"Payment `{payment_id}` captured and verified. Net payout: ₹{net_bank_deposit:,.2f}.",
            state_snapshot={"payment_id": payment_id, "net_bank_deposit": net_bank_deposit, "mdr_fee": mdr_fee}
        )

        # -------------------------------------------------------------
        # Step 6: Update Ledger
        # -------------------------------------------------------------
        ledger_entries = [
            A2ALedgerEntryDTO(
                account_code="1010",
                account_name="Bank Payout Deposit (HDFC Operating)",
                debit=net_bank_deposit,
                credit=0.0,
                description=f"Net settlement deposit for Razorpay Order #{order_id}"
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
                description=f"Gross sales revenue for {scenario.title}"
            )
        ]

        s6_dialogue = [
            A2ADialogueMessageDTO(
                id="msg_6_1",
                sender="seller_agent",
                sender_name="RazorRecon FinOps Bot",
                sender_role="Autonomous Reconciliation Engine",
                timestamp=(now + datetime.timedelta(seconds=15)).strftime("%H:%M:%S"),
                message=f"Autonomous FinOps Sync: Ingested double-entry balance into General Ledger. Reconciled against Bank Payout Feed with 0 discrepancies. Audit Reference: `{recon_ref}`.",
                thought_process="Posted journal vouchers: Total Debits (₹{total_order_amount:,.2f}) = Total Credits (₹{total_order_amount:,.2f}). Memory engine updated.",
                structured_payload={"reconciliation_id": recon_ref, "ledger_balanced": True, "variance_inr": 0.0}
            )
        ]
        step_6 = A2ASimulationStepDTO(
            step_number=6,
            step_id="update_ledger",
            title="6. Double-Entry Ledger Posting & Auto-Reconciliation",
            description="Journal voucher sync across general ledger, MDR fee expense, and memory engine audit log.",
            status="completed",
            duration_ms=440,
            dialogue=s6_dialogue,
            output_summary=f"Balanced Journal Entry posted. Reconciled with 0 variance. Audit Ref: {recon_ref}.",
            state_snapshot={"reconciliation_id": recon_ref, "variance": 0.0}
        )

        # Trigger live memory update in background
        memory_engine.update_memory(
            vendor_id="VEND-A2A-COMMERCE",
            vendor_name=scenario.seller_persona,
            transaction_amount=total_order_amount,
            has_exception=False,
            exception_type=None,
            root_cause=None,
            resolution=f"A2A Autonomous Settlement verified via Razorpay ({recon_ref})"
        )

        return A2ASimulationResponseDTO(
            simulation_id=sim_id,
            scenario_title=scenario.title,
            buyer_name="Acme Buyer AI",
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
                "order_id": order_id,
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
            created_at=now.isoformat()
        )

agent_commerce_service = AgentCommerceService()
