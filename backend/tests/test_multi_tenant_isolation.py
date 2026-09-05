import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.services.auth_service import auth_service
from app.services.merchant_service import merchant_service
from app.services.catalog_service import catalog_service

client = TestClient(app)


def test_new_merchant_initial_zero_state():
    """Verify newly registered merchant starts with exact 0 revenue, 0 orders, and 0 products."""
    suffix = uuid.uuid4().hex[:8]
    email = f"fresh_owner_{suffix}@testcorp.io"
    password = "SecurePassword#2026"
    
    # 1. Register new real merchant
    reg_resp = client.post("/api/v1/auth/register", json={
        "business_name": f"Fresh Store {suffix} Ltd",
        "email": email,
        "password": password,
        "gstin": "29AAAAA0000A1Z5"
    })
    assert reg_resp.status_code == 201, f"Registration failed: {reg_resp.text}"
    data = reg_resp.json()
    token = data["access_token"]
    merchant_id = data["merchant_id"]
    headers = {
        "Authorization": f"Bearer {token}",
        "x-merchant-id": merchant_id
    }

    # 2. Query dashboard metrics
    dash_resp = client.get("/api/v1/merchant/dashboard", headers=headers)
    assert dash_resp.status_code == 200, f"Dashboard failed: {dash_resp.text}"
    metrics = dash_resp.json()

    # Must NOT show preloaded demo data (₹2.77 Cr, 229 orders, 50 SKUs)
    assert metrics["gross_revenue"] == 0, f"Expected 0 gross revenue, got {metrics['gross_revenue']}"
    assert metrics["total_orders"] == 0, f"Expected 0 orders, got {metrics['total_orders']}"
    assert metrics["total_products"] == 0, f"Expected 0 products, got {metrics['total_products']}"
    assert metrics["total_customers"] == 0, f"Expected 0 customers, got {metrics['total_customers']}"
    assert metrics["paid_orders"] == 0
    assert metrics["recent_orders"] == []


def test_multi_tenant_isolation_between_merchants():
    """Verify Merchant B cannot see Merchant A's catalog products or orders."""
    suffix_a = uuid.uuid4().hex[:8]
    suffix_b = uuid.uuid4().hex[:8]

    # Register Merchant A
    reg_a = client.post("/api/v1/auth/register", json={
        "business_name": f"Tenant A {suffix_a}",
        "email": f"merchant_a_{suffix_a}@tenanta.com",
        "password": "PasswordA#123",
        "gstin": "29AAAAA0000A1Z5"
    }).json()
    token_a = reg_a["access_token"]
    mid_a = reg_a["merchant_id"]
    headers_a = {"Authorization": f"Bearer {token_a}", "x-merchant-id": mid_a}

    # Register Merchant B
    reg_b = client.post("/api/v1/auth/register", json={
        "business_name": f"Tenant B {suffix_b}",
        "email": f"merchant_b_{suffix_b}@tenantb.com",
        "password": "PasswordB#123",
        "gstin": "29BBBBB0000B1Z5"
    }).json()
    token_b = reg_b["access_token"]
    mid_b = reg_b["merchant_id"]
    headers_b = {"Authorization": f"Bearer {token_b}", "x-merchant-id": mid_b}

    # 1. Merchant A creates a product
    prod_resp_a = client.post("/api/v1/catalog/products", json={
        "name": f"Tenant A Exclusive Gadget {suffix_a}",
        "category": "Electronics",
        "price": 4999.0,
        "stock": 100,
        "description": "Proprietary device for Tenant A",
        "sku": f"SKU-A-{suffix_a}"
    }, headers=headers_a)
    assert prod_resp_a.status_code == 201, f"Failed to create product for Merchant A: {prod_resp_a.text}"

    # 2. Merchant A receives an order
    order_a = merchant_service.create_order_from_purchase(
        order_id=f"ord_a_{suffix_a}",
        customer_name="Customer of A",
        customer_email=f"customer_a_{suffix_a}@gmail.com",
        customer_phone="+919876543210",
        shipping_address="123 Tech Park, Bangalore",
        items=[{"product_name": "Tenant A Exclusive Gadget", "quantity": 2, "price": 4999.0, "total": 9998.0}],
        subtotal=9998.0,
        tax=1799.64,
        discount=0.0,
        gross_amount=11797.64,
        payment_id=f"pay_a_{suffix_a}",
        payment_method="upi",
        merchant_id=mid_a
    )
    assert order_a is not None
    assert order_a["order_number"].startswith("RCM-")

    # 3. Check Merchant A dashboard - reflects 1 order and revenue
    dash_a = client.get("/api/v1/merchant/dashboard", headers=headers_a).json()
    assert dash_a["total_orders"] >= 1
    assert dash_a["gross_revenue"] >= 11797.64
    assert dash_a["total_products"] >= 1

    # 4. Check Merchant B dashboard - MUST BE COMPLETELY ISOLATED (0 orders, 0 revenue, 0 products)
    dash_b = client.get("/api/v1/merchant/dashboard", headers=headers_b).json()
    assert dash_b["total_orders"] == 0, f"Merchant B leaked orders: {dash_b['total_orders']}"
    assert dash_b["gross_revenue"] == 0, f"Merchant B leaked revenue: {dash_b['gross_revenue']}"
    assert dash_b["total_products"] == 0, f"Merchant B leaked products: {dash_b['total_products']}"

    # 5. Check Merchant B orders endpoint - MUST NOT CONTAIN Merchant A's order
    orders_b = client.get("/api/v1/merchant/orders", headers=headers_b).json()
    orders_list_b = orders_b.get("orders", []) if isinstance(orders_b, dict) else orders_b
    order_nums_b = [o.get("order_number") or o.get("id") for o in orders_list_b]
    assert order_a["order_number"] not in order_nums_b, "Merchant B should NOT see Merchant A's order!"

    # 6. Check Merchant B catalog - MUST NOT CONTAIN Merchant A's product
    cat_b = client.get("/api/v1/catalog/products", headers=headers_b).json()
    prod_names_b = [p["name"] for p in cat_b.get("items", [])]
    assert f"Tenant A Exclusive Gadget {suffix_a}" not in prod_names_b, "Merchant B should NOT see Merchant A's product!"


def test_all_9_modules_fresh_merchant_isolation():
    """
    Exhaustively verify all 9 merchant modules return tenant-isolated zero/onboarding
    states for a brand-new merchant with 0 products, 0 orders, 0 customers, and 0 campaigns.
    
    1. Revenue Dashboard
    2. Upsell & Cross-Sell
    3. Agent Analytics
    4. Campaign Manager
    5. Customer Intelligence
    6. Demand Intelligence
    7. Agent Readiness Score
    8. CFO Copilot
    9. Forecast Service
    """
    suffix = uuid.uuid4().hex[:8]
    reg = client.post("/api/v1/auth/register", json={
        "business_name": f"Isolated Merchant {suffix} Ltd",
        "email": f"isolated_{suffix}@testcompany.in",
        "password": "StrongPassword#2026",
        "gstin": "29AAAAA0000A1Z5"
    }).json()
    mid = reg["merchant_id"]
    headers = {"Authorization": f"Bearer {reg['access_token']}", "x-merchant-id": mid}

    # 1. Revenue Dashboard
    rev_resp = client.get("/api/v1/merchant/growth/revenue-dashboard", headers=headers)
    assert rev_resp.status_code == 200
    rev_data = rev_resp.json()
    assert rev_data["kpis"]["revenue_today_inr"] == 0.0
    assert rev_data["kpis"]["revenue_mtd_inr"] == 0.0
    assert rev_data["kpis"]["orders_today"] == 0
    assert rev_data["kpis"]["average_order_value_aov_inr"] == 0.0
    assert rev_data["hourly_velocity_today"] == []
    assert rev_data["payment_channel_breakdown"] == []

    # 2. Upsell & Cross-Sell
    upsell_resp = client.get("/api/v1/merchant/growth/upsell-cross-sell", headers=headers)
    assert upsell_resp.status_code == 200
    upsell_data = upsell_resp.json()
    assert upsell_data["message"] == "No transactions available yet."
    assert upsell_data["bundles"] == []
    assert upsell_data["frequently_bought_together"] == []
    assert upsell_data["cross_sell_opportunities"] == []
    assert upsell_data["upsell_suggestions"] == []
    assert upsell_data["summary"]["total_active_rules"] == 0
    assert upsell_data["summary"]["total_published_bundles"] == 0

    # 3. Agent Analytics
    agent_resp = client.get("/api/v1/merchant/growth/agent-analytics", headers=headers)
    assert agent_resp.status_code == 200
    agent_data = agent_resp.json()
    assert agent_data["message"] == "No agent interactions yet."
    assert agent_data["overview"]["total_orders"] == 0
    assert agent_data["overview"]["ai_orders_count"] == 0
    assert agent_data["overview"]["total_revenue_inr"] == 0.0
    assert agent_data["top_ai_purchased_products"] == []
    assert agent_data["revenue_split_history"] == []

    # 4. Campaign Manager
    camp_resp = client.get("/api/v1/merchant/growth/campaigns", headers=headers)
    assert camp_resp.status_code == 200
    camp_data = camp_resp.json()
    assert camp_data["message"] == "No campaigns created."
    assert camp_data["campaigns"] == []
    assert camp_data["summary"]["active_campaigns"] == 0
    assert camp_data["summary"]["total_campaigns"] == 0

    # 5. Customer Intelligence
    cust_resp = client.get("/api/v1/merchant/growth/customer-intelligence", headers=headers)
    assert cust_resp.status_code == 200
    cust_data = cust_resp.json()
    assert cust_data["message"] == "No customer activity."
    assert cust_data["metrics"]["total_active_customers"] == 0
    assert cust_data["metrics"]["avg_customer_lifetime_value_inr"] == 0.0
    assert cust_data["clv_distribution"] == []
    assert cust_data["vip_customers"] == []

    # 6. Demand Intelligence
    demand_resp = client.get("/api/v1/growth/demand-intelligence", headers=headers)
    assert demand_resp.status_code == 200
    demand_data = demand_resp.json()
    assert demand_data["status"] == "INSUFFICIENT_DATA"
    assert demand_data["message"] == "Insufficient data for forecasting."
    assert demand_data["products"] == []
    assert demand_data["trending_products"] == []
    assert demand_data["dead_inventory"] == []

    # 7. Agent Readiness Score
    readiness_resp = client.get("/api/v1/merchant/growth/agent-readiness", headers=headers)
    assert readiness_resp.status_code == 200
    readiness = readiness_resp.json()
    assert readiness["overall_score"] == 0.0
    assert readiness["status"] == "ONBOARDING_REQUIRED"
    assert all(chk["passed"] is False for chk in readiness["checklist"])

    # 8. CFO Copilot
    copilot_resp = client.post("/api/v1/copilot/query", json={
        "messages": [{"role": "user", "content": "How is my business doing today?"}]
    }, headers=headers)
    assert copilot_resp.status_code == 200
    copilot_data = copilot_resp.json()
    assert "launch" in copilot_data["answer"].lower() or "catalog" in copilot_data["answer"].lower() or "0 products" in copilot_data["answer"].lower()

    # 9. Forecast Service
    forecast_resp = client.get("/api/v1/forecast", headers=headers)
    assert forecast_resp.status_code == 200
    forecast_data = forecast_resp.json()
    assert forecast_data["status"] == "INSUFFICIENT_DATA"
    assert forecast_data["current_cash_balance"] == 0.0
    assert forecast_data["daily_timeline"] == []
    assert forecast_data["forecast_7d"]["confidence_score"] == 0


def test_demo_merchant_retains_demo_data():
    """Verify demo account rzp_live_acme_8842 still returns seeded demo data."""
    demo_headers = {
        "x-merchant-id": "rzp_live_acme_8842"
    }
    # Direct merchant dashboard check for demo ID
    dash_resp = client.get("/api/v1/merchant/dashboard", headers=demo_headers)
    assert dash_resp.status_code == 200
    metrics = dash_resp.json()
    assert metrics["total_orders"] > 0
    assert metrics["gross_revenue"] > 0

    # Forecast endpoint retains seeded data for demo merchant
    forecast_resp = client.get("/api/v1/forecast", headers=demo_headers)
    assert forecast_resp.status_code == 200
    forecast_data = forecast_resp.json()
    assert forecast_data["status"] == "SUCCESS"
    assert forecast_data["current_cash_balance"] > 0
    assert forecast_data["forecast_30d"]["expected_inflow"] > 0

    # Readiness score retains high score for demo merchant
    readiness_resp = client.get("/api/v1/merchant/growth/agent-readiness", headers=demo_headers)
    assert readiness_resp.status_code == 200
    assert readiness_resp.json()["overall_score"] > 80.0
