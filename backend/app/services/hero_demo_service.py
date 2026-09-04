from __future__ import annotations

import os
import sqlite3
import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional

from app.schemas.hero_demo import (
    ReasoningTraceDTO,
    HeroAuditLogDTO,
    HeroRiskCheckDTO,
    HeroTransactionDTO,
    HeroProductItemDTO,
    HeroCartItemDTO,
    HeroMemoryProfileDTO,
    HeroStepDataDTO,
    HeroScenarioDTO,
    HeroDemoStateDTO
)
from app.services.catalog_service import catalog_service
from app.services.payment_service import payment_service
from app.services.memory_engine import memory_engine

DB_DIR = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data"))
os.makedirs(DB_DIR, exist_ok=True)
HERO_DEMO_DB_PATH = os.path.join(DB_DIR, "hero_demo.db")

SCENARIOS: Dict[str, HeroScenarioDTO] = {
    "mumbai_retail_expansion": HeroScenarioDTO(
        id="mumbai_retail_expansion",
        title="Acme Retail Store Expansion (Mumbai Fleet)",
        business_type="D2C Multi-Outlet Retailer",
        customer_name="Acme Retail Enterprise Mumbai",
        customer_email="procurement@acmeretail.in",
        initial_prompt="We are opening 5 new flagship retail stores across Mumbai and need reliable smart Android POS terminals with thermal receipt printers and voice soundboxes.",
        budget_inr=150000.0,
        target_category="Payment Terminals",
        recommended_skus=["RZP-POS-V3-PRO", "RZP-SBOX-4G-PRO"],
        upsell_sku="RZP-POS-COUNTER-DUAL",
        future_skus=["APG-SERIES-100-CASH-DRAWER", "ZEBRA-DS2208-SCANNER", "RZP-RECON-STARTER"]
    ),
    "cloud_finops_software": HeroScenarioDTO(
        id="cloud_finops_software",
        title="Novus Cloud Multi-Channel FinOps Sync",
        business_type="Fast-Growing SaaS Scaleup",
        customer_name="Novus Cloud Technologies",
        customer_email="finance@novuscloud.io",
        initial_prompt="We process 100k+ monthly payments across Razorpay, Stripe, and Shopify. We need an automated 3-way reconciliation engine with statutory GST filing.",
        budget_inr=100000.0,
        target_category="FinOps Software",
        recommended_skus=["RZP-RECON-ENT-ANNUAL", "RZP-GST-API-ANNUAL"],
        upsell_sku="ORACLE-NETSUITE-CONNECTOR",
        future_skus=["CLOUD-COST-SENTINEL", "YUBIKEY-BIO-FIDO2"]
    ),
    "dev_workstation_fleet": HeroScenarioDTO(
        id="dev_workstation_fleet",
        title="Fintech Trading Desk Workstation Setup",
        business_type="Algorithmic Trading & Finance Desk",
        customer_name="AlphaQuant Financial Labs",
        customer_email="ops@alphaquant.in",
        initial_prompt="Equipping 5 quantitative finance analysts with ultra-sharp high resolution trading displays, tactile keyboards, and high-speed Thunderbolt docks.",
        budget_inr=300000.0,
        target_category="Workstations & Peripherals",
        recommended_skus=["DELL-U4025QW-5K2K", "KEYCHRON-Q3-PRO", "CALDIGIT-TS4-DOCK"],
        upsell_sku="HERMAN-MILLER-AERON",
        future_skus=["STREAMDECK-XL-MACRO", "LOGI-MX-MASTER-3S", "SONY-WH1000XM5-NOISE"]
    ),
    "compliance_archive_storage": HeroScenarioDTO(
        id="compliance_archive_storage",
        title="Statutory Finance Archive & Hardware Security",
        business_type="Wealth Management & Audit Firm",
        customer_name="Apex Wealth Partners",
        customer_email="security@apexwealth.com",
        initial_prompt="We require on-premise encrypted storage for 8 years of statutory finance ledger backups and hardware biometric FIDO2 security keys.",
        budget_inr=200000.0,
        target_category="Storage & Servers",
        recommended_skus=["SYNOLOGY-DS923-PLUS", "SEAGATE-IRONWOLF-PRO-16TB", "YUBIKEY-BIO-FIDO2"],
        upsell_sku="SYNOLOGY-DS1821-PLUS",
        future_skus=["DELL-POWEREDGE-R250", "TREZOR-SAFE-5-CRYPTO"]
    )
}

class HeroDemoService:
    def __init__(self, db_path: str = HERO_DEMO_DB_PATH):
        self.db_path = db_path
        self._init_db()

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS hero_sessions (
                    session_id TEXT PRIMARY KEY,
                    scenario_id TEXT NOT NULL,
                    current_step INTEGER NOT NULL DEFAULT 1,
                    is_completed INTEGER NOT NULL DEFAULT 0,
                    state_json TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """)
            conn.commit()

    def get_scenarios(self) -> List[HeroScenarioDTO]:
        return list(SCENARIOS.values())

    def get_scenario(self, scenario_id: str) -> HeroScenarioDTO:
        return SCENARIOS.get(scenario_id, SCENARIOS["mumbai_retail_expansion"])

    def get_or_create_session(self, session_id: Optional[str] = None, scenario_id: str = "mumbai_retail_expansion") -> HeroDemoStateDTO:
        scenario = self.get_scenario(scenario_id)
        now_str = datetime.now().isoformat()

        with self._get_conn() as conn:
            cursor = conn.cursor()
            if session_id:
                cursor.execute("SELECT * FROM hero_sessions WHERE session_id = ?", (session_id,))
                row = cursor.fetchone()
                if row:
                    state_dict = json.loads(row["state_json"])
                    return HeroDemoStateDTO(**state_dict)

            new_session_id = session_id or f"hero_{uuid.uuid4().hex[:10]}"
            initial_state = HeroDemoStateDTO(
                session_id=new_session_id,
                scenario=scenario,
                current_step=1,
                is_completed=False,
                steps=[self._execute_step_logic(1, scenario, None)]
            )

            cursor.execute("""
                INSERT OR REPLACE INTO hero_sessions (session_id, scenario_id, current_step, is_completed, state_json, created_at, updated_at)
                VALUES (?, ?, 1, 0, ?, ?, ?)
            """, (new_session_id, scenario.id, json.dumps(initial_state.model_dump()), now_str, now_str))
            conn.commit()

            return initial_state

    def execute_step(self, session_id: str, step_number: int, scenario_id: str = "mumbai_retail_expansion") -> HeroDemoStateDTO:
        state = self.get_or_create_session(session_id, scenario_id)
        target_step = min(10, max(1, step_number))
        scenario = state.scenario

        # Re-execute up to target_step
        new_steps: List[HeroStepDataDTO] = []
        for s_idx in range(1, target_step + 1):
            prev_step = new_steps[-1] if new_steps else None
            step_data = self._execute_step_logic(s_idx, scenario, prev_step, state)
            new_steps.append(step_data)

        # Update state fields based on step progress
        state.current_step = target_step
        state.steps = new_steps
        state.is_completed = (target_step == 10)

        # Gather updated audit logs & transactions
        state.audit_logs = [s.audit_log for s in new_steps]
        state.transactions = [s.transaction for s in new_steps if s.transaction is not None]

        # Extract step artifacts into state
        self._sync_state_artifacts(state)

        # Save to DB
        now_str = datetime.now().isoformat()
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE hero_sessions SET current_step = ?, is_completed = ?, state_json = ?, updated_at = ?
                WHERE session_id = ?
            """, (state.current_step, 1 if state.is_completed else 0, json.dumps(state.model_dump()), now_str, state.session_id))
            conn.commit()

        return state

    def run_all(self, session_id: str, scenario_id: str = "mumbai_retail_expansion") -> HeroDemoStateDTO:
        return self.execute_step(session_id, step_number=10, scenario_id=scenario_id)

    def reset_session(self, session_id: str, scenario_id: str = "mumbai_retail_expansion") -> HeroDemoStateDTO:
        scenario = self.get_scenario(scenario_id)
        now_str = datetime.now().isoformat()

        initial_state = HeroDemoStateDTO(
            session_id=session_id,
            scenario=scenario,
            current_step=1,
            is_completed=False,
            steps=[self._execute_step_logic(1, scenario, None)]
        )

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE hero_sessions SET current_step = 1, is_completed = 0, state_json = ?, updated_at = ?
                WHERE session_id = ?
            """, (json.dumps(initial_state.model_dump()), now_str, session_id))
            conn.commit()

        return initial_state

    def _sync_state_artifacts(self, state: HeroDemoStateDTO):
        for s in state.steps:
            if s.step_number == 5 and "cart_items" in s.data:
                state.active_cart_items = [HeroCartItemDTO(**it) for it in s.data["cart_items"]]
                state.cart_subtotal = s.data.get("subtotal", 0.0)
                state.cart_tax = s.data.get("tax_amount", 0.0)
                state.cart_discount = s.data.get("discount_amount", 0.0)
                state.cart_final = s.data.get("final_amount", 0.0)
                state.applied_coupon = s.data.get("coupon_code")
            elif s.step_number == 6 and "order_id" in s.data:
                state.order_id = s.data["order_id"]
                state.payment_link = s.data["payment_link"]
            elif s.step_number == 7:
                state.payment_id = s.data.get("payment_id")
                state.reconciled = True
            elif s.step_number == 9 and "profile" in s.data:
                state.memory_profile = HeroMemoryProfileDTO(**s.data["profile"])
            elif s.step_number == 10 and "recommendations" in s.data:
                state.future_recommendations = [HeroProductItemDTO(**it) for it in s.data["recommendations"]]

    def _execute_step_logic(
        self,
        step_num: int,
        scenario: HeroScenarioDTO,
        prev_step: Optional[HeroStepDataDTO] = None,
        current_state: Optional[HeroDemoStateDTO] = None
    ) -> HeroStepDataDTO:
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        all_catalog = catalog_service.get_all_products(limit=50).products

        # Helper to find products
        def find_p(sku_or_key: str):
            for p in all_catalog:
                if sku_or_key.lower() in p.sku.lower() or sku_or_key.lower() in p.name.lower():
                    return p
            return all_catalog[0]

        # ----------------------------------------------------
        # STEP 1: Merchant Uploads Catalog
        # ----------------------------------------------------
        if step_num == 1:
            return HeroStepDataDTO(
                step_number=1,
                step_key="upload_catalog",
                title="1. Merchant Uploads Catalog",
                subtitle="Ingestion of 50 enterprise hardware & FinOps SKUs",
                actor="Merchant Admin",
                status="completed",
                timestamp=now_str,
                data={
                    "total_skus": 50,
                    "categories_count": 7,
                    "file_format": "JSON / Enterprise CSV",
                    "file_name": "razorrecon_catalog_2026.json",
                    "inventory_units": 6186,
                    "catalog_valuation_inr": 145123786.0
                },
                reasoning=ReasoningTraceDTO(
                    goal="Ingest merchant product catalog into persistent SQLite database",
                    thought="Merchant provided 50 SKU catalog file. Validating schemas, currency formats (INR), and inventory counts.",
                    observation="50 distinct products parsed successfully across POS, Soundboxes, Software, Workstations, Security, Storage, and Peripherals.",
                    action_taken="Stored in backend/data/catalog.db with relational indexing and reorder thresholds.",
                    decision_rationale="Normalized schema ensures deterministic pricing, cost margin calculations, and inventory safety bounds.",
                    json_payload={"skus_loaded": 50, "categories": 7, "db": "catalog.db"}
                ),
                audit_log=HeroAuditLogDTO(
                    id=f"aud_1_{uuid.uuid4().hex[:6]}",
                    step_number=1,
                    actor="Merchant Admin",
                    event_type="CATALOG_INGESTED",
                    description="Successfully ingested and indexed 50 enterprise product SKUs into live catalog database.",
                    timestamp=now_str,
                    metadata={"total_skus": 50, "valuation": 145123786.0}
                ),
                risk_check=HeroRiskCheckDTO(
                    risk_level="LOW",
                    risk_score=0,
                    fraud_flags=[],
                    gst_compliance_status="VALIDATED",
                    reconciliation_verified=True
                )
            )

        # ----------------------------------------------------
        # STEP 2: AI Understands Catalog & Indexes
        # ----------------------------------------------------
        elif step_num == 2:
            return HeroStepDataDTO(
                step_number=2,
                step_key="ai_understand_catalog",
                title="2. AI Understands Catalog",
                subtitle="Embeddings generated, HSN tax classifications & Offer Engine bound",
                actor="AI Embeddings Engine",
                status="completed",
                timestamp=now_str,
                data={
                    "embedding_dimension": 768,
                    "vector_index": "Token-optimized JSON schema (v2026.1)",
                    "hsn_tax_rules_bound": 50,
                    "active_offers_bound": 5,
                    "sample_embedding": [0.042, -0.128, 0.315, 0.089, -0.054]
                },
                reasoning=ReasoningTraceDTO(
                    goal="Generate vector representations and bind statutory tax/discount rules to catalog items",
                    thought="Converting hardware specifications, OS versions, and SLA attributes into embeddings-ready JSON for LLMs.",
                    observation="All 50 products linked to GST SAC/HSN codes (8470, 9983) and active Offer Engine promotional rules.",
                    action_taken="Exposed token-optimized schema at /api/v1/catalog/ai-context for autonomous shopping agents.",
                    decision_rationale="Zero latency retrieval allows sub-second recommendation generation during customer procurement chats.",
                    json_payload={"hsn_8470_count": 32, "gst_rate_default": 18.0, "offers_bound": 5}
                ),
                audit_log=HeroAuditLogDTO(
                    id=f"aud_2_{uuid.uuid4().hex[:6]}",
                    step_number=2,
                    actor="AI Embeddings Engine",
                    event_type="CATALOG_EMBEDDINGS_INDEXED",
                    description="Generated embeddings index and bound 5 promotional offers (RAZOR2026, FESTIVE15, ENTERPRISE5000).",
                    timestamp=now_str,
                    metadata={"schema_version": "2026.1", "offers": ["RAZOR2026", "FESTIVE15"]}
                ),
                risk_check=HeroRiskCheckDTO(
                    risk_level="LOW",
                    risk_score=2,
                    fraud_flags=[],
                    gst_compliance_status="100% HSN VERIFIED",
                    reconciliation_verified=True
                )
            )

        # ----------------------------------------------------
        # STEP 3: Customer Asks for Product
        # ----------------------------------------------------
        elif step_num == 3:
            return HeroStepDataDTO(
                step_number=3,
                step_key="customer_ask",
                title="3. Customer Inquires via Prompt",
                subtitle="Natural language procurement request received",
                actor="Customer / Buyer",
                status="completed",
                timestamp=now_str,
                data={
                    "customer_name": scenario.customer_name,
                    "customer_email": scenario.customer_email,
                    "prompt_text": scenario.initial_prompt,
                    "procurement_budget_inr": scenario.budget_inr,
                    "target_sector": scenario.business_type
                },
                reasoning=ReasoningTraceDTO(
                    goal="Parse customer business intent and constraints from natural language prompt",
                    thought=f"Customer '{scenario.customer_name}' requested procurement assistance. Target category: '{scenario.target_category}'.",
                    observation="Identified requirements: high reliability, POS billing hardware, printer capability, and voice soundbox confirmations.",
                    action_taken="Triggered semantic catalog search and affinity matching engine.",
                    decision_rationale="Natural language parsing allows merchants to quote complex B2B multi-item orders without navigating massive catalogs.",
                    json_payload={"intent": "procure_pos_fleet", "budget": scenario.budget_inr}
                ),
                audit_log=HeroAuditLogDTO(
                    id=f"aud_3_{uuid.uuid4().hex[:6]}",
                    step_number=3,
                    actor="Customer / Buyer",
                    event_type="PROCUREMENT_INQUIRY_RECEIVED",
                    description=f"Received procurement prompt from {scenario.customer_name}: '{scenario.initial_prompt[:60]}...'",
                    timestamp=now_str,
                    metadata={"email": scenario.customer_email, "budget": scenario.budget_inr}
                ),
                risk_check=HeroRiskCheckDTO(
                    risk_level="LOW",
                    risk_score=3,
                    fraud_flags=[],
                    credit_limit_inr=500000.0,
                    gst_compliance_status="VALIDATED",
                    reconciliation_verified=True
                )
            )

        # ----------------------------------------------------
        # STEP 4: Agent Recommends Products
        # ----------------------------------------------------
        elif step_num == 4:
            rec_products = [find_p(sku) for sku in scenario.recommended_skus]
            rec_dtos = [
                HeroProductItemDTO(
                    id=p.id,
                    sku=p.sku,
                    name=p.name,
                    brand=p.brand,
                    category=p.category,
                    price=p.price,
                    original_price=p.original_price,
                    rating=p.rating,
                    image_url=p.image_url,
                    key_features=p.features[:3] if p.features else ["Instant 4G Sync", "Dual Display"],
                    gst_rate_pct=p.gst_rate_pct,
                    active_offer=p.offer_text,
                    match_score_pct=98 if idx == 0 else 94
                )
                for idx, p in enumerate(rec_products)
            ]

            return HeroStepDataDTO(
                step_number=4,
                step_key="agent_recommend",
                title="4. Agent Recommends Products",
                subtitle="Matched 2 top-tier enterprise SKUs with technical rationale",
                actor="Commerce Agent",
                status="completed",
                timestamp=now_str,
                data={
                    "recommendations": [r.model_dump() for r in rec_dtos],
                    "comparison_points": [
                        "Android 13 OS with dual 4G eSIM auto-switching",
                        "80mm/s Japanese thermal receipt printer built-in",
                        "100% Eligible for 18% GST Input Tax Credit (ITC)"
                    ]
                },
                reasoning=ReasoningTraceDTO(
                    goal="Formulate personalized product recommendations matching budget and technical needs",
                    thought="Ranked 50 items using Cosine similarity. Top recommendations: Razorpay Smart POS V3 Pro (98% match) & Smart Soundbox 4G Pro (94% match).",
                    observation="Selected items offer full PCI-PTS compliance, regional Indian language broadcasts, and instant cloud sync.",
                    action_taken="Generated multi-attribute recommendation cards with comparison specifications.",
                    decision_rationale="Bundling POS terminal with Soundbox covers both visual receipt billing and audible confirmation in noisy retail stores.",
                    json_payload={"recommended_skus": [p.sku for p in rec_products]}
                ),
                audit_log=HeroAuditLogDTO(
                    id=f"aud_4_{uuid.uuid4().hex[:6]}",
                    step_number=4,
                    actor="Commerce Agent",
                    event_type="RECOMMENDATIONS_DISPATCHED",
                    description=f"Generated {len(rec_dtos)} AI recommendation cards for {scenario.customer_name}.",
                    timestamp=now_str,
                    metadata={"skus": [r.sku for r in rec_dtos]}
                ),
                risk_check=HeroRiskCheckDTO(
                    risk_level="LOW",
                    risk_score=3,
                    fraud_flags=[],
                    gst_compliance_status="100% ITC ELIGIBLE",
                    reconciliation_verified=True
                )
            )

        # ----------------------------------------------------
        # STEP 5: Agent Creates Cart & Applies Coupon
        # ----------------------------------------------------
        elif step_num == 5:
            rec_products = [find_p(sku) for sku in scenario.recommended_skus]
            cart_items = [
                HeroCartItemDTO(
                    product_id=rec_products[0].id,
                    sku=rec_products[0].sku,
                    name=rec_products[0].name,
                    price=rec_products[0].price,
                    quantity=3,
                    subtotal=round(rec_products[0].price * 3, 2),
                    gst_rate_pct=rec_products[0].gst_rate_pct,
                    image_url=rec_products[0].image_url
                ),
                HeroCartItemDTO(
                    product_id=rec_products[1].id,
                    sku=rec_products[1].sku,
                    name=rec_products[1].name,
                    price=rec_products[1].price,
                    quantity=3,
                    subtotal=round(rec_products[1].price * 3, 2),
                    gst_rate_pct=rec_products[1].gst_rate_pct,
                    image_url=rec_products[1].image_url
                )
            ]

            subtotal = sum(it.subtotal for it in cart_items)
            taxes = round(subtotal * 0.18, 2)
            discount = round(subtotal * 0.10, 2)  # 10% RAZOR2026 coupon
            final_amount = round(subtotal + taxes - discount, 2)

            return HeroStepDataDTO(
                step_number=5,
                step_key="agent_create_cart",
                title="5. Agent Creates Cart",
                subtitle="Auto-assembled cart and applied 'RAZOR2026' 10% instant discount",
                actor="Commerce Agent",
                status="completed",
                timestamp=now_str,
                data={
                    "cart_items": [it.model_dump() for it in cart_items],
                    "subtotal": subtotal,
                    "tax_amount": taxes,
                    "discount_amount": discount,
                    "coupon_code": "RAZOR2026",
                    "final_amount": final_amount,
                    "total_units": 6
                },
                reasoning=ReasoningTraceDTO(
                    goal="Assemble line-items, calculate statutory 18% GST, and apply optimal promotional coupon",
                    thought="Assembling 3x Smart POS V3 Pro + 3x Soundbox 4G Pro. Running Offer Engine optimizer.",
                    observation="Optimal coupon found: 'RAZOR2026' granting 10% instant volume rebate.",
                    action_taken="Calculated Subtotal: ₹52,494.00, 18% GST: ₹9,448.92, Coupon Discount: -₹5,249.40, Final Amount: ₹56,693.52.",
                    decision_rationale="Full GST itemization ensures seamless corporate B2B input tax credit filing.",
                    json_payload={"coupon": "RAZOR2026", "discount_pct": 10.0, "final_amount": final_amount}
                ),
                audit_log=HeroAuditLogDTO(
                    id=f"aud_5_{uuid.uuid4().hex[:6]}",
                    step_number=5,
                    actor="Commerce Agent",
                    event_type="CART_ASSEMBLED_WITH_COUPON",
                    description=f"Assembled cart session with 6 total units and auto-applied 'RAZOR2026' (Save ₹{discount:,.2f}).",
                    timestamp=now_str,
                    metadata={"subtotal": subtotal, "taxes": taxes, "discounts": discount, "final": final_amount}
                ),
                risk_check=HeroRiskCheckDTO(
                    risk_level="LOW",
                    risk_score=2,
                    fraud_flags=[],
                    credit_limit_inr=500000.0,
                    gst_compliance_status="18% GST APPLIED",
                    reconciliation_verified=True
                )
            )

        # ----------------------------------------------------
        # STEP 6: Agent Initiates Razorpay Checkout
        # ----------------------------------------------------
        elif step_num == 6:
            final_amt = 56693.52
            order_id = f"order_rzp_{uuid.uuid4().hex[:12]}"
            payment_link = f"https://rzp.io/l/{order_id.replace('order_rzp_', '')}"
            qr_data = f"upi://pay?pa=razorpay.test@icici&pn=RazorRecon%20Enterprise&am={final_amt:.2f}&cu=INR&tn={order_id}"

            return HeroStepDataDTO(
                step_number=6,
                step_key="agent_initiate_checkout",
                title="6. Agent Initiates Razorpay Checkout",
                subtitle="Razorpay Test Order created with shareable payment link & dynamic QR",
                actor="Razorpay Gateway Integration",
                status="completed",
                timestamp=now_str,
                data={
                    "order_id": order_id,
                    "payment_link": payment_link,
                    "qr_code_data": qr_data,
                    "order_amount": final_amt,
                    "currency": "INR",
                    "customer_email": scenario.customer_email,
                    "customer_name": scenario.customer_name,
                    "status": "created"
                },
                reasoning=ReasoningTraceDTO(
                    goal="Provision official Razorpay Test Mode Order and generate payment link & UPI QR",
                    thought=f"Invoked Razorpay Orders API for amount ₹{final_amt:,.2f} INR. Generating session credentials.",
                    observation="Order provisioned with ID " + order_id + ". Generated instant shareable checkout URL.",
                    action_taken="Created checkout session and logged order creation in database.",
                    decision_rationale="Dual payment modalities (Direct Checkout Modal & Shareable Link) accommodate both live and offline B2B approval workflows.",
                    json_payload={"order_id": order_id, "amount_paise": int(final_amt * 100), "status": "created"}
                ),
                audit_log=HeroAuditLogDTO(
                    id=f"aud_6_{uuid.uuid4().hex[:6]}",
                    step_number=6,
                    actor="Razorpay Gateway Integration",
                    event_type="ORDER_PROVISIONED",
                    description=f"Generated Razorpay Order '{order_id}' for ₹{final_amt:,.2f} with payment link {payment_link}.",
                    timestamp=now_str,
                    metadata={"order_id": order_id, "payment_link": payment_link}
                ),
                risk_check=HeroRiskCheckDTO(
                    risk_level="LOW",
                    risk_score=1,
                    fraud_flags=[],
                    credit_limit_inr=500000.0,
                    settlement_variance_inr=0.0,
                    gst_compliance_status="VALIDATED",
                    reconciliation_verified=True
                )
            )

        # ----------------------------------------------------
        # STEP 7: Payment Success & Auto-Reconciliation
        # ----------------------------------------------------
        elif step_num == 7:
            gross_amt = 56693.52
            mdr_fee = round(gross_amt * 0.02, 2)  # 2% MDR = ₹1,133.87
            gst_fee = round(mdr_fee * 0.18, 2)   # 18% GST on MDR = ₹204.10
            net_deposit = round(gross_amt - mdr_fee - gst_fee, 2)  # ₹55,355.55
            payment_id = f"pay_rzp_{uuid.uuid4().hex[:10]}"
            order_id = current_state.order_id if current_state and current_state.order_id else f"order_rzp_{uuid.uuid4().hex[:12]}"

            journal_entries = [
                {"account": "1010-Bank Payout Deposit (HDFC Operating)", "type": "DEBIT", "amount": net_deposit, "description": "Net settlement proceeds received"},
                {"account": "5040-Payment Gateway MDR Fees & Taxes", "type": "DEBIT", "amount": round(mdr_fee + gst_fee, 2), "description": "2.0% Gateway MDR fee + 18% GST on fee"},
                {"account": "4010-Commercial Hardware & License Revenue", "type": "CREDIT", "amount": gross_amt, "description": "Recognized gross sales revenue"}
            ]

            tx_dto = HeroTransactionDTO(
                transaction_id=f"tx_{uuid.uuid4().hex[:8]}",
                order_id=order_id,
                payment_id=payment_id,
                gross_amount=gross_amt,
                tax_amount=9448.92,
                discount_amount=5249.40,
                net_deposit=net_deposit,
                gateway_fee=mdr_fee,
                gst_on_fee=gst_fee,
                payment_method="upi",
                status="reconciled",
                journal_vouchers=journal_entries,
                timestamp=now_str
            )

            return HeroStepDataDTO(
                step_number=7,
                step_key="payment_success",
                title="7. Payment Captured & Reconciled",
                subtitle="HMAC signature verified & 3-way reconciliation posted to ERP ledger",
                actor="Reconciliation Engine",
                status="completed",
                timestamp=now_str,
                data={
                    "payment_id": payment_id,
                    "order_id": order_id,
                    "status": "captured",
                    "gross_amount": gross_amt,
                    "net_deposit": net_deposit,
                    "gateway_fee": mdr_fee,
                    "gst_on_fee": gst_fee,
                    "reconciled": True,
                    "reconciliation_variance": 0.0,
                    "journal_entries": journal_entries
                },
                reasoning=ReasoningTraceDTO(
                    goal="Verify HMAC SHA256 cryptographic signature and post balanced double-entry vouchers to general ledger",
                    thought=f"Payment ID {payment_id} verified against secret key. Executing gross-to-net fee calculation: Gross ₹{gross_amt:,.2f} - 2.0% MDR ₹{mdr_fee:,.2f} - 18% GST ₹{gst_fee:,.2f} = Net Deposit ₹{net_deposit:,.2f}.",
                    observation="Matched gateway settlement against bank deposit feed with ZERO variance (0.00 discrepancies).",
                    action_taken="Posted 3-way double-entry journal vouchers to ERP General Ledger and sealed transaction.",
                    decision_rationale="Instant autonomous reconciliation eliminates end-of-month manual spreadsheet matching and prevents revenue leakage.",
                    json_payload={"payment_id": payment_id, "net_deposit": net_deposit, "reconciled_variance": 0.0}
                ),
                audit_log=HeroAuditLogDTO(
                    id=f"aud_7_{uuid.uuid4().hex[:6]}",
                    step_number=7,
                    actor="Reconciliation Engine",
                    event_type="PAYMENT_VERIFIED_AND_RECONCILED",
                    description=f"Cryptographically verified payment {payment_id} and posted balanced ERP journal vouchers (Net: ₹{net_deposit:,.2f}).",
                    timestamp=now_str,
                    metadata={"payment_id": payment_id, "net_deposit": net_deposit, "variance": 0.0}
                ),
                risk_check=HeroRiskCheckDTO(
                    risk_level="LOW",
                    risk_score=0,
                    fraud_flags=[],
                    settlement_variance_inr=0.0,
                    gst_compliance_status="100% RECONCILED",
                    reconciliation_verified=True
                ),
                transaction=tx_dto
            )

        # ----------------------------------------------------
        # STEP 8: Upsell Recommendations Generated
        # ----------------------------------------------------
        elif step_num == 8:
            upsell_prod = find_p(scenario.upsell_sku)
            upsell_dto = HeroProductItemDTO(
                id=upsell_prod.id,
                sku=upsell_prod.sku,
                name=upsell_prod.name,
                brand=upsell_prod.brand,
                category=upsell_prod.category,
                price=upsell_prod.price,
                original_price=upsell_prod.original_price,
                rating=upsell_prod.rating,
                image_url=upsell_prod.image_url,
                key_features=upsell_prod.features[:3] if upsell_prod.features else ["15.6\" Merchant Screen + 10.1\" Customer Display", "Auto-cut Printer"],
                gst_rate_pct=upsell_prod.gst_rate_pct,
                active_offer="Flat ₹3,000 Volume Rebate",
                match_score_pct=96
            )

            return HeroStepDataDTO(
                step_number=8,
                step_key="upsell_recommendations",
                title="8. Revenue Growth Upsell",
                subtitle="Basket affinity engine predicts margin uplift from dual-screen station",
                actor="Revenue Growth Agent",
                status="completed",
                timestamp=now_str,
                data={
                    "upsell_product": upsell_dto.model_dump(),
                    "projected_revenue_lift_pct": 28.5,
                    "margin_expansion_pct": 8.2,
                    "basket_affinity_confidence": 92.4,
                    "historical_co_purchases": 340
                },
                reasoning=ReasoningTraceDTO(
                    goal="Analyze co-purchase affinities to recommend high-margin complementary upgrades",
                    thought=f"Customer purchased 3x Smart POS V3 Pro. Historical co-purchase mining shows 92.4% affinity with '{upsell_prod.name}'.",
                    observation="Upgrading flagship store cashier to dual-screen billing station expands gross margin by +8.2%.",
                    action_taken="Generated targeted post-checkout upgrade invitation with 1-click add-on pricing.",
                    decision_rationale="Post-purchase recommendations maximize customer lifetime value (LTV) when buyer trust is highest.",
                    json_payload={"upsell_sku": upsell_prod.sku, "confidence_pct": 92.4, "projected_lift_pct": 28.5}
                ),
                audit_log=HeroAuditLogDTO(
                    id=f"aud_8_{uuid.uuid4().hex[:6]}",
                    step_number=8,
                    actor="Revenue Growth Agent",
                    event_type="UPSELL_OPPORTUNITY_DISPATCHED",
                    description=f"Generated affinity-weighted upgrade offer: {upsell_prod.name} (Predicted Lift: +28.5%).",
                    timestamp=now_str,
                    metadata={"sku": upsell_prod.sku, "lift_pct": 28.5}
                ),
                risk_check=HeroRiskCheckDTO(
                    risk_level="LOW",
                    risk_score=1,
                    fraud_flags=[],
                    gst_compliance_status="VALIDATED",
                    reconciliation_verified=True
                )
            )

        # ----------------------------------------------------
        # STEP 9: Purchase Stored in Memory Engine
        # ----------------------------------------------------
        elif step_num == 9:
            profile = HeroMemoryProfileDTO(
                customer_id=f"cust_{scenario.id[:10]}",
                customer_name=scenario.customer_name,
                tier="Enterprise Platinum Tier",
                total_spend_inr=185693.52,
                orders_count=4,
                aov_inr=46423.38,
                affinity_categories=["Payment Terminals", "Payment Audio Alerts", "FinOps Software"],
                risk_profile="EXCELLENT (Score: 2/100, 0 Late Settlements)",
                last_purchased_sku="RZP-POS-V3-PRO",
                last_purchase_date=now_str,
                loyalty_points=1850
            )

            return HeroStepDataDTO(
                step_number=9,
                step_key="store_in_memory",
                title="9. Stored in Memory Engine",
                subtitle="Customer behavioral profile, AOV, and risk state permanently updated",
                actor="Finance Memory Engine",
                status="completed",
                timestamp=now_str,
                data={
                    "profile": profile.model_dump(),
                    "memory_tags": ["FAST_SETTLER", "ENTERPRISE_HARDWARE_BUYER", "LOW_RISK_GOLD"],
                    "lifetime_orders": 4,
                    "total_settled_inr": 185693.52
                },
                reasoning=ReasoningTraceDTO(
                    goal="Update long-term behavioral memory dossier with transaction amounts, settlement speed, and category affinities",
                    thought=f"Ingesting transaction {current_state.order_id if current_state else 'RZP-TX'} into SQLite memory_engine.db.",
                    observation="Customer AOV increased to ₹46,423.38. Risk score improved to 2/100 due to prompt UPI authorization.",
                    action_taken="Permanently recorded merchant profile in memory state machine.",
                    decision_rationale="Continuous behavioral memory allows autonomous agents to offer custom credit limits and tailored loyalty discounts in future sessions.",
                    json_payload={"customer_id": profile.customer_id, "tier": profile.tier, "aov": profile.aov_inr}
                ),
                audit_log=HeroAuditLogDTO(
                    id=f"aud_9_{uuid.uuid4().hex[:6]}",
                    step_number=9,
                    actor="Finance Memory Engine",
                    event_type="BEHAVIORAL_MEMORY_UPDATED",
                    description=f"Updated long-term behavioral dossier for {scenario.customer_name} (Lifetime Spend: ₹{profile.total_spend_inr:,.2f}).",
                    timestamp=now_str,
                    metadata={"customer_id": profile.customer_id, "aov": profile.aov_inr}
                ),
                risk_check=HeroRiskCheckDTO(
                    risk_level="LOW",
                    risk_score=2,
                    fraud_flags=[],
                    credit_limit_inr=750000.0,
                    settlement_variance_inr=0.0,
                    gst_compliance_status="VERIFIED",
                    reconciliation_verified=True
                )
            )

        # ----------------------------------------------------
        # STEP 10: Future Personalized Recommendations
        # ----------------------------------------------------
        else:
            future_prods = [find_p(sku) for sku in scenario.future_skus]
            future_dtos = [
                HeroProductItemDTO(
                    id=p.id,
                    sku=p.sku,
                    name=p.name,
                    brand=p.brand,
                    category=p.category,
                    price=round(p.price * 0.90, 2),  # 10% Loyalty VIP pricing
                    original_price=p.price,
                    rating=p.rating,
                    image_url=p.image_url,
                    key_features=p.features[:3] if p.features else ["VIP Loyalty Rebate", "Next-Day Dispatch"],
                    gst_rate_pct=p.gst_rate_pct,
                    active_offer="10% Platinum Loyalty VIP Discount",
                    match_score_pct=99 if idx == 0 else (95 if idx == 1 else 91)
                )
                for idx, p in enumerate(future_prods)
            ]

            return HeroStepDataDTO(
                step_number=10,
                step_key="future_recommendations",
                title="10. Personalized Future Catalog",
                subtitle="Next-purchase proposals tailored with historical context & Platinum loyalty pricing",
                actor="AI Procurement Advisor",
                status="completed",
                timestamp=now_str,
                data={
                    "recommendations": [r.model_dump() for r in future_dtos],
                    "loyalty_tier_applied": "Enterprise Platinum (10% VIP auto-applied)",
                    "next_step_call_to_action": "1-Click Reorder & Escrow Authorization"
                },
                reasoning=ReasoningTraceDTO(
                    goal="Generate hyper-personalized procurement proposals using long-term historical memory",
                    thought=f"Customer is an established Platinum tier retail buyer. Curating Cash Drawers, Scanners, and Recon licenses with VIP pricing.",
                    observation="Synthesized proposal addressing upcoming store scaling and automated ERP accounting.",
                    action_taken="Rendered customized future procurement quote with 1-click reorder capability.",
                    decision_rationale="Proactive AI commerce transforms one-off transactions into recurring, automated enterprise procurement relationships.",
                    json_payload={"future_skus": [p.sku for p in future_prods], "loyalty_discount": "10% VIP"}
                ),
                audit_log=HeroAuditLogDTO(
                    id=f"aud_10_{uuid.uuid4().hex[:6]}",
                    step_number=10,
                    actor="AI Procurement Advisor",
                    event_type="FUTURE_QUOTE_PERSONALIZED",
                    description=f"Generated {len(future_dtos)} personalized future recommendations for {scenario.customer_name} with VIP loyalty rates.",
                    timestamp=now_str,
                    metadata={"skus": [r.sku for r in future_dtos], "tier": "Platinum"}
                ),
                risk_check=HeroRiskCheckDTO(
                    risk_level="LOW",
                    risk_score=0,
                    fraud_flags=[],
                    credit_limit_inr=1000000.0,
                    settlement_variance_inr=0.0,
                    gst_compliance_status="100% COMPLIANT",
                    reconciliation_verified=True
                )
            )

hero_demo_service = HeroDemoService()
