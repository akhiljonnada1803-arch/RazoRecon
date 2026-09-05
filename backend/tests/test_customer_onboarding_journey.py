import pytest
import sqlite3
import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_1_customer_registration_and_initial_onboarding_status():
    """Test 1: Newly registered customer starts with uncompleted onboarding and AutoPay locked."""
    unique_id = uuid.uuid4().hex[:8]
    reg_payload = {
        "name": f"Onboard User {unique_id}",
        "email": f"onboard_{unique_id}@test.com",
        "password": "SecurePassword123!",
        "organization_name": "Test Consumer"
    }

    reg_resp = client.post("/api/v1/auth/register-customer", json=reg_payload)
    assert reg_resp.status_code == 201
    auth_data = reg_resp.json()
    token = auth_data["access_token"]
    user_id = auth_data["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}

    # Query /onboarding/status
    status_resp = client.get("/api/v1/customer/onboarding/status", headers=headers)
    assert status_resp.status_code == 200
    status = status_resp.json()

    assert status["has_address"] is False
    assert status["addresses_count"] == 0
    assert status["has_payment_method"] is False
    assert status["payment_methods_count"] == 0
    assert status["has_completed_order"] is False
    assert status["orders_count"] == 0
    assert status["is_onboarding_completed"] is False
    assert status["autopay_eligible"] is False
    assert status["completed_prerequisites_count"] == 0
    assert status["progress_percentage"] == 0


def test_2_step1_save_onboarding_address():
    """Test 2: Complete step 1 by saving default delivery address."""
    unique_id = uuid.uuid4().hex[:8]
    reg_payload = {
        "name": f"Address User {unique_id}",
        "email": f"addr_{unique_id}@test.com",
        "password": "SecurePassword123!"
    }
    reg_resp = client.post("/api/v1/auth/register-customer", json=reg_payload)
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    addr_payload = {
        "full_name": f"Address User {unique_id}",
        "phone": "+91 98765 43210",
        "address_line1": "Flat 304, Green Glen Layout",
        "address_line2": "Bellandur Outer Ring Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pincode": "560103",
        "landmark": "Near EcoSpace Tech Park"
    }

    resp = client.post("/api/v1/customer/onboarding/address", json=addr_payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["next_step"] == "/onboarding/payment"
    assert data["address"]["is_default"] == 1
    assert data["address"]["city"] == "Bengaluru"

    # Status should reflect address added
    status = data["onboarding_status"]
    assert status["has_address"] is True
    assert status["addresses_count"] == 1
    assert status["has_payment_method"] is False
    assert status["autopay_eligible"] is False
    assert status["completed_prerequisites_count"] == 1


def test_3_step2_skip_payment_setup():
    """Test 3: Customer can skip payment setup during onboarding and finish."""
    unique_id = uuid.uuid4().hex[:8]
    reg_payload = {
        "name": f"Skip User {unique_id}",
        "email": f"skip_{unique_id}@test.com",
        "password": "SecurePassword123!"
    }
    reg_resp = client.post("/api/v1/auth/register-customer", json=reg_payload)
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Add address
    client.post("/api/v1/customer/onboarding/address", json={
        "full_name": "Skip User",
        "phone": "+91 98765 43210",
        "address_line1": "123 Main St",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pincode": "560001"
    }, headers=headers)

    # 2. Skip payment
    pay_resp = client.post("/api/v1/customer/onboarding/payment", json={"skipped": True}, headers=headers)
    assert pay_resp.status_code == 200
    pay_data = pay_resp.json()
    assert pay_data["success"] is True
    assert pay_data["skipped"] is True
    assert pay_data["next_step"] == "/"

    status = pay_data["onboarding_status"]
    assert status["is_onboarding_completed"] is True
    assert status["payment_skipped"] is True
    assert status["has_payment_method"] is False
    # AutoPay still locked because no payment method and 0 orders
    assert status["autopay_eligible"] is False


def test_4_step2_connect_payment_method_and_unlock_autopay():
    """Test 4: Customer connects payment method and places order -> AutoPay becomes eligible."""
    unique_id = uuid.uuid4().hex[:8]
    reg_payload = {
        "name": f"Full User {unique_id}",
        "email": f"full_{unique_id}@test.com",
        "password": "SecurePassword123!"
    }
    reg_resp = client.post("/api/v1/auth/register-customer", json=reg_payload)
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Step 1: Add address
    addr_resp = client.post("/api/v1/customer/onboarding/address", json={
        "full_name": "Full User",
        "phone": "+91 98765 43210",
        "address_line1": "456 Prestige Boulevard",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pincode": "560029"
    }, headers=headers)
    assert addr_resp.status_code == 200
    addr_id = addr_resp.json()["address"]["id"]

    # Step 2: Connect Payment Method
    pay_payload = {
        "type": "UPI_AUTOPAY",
        "bank_name": "HDFC Bank",
        "account_or_vpa": f"user_{unique_id}@okhdfcbank",
        "max_amount": 25000.0
    }
    pay_resp = client.post("/api/v1/customer/onboarding/payment", json=pay_payload, headers=headers)
    assert pay_resp.status_code == 200
    status = pay_resp.json()["onboarding_status"]
    assert status["has_address"] is True
    assert status["has_payment_method"] is True
    # AutoPay not eligible yet because 0 completed orders
    assert status["autopay_eligible"] is False
    assert status["completed_prerequisites_count"] == 2

    # Step 3: Place first order
    checkout_payload = {
        "address_id": addr_id,
        "delivery_option": "STANDARD",
        "shipping_address": {
            "address_line1": "456 Prestige Boulevard",
            "city": "Bengaluru",
            "state": "Karnataka",
            "pincode": "560029"
        },
        "items": [{
            "product_id": "HW-POS-001",
            "name": "Smart POS Terminal",
            "price": 14999.0,
            "quantity": 1
        }],
        "payment_method": "UPI"
    }
    co_resp = client.post("/api/v1/customer/checkout", json=checkout_payload, headers=headers)
    assert co_resp.status_code == 200
    order_data = co_resp.json()
    order_id = order_data["id"]
    assert order_id.startswith("ord_")

    # Check status again -> All 3 prerequisites met -> AutoPay unlocked!
    final_status_resp = client.get("/api/v1/customer/onboarding/status", headers=headers)
    assert final_status_resp.status_code == 200
    final_status = final_status_resp.json()
    assert final_status["has_address"] is True
    assert final_status["has_payment_method"] is True
    assert final_status["has_completed_order"] is True
    assert final_status["completed_prerequisites_count"] == 3
    assert final_status["progress_percentage"] == 100
    assert final_status["autopay_eligible"] is True
