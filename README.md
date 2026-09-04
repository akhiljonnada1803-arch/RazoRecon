# RazorRecon AI — Autonomous FinOps & Multi-Channel Financial Reconciliation Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js_14_App_Router-black.svg?logo=next.js&logoColor=white)](https://nextjs.org)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript_5-blue.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Language-Python_3.11+-3776AB.svg?logo=python&logoColor=white)](https://www.python.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **"The LLM proposes; deterministic code disposes."**  
> RazorRecon AI is an enterprise financial operations platform that unites multi-channel settlement reconciliation, behavioral vendor memory, autonomous month-end close acceleration, an executive ReAct CFO Copilot, and a conversational **Commerce Agent** with instant Razorpay checkout links.

---

## 🌟 Key Platform Modules

```
+---------------------------------------------------------------------------------------------------+
|                                       RAZORRECON AI PLATFORM                                      |
+---------------------------------------------------------------------------------------------------+
|  1. Enterprise RBAC & Auth       2. Zero-Data & Demo Suite     3. 3-Way Reconciliation Ingestion  |
|  4. Behavioral Vendor Memory     5. ReAct CFO AI Copilot       6. Autonomous Month-End Close      |
|  7. Cash Flow & Treasury         8. Fraud Sentinel             9. Conversational Commerce Agent   |
+---------------------------------------------------------------------------------------------------+
```

### 1. 🔐 Enterprise Authentication & Granular RBAC
* **SQLite-backed Identity Provider** with PBKDF2-SHA256 password hashing and JWT sessions.
* **4 Pre-configured Enterprise Personas**:
  * **Finance Controller** (`controller@acme.com` / `demo123`): Reconciliation, exception resolution, vendor intelligence, month-end close.
  * **Chief Financial Officer (CFO)** (`cfo@acme.com` / `demo123`): Executive dashboard, CFO Copilot, 90-day cash forecasting, audit logs.
  * **Statutory Auditor** (`auditor@acme.com` / `demo123`): Read-only forensic review, vendor memory dossiers, exception trails.
  * **Platform Admin** (`admin@razorrecon.ai` / `demo123`): Full cross-system configuration and tenant management.
* **Quick Persona Switcher**: Seamlessly switch roles in real-time with instant UI route gating and `403 Access Denied` sentinels.

### 2. ⚡ Zero-Data Architecture & One-Click Demo Suite
* Initial clean state displays **zero hardcoded values or synthetic placeholders**.
* Single-click **"Connect Demo Razorpay Account"** orchestrates:
  * Ingestion of **500 payment records**.
  * Auto-matching of **470 transactions (94.0% auto-match rate)**.
  * Detection of **30 actionable exceptions** (settlement delays, GST variances, duplicate invoices, unregistered wires).
  * Population of **22 scored vendor behavioral memory profiles**.

### 3. ⚖️ Deterministic 3-Way Reconciliation Engine
* Reconciles gateway payouts (Razorpay, Stripe, Shopify Direct, Amazon Marketplace) against bank deposits and internal ERP ledgers.
* Recomputes gross-to-net gateway MDR fees (2.0% + 18% GST).
* Correctly classifies Amazon Marketplace rolling reserves (e.g. 10–15% 14-day holdbacks) as temporary assets rather than revenue leakage.

### 4. 🧠 Forensic Vendor Behavioral Memory & Risk Scoring
* Dynamic risk state machine updating upon exception resolution:
  $$\text{Risk Score} = 0.40 \times \text{Exc Freq} + 0.30 \times \text{Delays} + 0.20 \times \text{Tax Mismatches} + 0.10 \times \text{Duplicates}$$
* Interactive 6-section **Vendor Intelligence Center** (`/vendor-intelligence`) with sliding dossiers, risk timelines, and AI mitigation playbooks.

### 5. 🤖 ReAct CFO Copilot (`/copilot`)
* Tool-augmented executive intelligence assistant.
* Executes live Python tools (`get_match_rate_analysis`, `get_cash_forecast`, `get_top_risks_and_fraud`, `get_vendor_exceptions`) and cites policy rules from a 148-passage accounting knowledge base.
* Offline deterministic heuristic fallback when external LLM API keys are omitted.

### 6. 🔒 Autonomous Month-End Close (`/month-close`)
* 7-phase automated financial close checklist with period locking and forensic audit trail generation.

### 7. 📦 AI Commerce Catalog Module (`/catalog`)
* **SQLite Persistent Storage**: Stored in `backend/data/catalog.db` with relational schemas for `products`, `offers`, and `categories`.
* **4 Dedicated UI Sections**:
  1. **Total Products**: Live count of active SKUs, total catalog valuation in ₹ Lakhs, and portfolio health.
  2. **Categories**: Taxonomies across 7 categories (*Payment Terminals, Soundboxes, FinOps Software, Workstations, Security, Storage, Retail Peripherals*) with dynamic filter chips.
  3. **Inventory Status**: Real-time stock breakdown (*In Stock, Low Stock, Out of Stock, Total Units*) and visual inventory distribution progress bar.
  4. **AI Readable Catalog**: Interactive inspector and 1-click JSON/Markdown copier providing token-optimized schema context for LLMs & autonomous commerce agents.
* **5-Column Enterprise Table**: **Product** (with thumbnail, SKU, tagline), **Price** (₹ INR, margin %, MRP), **Stock** (Units & status badge), **Category**, and **Offer** (promotional badge & discount text).
* **Offer Engine Integration**: Configurable discounts and promotional badges (*BESTSELLER, FESTIVE SALE, ENTERPRISE, PRO WORKSTATION, COMPLIANCE DEAL*) linked to coupon codes (`RAZOR2026`, `FESTIVE15`, `ENTERPRISE5000`, etc.).
* **Exposed REST APIs**:
  * `GET /products` (and `/catalog`): Filtered, searched, sorted, and paginated product catalog.
  * `POST /products`: Add new product SKU with technical specs and promotional offers.
  * `PUT /products/:id`: Update pricing, stock, metadata, or active offer.
  * `DELETE /products/:id`: Remove product SKU from the SQLite database.
  * `GET /products/stats`: Aggregate valuation, total inventory units, in-stock rate, and alert counts.
  * `GET /products/offers`: Active promotional offers and discount rules.
  * `GET /products/ai-context`: Token-optimized LLM and agent context.


### 8. 🛒 Conversational Commerce Agent (`/commerce-agent`)
* **ChatGPT-style Conversational Shopping**: Natural language search across enterprise hardware, developer peripherals, and FinOps software licenses priced in ₹ INR.
* **Interactive Product Recommendation Cards**: Highlights key technical specifications, star ratings, and instant cart actions.
* **Side-by-Side Product Comparison Matrix**: Multi-attribute comparison table with AI advisor recommendations.
* **Slide-Over Shopping Cart Drawer**: Quantity steppers, coupon validation (`RAZOR2026` for 10% instant discount), and 18% GST tax breakdown.
* **1-Click Razorpay Payment Link Generator**: Generates dynamic checkout links (`https://rzp.io/l/...`), BharatQR codes, and simulated payment reconciliation.

### 9. 📈 Revenue Growth Agent (`/growth-agent`)
* **Upsell & Tier-Upgrade Engine**: Recommends high-value upgrades (e.g., mPOS to Android V3 Pro with thermal printers, Quarterly to Annual Enterprise FinOps licenses, Countertop to Self-Checkout Kiosks) with real-time price delta, gross margin delta %, and conversion probability.
* **Cross-Sell & Basket Affinity Mining**: Analyzes 500+ historical merchant co-purchases to recommend synergistic complements with statistical metrics (Support %, Confidence %, and Lift Score > 2.0x).
* **Real-Time Revenue Uplift & Margin Expansion Prediction**: Computes **Current Cart Value**, **Predicted Cart Value**, **Expected Uplift %**, and **Margin Expansion %** with probability-weighted impact forecasting.
### 10. 📣 Campaign Orchestrator (`/campaigns`)
* **AI-Generated Campaigns**: Strategic goal-driven campaign formulation (*Revenue Surge, Winback, Hardware Launch, Clearance*) with dynamic copywriting and multi-channel targeting (WhatsApp Business, Email, SMS, In-App Push).
* **Price Elasticity & Discount Simulation**: Microeconomic simulation model calculating volume expansion vs margin dilution, price elasticity factor ($E$), conversion lift %, gross campaign revenue, discount costs, and campaign ROI %.
* **RFM Customer Segmentation**: 5 behavioral clusters (*High-Volume Enterprise, Fast-Growing D2C Retailers, At-Risk Inactive Merchants, Seasonal Festive Sellers, New Onboarding*) with merchant reach, AOV, churn risk %, and GMV.
* **Time-Series Revenue Forecasting**: Day-by-day projected revenue trajectory comparing baseline organic sales against campaign revenue lift.
### 11. 💳 Razorpay Test Mode & Auto-Reconciliation Integration
* **Create Order API (`POST /api/payments/create-order`)**: Generates Razorpay order IDs (`order_rzp_...`), creates checkout session URLs, and persists order records in SQLite `orders` table.
* **HMAC Signature Verification (`POST /api/payments/verify`)**: Validates SHA256 signatures, updates order status to `paid`, and writes payment records to SQLite `payments` table.
* **Webhook Processing (`POST /api/webhooks/razorpay`)**: Validates `X-Razorpay-Signature` against webhook secret, processing `payment.captured`, `order.paid`, and `payment.failed`.
* **Automatic Reconciliation Trigger**: Every captured payment automatically triggers the **Reconciliation Engine**, recomputing the 2.0% Razorpay MDR processing fee + 18% GST on fees, and recording the matched deposit in the memory engine and ledger with 0 discrepancies.

### 12. 🤖 Agent-to-Agent Commerce Simulator (`/agent-commerce`)
* **Autonomous Buyer & Seller Protocol**: Dual-agent architecture where **Buyer Agent** (Corporate Procurement AI) and **Seller Agent** (Merchant Commerce AI) negotiate and settle transactions autonomously.
* **Visual 6-Step Workflow Timeline**:
  1. **Search Product**: Intent parsing, catalog query, and initial quote generation.
  2. **Negotiate**: Multi-turn price elasticity and 10% enterprise volume discount consensus.
  3. **Generate Cart**: Binding order assembly with 18% GST calculation and free shipping.
  4. **Create Payment**: Razorpay test order provision (`order_rzp_...`).
  5. **Verify Payment**: Cryptographic HMAC SHA256 signature verification.
  6. **Update Ledger**: Double-entry ERP general ledger sync and memory engine reconciliation.

### 13. ⚡ AI Checkout Engine (`/checkout`)

* **Interactive 4-Phase Flow**: `1. Agent Assistant → 2. Interactive Cart → 3. Order Creation → 4. Razorpay Checkout`.
* **Conversational AI Checkout Assistant**: Natural language prompt executor (*"Add 2 POS terminals and apply coupon"*, *"Add 4G Soundbox Pro"*, *"Reset cart"*) with contextual recommendations and one-click auto-coupon optimizer.
* **Full Cart Operations**: Add, remove, and stepper quantity increment/decrement with catalog quick-selector drawer.
* **Granular Checkout Summary**:
  * **Order Amount (Subtotal)**
  * **Taxes (18% GST with ITC eligibility)**
  * **Discounts (Coupon / Offer Engine deductions)**
  * **Final Amount (in ₹ INR)**
* **Razorpay Test Mode Checkout & Shareable Links**:
  * Generates Razorpay Order ID (`order_rzp_...`) and instant shareable payment link (`https://rzp.io/l/...`).
  * Dynamic BharatQR / UPI QR code simulation.
  * 1-Click test payment simulation executing HMAC verification and auto-reconciliation.
### 14. 🏆 Flagship AI Commerce Hero Demo — Razorpay Track 01 (`/hero-demo`)

An interactive, end-to-end 10-phase demonstration orchestrating the entire lifecycle of an autonomous AI commerce transaction with instant reconciliation:

```
1. Merchant uploads catalog
   ↓
2. AI understands catalog (vector embeddings & semantic indexing)
   ↓
3. Customer asks for product (intent parsing & constraint formulation)
   ↓
4. Agent recommends products (semantic search & match score %)
   ↓
5. Agent creates cart (tax computation & enterprise coupon application)
   ↓
6. Agent initiates Razorpay checkout (order generation & payment link creation)
   ↓
7. Payment success (HMAC verification & instant double-entry ERP reconciliation)
   ↓
8. Upsell recommendations (margin-maximizing complementary add-ons)
   ↓
9. Purchase stored in memory (customer behavioral profile & tier updates)
   ↓
10. Future recommendations personalized (adaptive RFM quotes)
```

#### Key Architecture & Forensic Standards for Track 01:
* **Interactive 10-Step Workflow Stepper**: Real-time progress bar, visual status badges, and direct phase navigation.
* **4 Procurement Scenarios**:
  1. *Acme Retail Store Expansion (Mumbai Fleet)*
  2. *Novus Cloud Multi-Channel FinOps Sync*
  3. *Fintech Trading Desk Workstation Setup*
  4. *Statutory Finance Archive & Hardware Security*
* **Playback Controls**: Auto-play, pause, 1x/2x/4x playback speed, manual forward/backward, and 1-Click Fast Forward.
* **Mandatory Step-by-Step Forensics**:
  * **Reasoning Trace**: ReAct framework detailing Goal, Thought, Observation, Action Taken, Decision Rationale, and JSON payloads.
  * **Audit Trail**: Actor-attributed events (`Merchant`, `AI Embeddings Engine`, `Customer`, `Commerce Agent`, `Razorpay Gateway`, `Reconciliation Engine`).
  * **Risk Status & SLA**: Real-time fraud detection score (0/100), GST compliance, and zero-discrepancy reconciliation verification.
  * **Double-Entry General Ledger Voucher**: Live accounting entries posting debits to Operating Bank and Gateway Fees, and credits to Revenue accounts.


---

## 🏗️ Architecture & Technology Stack

```
+-------------------------------------------------------------------------------+
|                            FRONTEND (Next.js 14)                              |
|  App Router | AppShell Route Guard | AuthContext (RBAC) | TanStack Query v5   |
+---------------------------------------+---------------------------------------+
                                        | JSON / REST / Bearer JWT
+---------------------------------------v---------------------------------------+
|                               FASTAPI BACKEND                                 |
|  api/v1/endpoints/  -->  Core RBAC Sentinel (Depends)  -->  Service Layer     |
+-------------------------------------------------------------------------------+
|  Reconciliation | Vendor Memory | CFO Copilot | Commerce Agent | A2A Simulator|
+-----------------+---------------+-------------+----------------+--------------+
                                        |
+---------------------------------------v---------------------------------------+
|                        STORAGE & DATA PERSISTENCE                             |
|  backend/data/auth.db (RBAC)         |   backend/data/payments.db (Orders)    |
|  backend/data/memory_engine.db (Vendors)                                      |
+-------------------------------------------------------------------------------+
```

### Stack Breakdown
* **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Lucide Icons, Recharts, TanStack Query v5.
* **Backend**: FastAPI, Uvicorn, Pydantic v2, Python 3.11+.
* **Database**: SQLite 3 with parameterized queries and transactional consistency (`auth.db`, `payments.db`, `memory_engine.db`).
* **AI & Retrieval**: ReAct Tool Execution, TF-IDF Cosine Semantic Search, Price Elasticity Modeling, OpenAI GPT-4o-mini / Heuristic Fallback.

---

## 🚀 Quickstart & Local Setup

### Prerequisites
* **Node.js** v18+ and `npm`
* **Python** v3.10+ and `pip`

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r ../requirements.txt

# Start FastAPI uvicorn development server (Port 8000)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*API Documentation will be live at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)*

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Next.js development server (Port 3001)
npm run dev -- -p 3001
```
*Frontend workspace will be live at: [http://localhost:3001](http://localhost:3001)*

---

## 🔑 Demo Credentials

| Role | Email | Password | Allowed Capabilities |
| :--- | :--- | :--- | :--- |
| **Finance Controller** | `controller@acme.com` | `demo123` | Reconciliation, Exception Queue, Vendor Intel, Month Close |
| **Chief Financial Officer** | `cfo@acme.com` | `demo123` | Dashboard, CFO Copilot, Cash Forecasting, Growth Agent, Campaigns, A2A Commerce |
| **Statutory Auditor** | `auditor@acme.com` | `demo123` | Read-only Audit Logs, Vendor Dossiers, Exception History |
| **Platform Admin** | `admin@razorrecon.ai` | `demo123` | Complete Unrestricted Platform & System Access |

*Use the **Autofill Demo Persona** buttons on `/login` or the **Navbar Switcher** for instant role switching.*

---

## 📡 API Endpoints Overview

| Endpoint | Method | Tag | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/agent-commerce/scenarios` | `GET` | A2A Commerce | List preset procurement scenarios |
| `/api/v1/agent-commerce/simulate` | `POST` | A2A Commerce | Run full 6-phase autonomous simulation |
| `/api/payments/create-order` | `POST` | Payments | Create order & generate Razorpay checkout session |
| `/api/payments/verify` | `POST` | Payments | Verify HMAC signature & auto-reconcile transaction |
| `/api/payments/orders` | `GET` | Payments | List stored orders from SQLite database |
| `/api/payments/list` | `GET` | Payments | List stored payments with reconciliation status |
| `/api/webhooks/razorpay` | `POST` | Webhooks | Ingest Razorpay webhooks & auto-reconcile |
| `/api/v1/auth/login` | `POST` | Auth | Authenticate user & receive JWT token |
| `/api/v1/auth/quick-switch` | `POST` | Auth | Demo role switcher without full logout |
| `/api/v1/dashboard/executive` | `GET` | Dashboard | Executive financial KPIs and cash runway |
| `/api/v1/reconciliation` | `GET` | Reconciliation | Multi-channel deposit reconciliation |
| `/api/v1/reconciliation/run-razorpay` | `POST` | Reconciliation | Ingest payments & run 3-way match |
| `/api/v1/vendors/risk` | `GET` | Vendor Risk | Scored counterparty risk ratings |
| `/api/v1/memory/vendors` | `GET` | Memory | Behavioral vendor memory profiles |
| `/api/v1/copilot/query` | `POST` | Copilot | ReAct tool-augmented CFO Copilot |
| `/api/v1/month-close/execute` | `POST` | Month Close | Autonomous 7-step close execution |
| `/api/v1/commerce/products` | `GET` | Commerce | List & search catalog products |
| `/api/v1/commerce/chat` | `POST` | Commerce | Natural language shopping agent |
| `/api/v1/commerce/checkout` | `POST` | Commerce | Generate 1-click Razorpay payment link |
| `/api/v1/catalog` | `GET` | Catalog | List, search & filter 50 catalog products |
| `/api/v1/catalog` | `POST` | Catalog | Create new product SKU with specs & stock |
| `/api/v1/catalog/{id}/stock` | `PATCH` | Catalog | Quick inventory stock level adjustment |
| `/api/v1/catalog/ai-context` | `GET` | Catalog | AI-readable JSON schema for LLMs & RAG |
| `/api/v1/growth/analyze` | `POST` | Growth | Upsell/cross-sell recommendations & uplift prediction |
| `/api/v1/growth/sample-baskets` | `GET` | Growth | Predefined merchant industry sample baskets |
| `/api/v1/growth/affinity-matrix` | `GET` | Growth | Market basket association rules & lift scores |
| `/api/v1/campaigns` | `GET` | Campaigns | Full campaign orchestrator overview & KPIs |
| `/api/v1/campaigns/segments` | `GET` | Campaigns | List RFM customer segments |
| `/api/v1/campaigns/simulate` | `POST` | Campaigns | Price elasticity & discount simulation |
| `/api/v1/campaigns/generate` | `POST` | Campaigns | AI-generated campaign formulation |
| `/api/v1/campaigns/{id}/status` | `PATCH` | Campaigns | Toggle campaign active/draft status |
| `/api/v1/campaigns/{id}` | `DELETE` | Campaigns | Delete campaign |
| `/api/v1/demo/connect-razorpay` | `POST` | Demo | 1-click full dataset demo generator |
| `/api/v1/demo/reset` | `POST` | Demo | Reset platform to clean zero-data state |

---

## 📄 License
This project is licensed under the MIT License.
