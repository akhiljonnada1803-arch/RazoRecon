import uuid
import sqlite3
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.encryption import payment_encryption_service, CIPHER_NAME, ENCRYPTION_PREFIX
from app.services.ai_autopay_service import ai_autopay_service, DB_PATH
from app.services.customer_order_service import customer_order_service

client = TestClient(app)

def test_1_encryption_service_core():
    """Test 1: Core AES-256 encryption, decryption, and masking logic."""
    raw_vpa = "customer_vip@okhdfcbank"
    encrypted = payment_encryption_service.encrypt(raw_vpa)

    assert encrypted != raw_vpa
    assert encrypted.startswith(ENCRYPTION_PREFIX)
    assert payment_encryption_service.is_encrypted(encrypted) is True

    # Decrypt restores original
    decrypted = payment_encryption_service.decrypt(encrypted)
    assert decrypted == raw_vpa

    # Idempotent encryption: encrypting an already-encrypted string does not double-encrypt
    double_encrypted = payment_encryption_service.encrypt(encrypted)
    assert double_encrypted == encrypted

    # Legacy fallback: unencrypted string decrypts to itself
    legacy = "plain_user@upi"
    assert payment_encryption_service.decrypt(legacy) == legacy

    # Masking
    masked_upi = payment_encryption_service.mask_identifier(raw_vpa, "UPI")
    assert "@okhdfcbank" in masked_upi
    assert "***" in masked_upi

    masked_card = payment_encryption_service.mask_identifier("4111222233334567", "CARD")
    assert "4567" in masked_card
    assert "••••" in masked_card


def test_2_customer_mandate_encrypted_at_rest():
    """Test 2: Ensure that connecting a mandate encrypts sensitive tokens and VPAs in SQLite."""
    user_id = f"usr_test_enc_{uuid.uuid4().hex[:8]}"
    raw_vpa = f"test_{uuid.uuid4().hex[:6]}@okicici"
    raw_token = f"tok_secret_mandate_{uuid.uuid4().hex[:12]}"

    mandate = ai_autopay_service.add_mandate(user_id=user_id, data={
        "type": "UPI_AUTOPAY",
        "bank_name": "ICICI Bank",
        "account_or_vpa": raw_vpa,
        "mandate_token": raw_token,
        "max_amount": 15000.0
    })

    assert mandate["is_encrypted"] is True
    assert mandate["encryption_cipher"] == CIPHER_NAME
    assert mandate["status"] == "ACTIVE"

    # DIRECT DATABASE INSPECTION AT REST:
    # Must prove that SQLite stores ciphertext and NOT raw_vpa or raw_token in plaintext!
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT mandate_token, bank_or_vpa, is_encrypted, encryption_cipher FROM customer_mandates WHERE id = ?", (mandate["id"],))
        row = dict(cur.fetchone())

        # Verify DB column values at rest
        assert row["is_encrypted"] == 1
        assert row["encryption_cipher"] == CIPHER_NAME
        assert row["mandate_token"].startswith(ENCRYPTION_PREFIX)
        assert row["bank_or_vpa"].startswith(ENCRYPTION_PREFIX)
        assert raw_vpa not in row["bank_or_vpa"]
        assert raw_token not in row["mandate_token"]

        # Verify decryption restores the exact raw data
        assert payment_encryption_service.decrypt(row["bank_or_vpa"]) == raw_vpa
        assert payment_encryption_service.decrypt(row["mandate_token"]) == raw_token


def test_3_customer_saved_payment_methods_crud_encrypted():
    """Test 3: Customer saved card / payment method storage is encrypted at rest."""
    user_id = f"usr_saved_pm_{uuid.uuid4().hex[:8]}"
    raw_card = "4242987654321098"

    # Add saved card
    pm = customer_order_service.add_saved_payment_method(user_id=user_id, data={
        "payment_method_type": "CARD",
        "bank_name": "Axis Bank",
        "nickname": "Axis Business Credit",
        "card_number": raw_card,
        "name_on_card": "Enterprise Ops",
        "expiry_month": "09",
        "expiry_year": "2029",
        "is_default": True
    })

    assert pm["is_encrypted"] is True
    assert pm["is_default"] is True
    assert "1098" in pm["masked_identifier"]
    assert raw_card not in pm["masked_identifier"]

    # DIRECT DATABASE VERIFICATION AT REST:
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT encrypted_data, is_encrypted, encryption_cipher FROM customer_saved_payment_methods WHERE id = ?", (pm["id"],))
        db_row = dict(cur.fetchone())

        assert db_row["is_encrypted"] == 1
        assert db_row["encryption_cipher"] == CIPHER_NAME
        assert db_row["encrypted_data"].startswith(ENCRYPTION_PREFIX)
        assert raw_card not in db_row["encrypted_data"]

        # Verify decrypted payload
        decrypted_dict = payment_encryption_service.decrypt_json_payload(db_row["encrypted_data"])
        assert decrypted_dict["raw_identifier"] == raw_card
        assert decrypted_dict["bank_name"] == "Axis Bank"

    # Retrieve via API / service
    saved_list = customer_order_service.get_saved_payment_methods(user_id)
    assert len(saved_list) >= 1
    target = next((item for item in saved_list if item["id"] == pm["id"]), None)
    assert target is not None
    assert target["is_encrypted"] is True
    assert "1098" in target["masked_identifier"]


def test_4_onboarding_payment_with_encryption():
    """Test 4: Onboarding payment API step confirms encrypted storage."""
    unique_id = uuid.uuid4().hex[:8]
    reg_resp = client.post("/api/v1/auth/register-customer", json={
        "name": f"Secure User {unique_id}",
        "email": f"secure_{unique_id}@test.com",
        "password": "SecurePassword123!"
    })
    assert reg_resp.status_code in [200, 201]
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Step 1: Address
    client.post("/api/v1/customer/onboarding/address", json={
        "full_name": "Secure User",
        "phone": "+91 98765 43210",
        "address_line1": "789 Cyber Security Towers",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pincode": "560100"
    }, headers=headers)

    # Step 2: Payment with UPI AutoPay
    raw_vpa = f"secure_{unique_id}@okaxis"
    pay_resp = client.post("/api/v1/customer/onboarding/payment", json={
        "type": "UPI_AUTOPAY",
        "bank_name": "Axis Bank",
        "account_or_vpa": raw_vpa,
        "max_amount": 30000.0
    }, headers=headers)

    assert pay_resp.status_code == 200
    data = pay_resp.json()
    assert data["onboarding_status"]["has_payment_method"] is True
    assert data["mandate"]["is_encrypted"] is True

    # List saved payment methods endpoint
    pms_resp = client.get("/api/v1/customer/payment-methods", headers=headers)
    assert pms_resp.status_code == 200
    pms = pms_resp.json()
    assert len(pms) >= 1
    assert pms[0]["is_encrypted"] is True
    assert raw_vpa not in pms[0]["masked_identifier"]
