import pytest
import sqlite3
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.services.auth_service import auth_service

client = TestClient(app)

def test_1_customer_registration_via_auth_register():
    """Test 1: Register customer via /auth/register with role='Customer'."""
    unique_suffix = uuid.uuid4().hex[:8]
    payload = {
        "name": f"Customer {unique_suffix}",
        "email": f"cust_{unique_suffix}@example.com",
        "password": "SecurePassword#123",
        "role": "Customer",
        "organization_name": "Consumer Hub"
    }

    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"

    data = response.json()
    assert data["status"] == "ACTIVE"
    assert data["email"] == payload["email"].lower()
    assert "access_token" in data
    assert data["user"]["role"] == "Customer"
    assert data["user"]["role_id"] == "role_customer"
    assert "PLACE_ORDERS" in data["user"]["permissions"]
    assert "BROWSE_CATALOG" in data["user"]["permissions"]


def test_2_customer_registration_via_register_customer_endpoint():
    """Test 2: Register customer via dedicated /auth/register-customer endpoint."""
    unique_suffix = uuid.uuid4().hex[:8]
    payload = {
        "name": f"Priya {unique_suffix}",
        "email": f"priya_{unique_suffix}@consumer.in",
        "password": "CustomerSecret!2026",
        "organization_name": "Retail Shopper"
    }

    response = client.post("/api/v1/auth/register-customer", json=payload)
    assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"

    data = response.json()
    assert data["user"]["role"] == "Customer"
    assert data["user"]["name"] == payload["name"]
    assert len(data["access_token"]) > 20


def test_3_customer_registration_duplicate_email_409():
    """Test 3: Reject duplicate registration with 409 Conflict."""
    unique_suffix = uuid.uuid4().hex[:8]
    payload = {
        "name": "Duplicate Test",
        "email": f"dup_{unique_suffix}@example.com",
        "password": "Password123456",
        "role": "Customer"
    }

    resp1 = client.post("/api/v1/auth/register", json=payload)
    assert resp1.status_code == 201

    resp2 = client.post("/api/v1/auth/register", json=payload)
    assert resp2.status_code == 409
    assert resp2.json()["detail"] == "EMAIL_ALREADY_EXISTS"


def test_4_customer_registration_weak_password_400():
    """Test 4: Reject weak password with 400 Bad Request."""
    unique_suffix = uuid.uuid4().hex[:8]
    payload = {
        "name": "Weak Pass User",
        "email": f"weak_{unique_suffix}@example.com",
        "password": "123",
        "role": "Customer"
    }

    resp = client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 400
    assert resp.json()["detail"] == "WEAK_PASSWORD"


def test_5_fresh_customer_has_zero_orders_and_no_demo_leak():
    """Test 5: Newly registered customer sees 0 orders, no demo account order leakage."""
    unique_suffix = uuid.uuid4().hex[:8]
    reg_resp = client.post("/api/v1/auth/register-customer", json={
        "name": f"Fresh Buyer {unique_suffix}",
        "email": f"buyer_{unique_suffix}@retail.com",
        "password": "StrongPassword2026"
    })
    assert reg_resp.status_code == 201
    token = reg_resp.json()["access_token"]

    # Query customer orders
    orders_resp = client.get("/api/v1/customer/orders", headers={"Authorization": f"Bearer {token}"})
    assert orders_resp.status_code == 200
    orders_data = orders_resp.json()
    assert orders_data["total"] == 0
    assert len(orders_data["orders"]) == 0, "Fresh customer should see 0 orders, no demo orders leaked!"


def test_6_fresh_customer_has_zero_addresses():
    """Test 6: Newly registered customer has 0 addresses, not the demo user's addresses."""
    unique_suffix = uuid.uuid4().hex[:8]
    reg_resp = client.post("/api/v1/auth/register-customer", json={
        "name": f"Address Test {unique_suffix}",
        "email": f"addr_{unique_suffix}@retail.com",
        "password": "StrongPassword2026"
    })
    assert reg_resp.status_code == 201
    token = reg_resp.json()["access_token"]

    addr_resp = client.get("/api/v1/customer/addresses", headers={"Authorization": f"Bearer {token}"})
    assert addr_resp.status_code == 200
    assert addr_resp.json() == [], "Fresh customer must start with empty address book!"


def test_7_fresh_customer_dashboard_widgets_isolated():
    """Test 7: Customer dashboard widgets show 0 orders, 0 in-transit, 0 addresses."""
    unique_suffix = uuid.uuid4().hex[:8]
    reg_resp = client.post("/api/v1/auth/register-customer", json={
        "name": f"Widgets Test {unique_suffix}",
        "email": f"widget_{unique_suffix}@retail.com",
        "password": "StrongPassword2026"
    })
    token = reg_resp.json()["access_token"]

    widgets_resp = client.get("/api/v1/customer/dashboard-widgets", headers={"Authorization": f"Bearer {token}"})
    assert widgets_resp.status_code == 200
    w_data = widgets_resp.json()
    assert w_data["total_orders"] == 0
    assert w_data["in_transit_count"] == 0
    assert w_data["saved_addresses_count"] == 0
    assert len(w_data["recent_orders"]) == 0
    assert len(w_data["saved_addresses"]) == 0


def test_8_customer_order_cross_contamination_prevention():
    """Test 8: Orders placed by customer A are visible to A but completely invisible to customer B."""
    sfx_a = uuid.uuid4().hex[:8]
    sfx_b = uuid.uuid4().hex[:8]

    # Register Customer A
    resp_a = client.post("/api/v1/auth/register-customer", json={
        "name": f"Customer Alpha {sfx_a}",
        "email": f"alpha_{sfx_a}@domain.com",
        "password": "SecurePassword#A"
    })
    token_a = resp_a.json()["access_token"]

    # Customer A saves an address
    addr_resp = client.post(
        "/api/v1/customer/addresses",
        json={
            "full_name": f"Customer Alpha {sfx_a}",
            "phone": "+91 99887 76655",
            "address_line1": "123 Tech Park Alpha",
            "city": "Bengaluru",
            "state": "Karnataka",
            "pincode": "560100"
        },
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert addr_resp.status_code == 200

    # Customer A executes checkout
    checkout_resp = client.post(
        "/api/v1/customer/checkout",
        json={
            "delivery_option": "STANDARD",
            "shipping_address": {
                "address_line1": "123 Tech Park Alpha",
                "city": "Bengaluru",
                "state": "Karnataka",
                "pincode": "560100"
            },
            "items": [{
                "product_id": "HW-POS-001",
                "name": "Smart POS Terminal",
                "price": 14999.0,
                "quantity": 1
            }],
            "payment_method": "UPI"
        },
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert checkout_resp.status_code == 200
    created_order = checkout_resp.json()
    order_id = created_order["id"]

    # Customer A verifies they see their 1 order
    orders_a = client.get("/api/v1/customer/orders", headers={"Authorization": f"Bearer {token_a}"}).json()
    assert orders_a["total"] == 1
    assert orders_a["orders"][0]["id"] == order_id

    # Register Customer B
    resp_b = client.post("/api/v1/auth/register-customer", json={
        "name": f"Customer Beta {sfx_b}",
        "email": f"beta_{sfx_b}@domain.com",
        "password": "SecurePassword#B"
    })
    token_b = resp_b.json()["access_token"]

    # Customer B must see 0 orders (NOT Customer A's order)
    orders_b = client.get("/api/v1/customer/orders", headers={"Authorization": f"Bearer {token_b}"}).json()
    assert orders_b["total"] == 0
    assert len(orders_b["orders"]) == 0, "Customer B must not see Customer A's orders!"

    # Customer B attempts to directly query Customer A's order -> 403 Forbidden
    direct_order_resp = client.get(f"/api/v1/customer/orders/{order_id}", headers={"Authorization": f"Bearer {token_b}"})
    assert direct_order_resp.status_code == 403, "Direct access to other customer's order must return 403 Forbidden!"


def test_9_anonymous_visitor_sees_zero_orders():
    """Test 9: Anonymous visitor querying /customer/orders gets 0 orders, zero demo leak."""
    anon_resp = client.get("/api/v1/customer/orders")
    assert anon_resp.status_code == 200
    assert anon_resp.json() == {"orders": [], "total": 0}

    anon_addr_resp = client.get("/api/v1/customer/addresses")
    assert anon_addr_resp.status_code == 200
    assert anon_addr_resp.json() == []


def test_10_demo_customer_account_orders_preserved():
    """Test 10: The seed demo customer customer@acme.com can still access their demo orders."""
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "customer@acme.com",
        "password": "demo123"
    })
    assert login_resp.status_code == 200
    demo_token = login_resp.json()["access_token"]

    demo_orders = client.get("/api/v1/customer/orders", headers={"Authorization": f"Bearer {demo_token}"}).json()
    assert demo_orders["total"] >= 1, "Demo customer should have their demo orders accessible!"

