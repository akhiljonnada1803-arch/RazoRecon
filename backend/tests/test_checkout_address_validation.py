import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.services.customer_order_service import customer_order_service
from app.services.merchant_service import merchant_service

client = TestClient(app)

def create_test_customer():
    unique = uuid.uuid4().hex[:8]
    email = f"cust_{unique}@testdomain.com"
    reg_payload = {
        "name": f"Test Customer {unique}",
        "email": email,
        "password": "SecurePassword123!"
    }
    resp = client.post("/api/v1/auth/register-customer", json=reg_payload)
    assert resp.status_code in (200, 201), resp.text
    data = resp.json()
    token = data["access_token"]
    user_id = data["user"]["id"]
    return user_id, email, token, {"Authorization": f"Bearer {token}"}

def test_checkout_fails_without_customer_id():
    """Verify order creation is rejected if customer_id is missing."""
    payload = {
        "address_id": "addr_123",
        "payment_method": "UPI",
        "items": [{"product_id": "HW-POS-001", "name": "POS Terminal", "price": 14999.0, "quantity": 1}]
    }
    resp = client.post("/api/v1/customer/checkout", json=payload)
    assert resp.status_code == 400
    assert "customer_id is required" in resp.json()["detail"]

def test_checkout_fails_without_address_id():
    """Verify order creation is rejected if address_id is missing."""
    user_id, email, token, headers = create_test_customer()
    payload = {
        "customer_id": user_id,
        "customer_email": email,
        "payment_method": "UPI",
        "items": [{"product_id": "HW-POS-001", "name": "POS Terminal", "price": 14999.0, "quantity": 1}]
    }
    resp = client.post("/api/v1/customer/checkout", json=payload, headers=headers)
    assert resp.status_code == 400
    assert "Please add a delivery address before placing an order." in resp.json()["detail"]

def test_checkout_fails_when_customer_has_no_saved_addresses():
    """Verify order creation is blocked with exact required message if customer has zero saved addresses."""
    user_id, email, token, headers = create_test_customer()
    payload = {
        "customer_id": user_id,
        "customer_email": email,
        "address_id": "addr_non_existent",
        "payment_method": "UPI",
        "items": [{"product_id": "HW-POS-001", "name": "POS Terminal", "price": 14999.0, "quantity": 1}]
    }
    resp = client.post("/api/v1/customer/checkout", json=payload, headers=headers)
    assert resp.status_code == 400
    assert "Please add a delivery address before placing an order." in resp.json()["detail"]

def test_checkout_fails_without_payment_method():
    """Verify order creation is rejected if payment_method is missing."""
    user_id, email, token, headers = create_test_customer()
    # Add address first
    addr_payload = {
        "full_name": "Test Recipient",
        "phone": "9876543210",
        "house_flat_number": "Flat 101",
        "street": "Indiranagar 100 Feet Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pincode": "560038",
        "landmark": "Near Metro Pillar 45"
    }
    addr_resp = client.post("/api/v1/customer/addresses", json=addr_payload, headers=headers)
    assert addr_resp.status_code == 200, addr_resp.text
    saved_addr = addr_resp.json()
    addr_id = saved_addr["id"]

    payload = {
        "customer_id": user_id,
        "customer_email": email,
        "address_id": addr_id,
        "items": [{"product_id": "HW-POS-001", "name": "POS Terminal", "price": 14999.0, "quantity": 1}]
    }
    resp = client.post("/api/v1/customer/checkout", json=payload, headers=headers)
    assert resp.status_code == 400
    assert "payment_method is required" in resp.json()["detail"]

def test_address_creation_all_8_fields():
    """Verify customer address correctly saves and retrieves all 8 required fields."""
    user_id, email, token, headers = create_test_customer()
    addr_payload = {
        "full_name": "Dr. Ananya Roy",
        "phone": "+91 9988776655",
        "house_flat_number": "Villa #12, Palm Meadows",
        "street": "Varthur Road, Whitefield",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pincode": "560066",
        "landmark": "Near Forum Mall Whitefield"
    }
    resp = client.post("/api/v1/customer/addresses", json=addr_payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()

    assert data["full_name"] == "Dr. Ananya Roy"
    assert data["phone"] == "+91 9988776655"
    assert data["house_flat_number"] == "Villa #12, Palm Meadows"
    assert data["street"] == "Varthur Road, Whitefield"
    assert data["city"] == "Bengaluru"
    assert data["state"] == "Karnataka"
    assert data["pincode"] == "560066"
    assert data["landmark"] == "Near Forum Mall Whitefield"

def test_checkout_stores_shipping_and_billing_address_ids():
    """Verify order creation stores both shipping_address_id and billing_address_id in database."""
    user_id, email, token, headers = create_test_customer()

    # Add shipping address
    ship_payload = {
        "full_name": "Siddharth Rao",
        "phone": "+91 9123456780",
        "house_flat_number": "Penthouse 901",
        "street": "Koramangala 5th Block",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pincode": "560095",
        "landmark": "Opposite Koramangala Club"
    }
    ship_res = client.post("/api/v1/customer/addresses", json=ship_payload, headers=headers)
    assert ship_res.status_code == 200
    ship_addr_id = ship_res.json()["id"]

    # Add billing address
    bill_payload = {
        "full_name": "Siddharth Rao Enterprises",
        "phone": "+91 9123456780",
        "house_flat_number": "Office 405, Prestige Meridian",
        "street": "MG Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pincode": "560001",
        "landmark": "Next to Trinity Metro"
    }
    bill_res = client.post("/api/v1/customer/addresses", json=bill_payload, headers=headers)
    assert bill_res.status_code == 200
    bill_addr_id = bill_res.json()["id"]

    checkout_payload = {
        "customer_id": user_id,
        "customer_email": email,
        "address_id": ship_addr_id,
        "shipping_address_id": ship_addr_id,
        "billing_address_id": bill_addr_id,
        "payment_method": "UPI",
        "delivery_option": "EXPRESS",
        "items": [{
            "product_id": "HW-POS-001",
            "name": "Razorpay Smart POS Pro",
            "price": 14999.0,
            "quantity": 1
        }]
    }

    order_resp = client.post("/api/v1/customer/checkout", json=checkout_payload, headers=headers)
    assert order_resp.status_code == 200, order_resp.text
    order = order_resp.json()

    assert order["id"].startswith("ord_")
    assert order["shipping_address_id"] == ship_addr_id
    assert order["billing_address_id"] == bill_addr_id
    assert "Penthouse 901" in order["shipping_address"]
    assert "Koramangala 5th Block" in order["shipping_address"]

    # Verify directly from database table merchant_orders
    with customer_order_service._get_conn() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT shipping_address_id, billing_address_id, customer_id, shipping_address FROM merchant_orders WHERE id = ?", (order["id"],))
        row = cursor.fetchone()
        assert row is not None
        assert row["shipping_address_id"] == ship_addr_id
        assert row["billing_address_id"] == bill_addr_id
        assert row["customer_id"] == user_id
        assert "Penthouse 901" in row["shipping_address"]
