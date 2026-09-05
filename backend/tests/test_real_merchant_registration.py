import pytest
import sqlite3
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.services.auth_service import auth_service, AuthService

client = TestClient(app)

def test_1_register_new_merchant_201():
    """Test 1: Register new merchant returns 201 Created and structured response."""
    unique_suffix = uuid.uuid4().hex[:8]
    payload = {
        "business_name": f"Nexus Tech {unique_suffix} Pvt Ltd",
        "email": f"founder_{unique_suffix}@nexustech.io",
        "password": "SecurePassword#2026",
        "gstin": "29AAAAA0000A1Z5"
    }

    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201, f"Expected 201 Created, got {response.status_code}: {response.text}"
    
    data = response.json()
    assert data["status"] == "ACTIVE"
    assert data["business_name"] == payload["business_name"]
    assert data["email"] == payload["email"].lower()
    assert data["merchant_id"].startswith("mer_")
    assert "access_token" in data
    assert len(data["access_token"]) > 20
    assert data["user"]["role"] == "merchant_owner"


def test_2_merchant_row_created_in_database():
    """Test 2: Verify rows are created in both merchants and users SQLite tables."""
    unique_suffix = uuid.uuid4().hex[:8]
    payload = {
        "business_name": f"Apex Retailers {unique_suffix}",
        "email": f"owner_{unique_suffix}@apexretail.com",
        "password": "ApexPassword123!",
        "gstin": "29AAAAA0000A1Z5"
    }

    reg_resp = client.post("/api/v1/auth/register", json=payload)
    assert reg_resp.status_code == 201
    data = reg_resp.json()
    created_merchant_id = data["merchant_id"]
    created_user_id = data["user"]["id"]

    # Directly inspect the SQLite database
    with auth_service._get_connection() as conn:
        cursor = conn.cursor()
        # Verify merchants table
        cursor.execute("SELECT * FROM merchants WHERE merchant_id = ?", (created_merchant_id,))
        m_row = cursor.fetchone()
        assert m_row is not None, "Merchant row must exist in merchants table"
        assert m_row["business_name"] == payload["business_name"]
        assert m_row["gstin"] == payload["gstin"]
        assert m_row["status"] == "ACTIVE"
        assert m_row["owner_user_id"] == created_user_id

        # Verify users table
        cursor.execute("SELECT * FROM users WHERE id = ?", (created_user_id,))
        u_row = cursor.fetchone()
        assert u_row is not None, "User row must exist in users table"
        assert u_row["email"] == payload["email"].lower()
        assert u_row["role_id"] == "role_merchant_owner"
        # Verify password is NOT stored as plain text
        assert u_row["password_hash"] != payload["password"]
        assert len(u_row["password_hash"]) == 64  # SHA256 hex length
        assert u_row["hashed_password"] == u_row["password_hash"]


def test_3_login_with_new_credentials():
    """Test 3: Verify POST /api/v1/auth/login works for newly registered merchant."""
    unique_suffix = uuid.uuid4().hex[:8]
    email = f"ceo_{unique_suffix}@solarex.in"
    password = "SolarExStrongPassword99"

    reg_payload = {
        "business_name": f"SolarEx Energy {unique_suffix}",
        "email": email,
        "password": password,
        "gstin": "29AAAAA0000A1Z5"
    }
    reg_resp = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_resp.status_code == 201

    # Attempt login with the new credentials
    login_resp = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": password
    })
    assert login_resp.status_code == 200, f"Expected 200, got {login_resp.status_code}: {login_resp.text}"
    login_data = login_resp.json()
    assert "access_token" in login_data
    assert login_data["user"]["email"] == email.lower()
    assert login_data["user"]["role"] == "merchant_owner"
    assert login_data["user"]["role_id"] == "role_merchant_owner"


def test_4_dashboard_access():
    """Test 4: Merchant dashboard and profile endpoints accessible with newly registered merchant's token."""
    unique_suffix = uuid.uuid4().hex[:8]
    email = f"director_{unique_suffix}@zephyra.com"
    password = "ZephyraPass@2026"

    reg_resp = client.post("/api/v1/auth/register", json={
        "business_name": f"Zephyra Logistics {unique_suffix}",
        "email": email,
        "password": password
    })
    assert reg_resp.status_code == 201
    token = reg_resp.json()["access_token"]

    # Access /merchant/dashboard API
    headers = {"Authorization": f"Bearer {token}"}
    dash_resp = client.get("/api/v1/merchant/dashboard", headers=headers)
    assert dash_resp.status_code == 200, f"Dashboard access failed: {dash_resp.text}"

    # Access current user profile
    me_resp = client.get("/api/v1/auth/me", headers=headers)
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["email"] == email.lower()
    assert "MANAGE_CATALOG" in me_data["permissions"]


def test_5_duplicate_registration():
    """Test 5: Registering with an already registered email returns EMAIL_ALREADY_EXISTS (409)."""
    unique_suffix = uuid.uuid4().hex[:8]
    email = f"dup_{unique_suffix}@dupexample.com"

    first_payload = {
        "business_name": "First Instance Ltd",
        "email": email,
        "password": "Password123!"
    }
    resp1 = client.post("/api/v1/auth/register", json=first_payload)
    assert resp1.status_code == 201

    # Second registration with same email
    second_payload = {
        "business_name": "Second Instance Ltd",
        "email": email,
        "password": "AnotherPassword456!"
    }
    resp2 = client.post("/api/v1/auth/register", json=second_payload)
    assert resp2.status_code == 409
    err_body = resp2.json()
    assert err_body.get("success") is False
    assert err_body.get("error") == "EMAIL_ALREADY_EXISTS"


def test_validation_rules():
    """Test validation errors for empty business name, invalid email, weak password, invalid GSTIN."""
    # 1. Empty business name
    r1 = client.post("/api/v1/auth/register", json={
        "business_name": "   ",
        "email": f"test_{uuid.uuid4().hex[:6]}@domain.com",
        "password": "validPassword123"
    })
    assert r1.status_code == 400
    assert r1.json().get("error") == "EMPTY_BUSINESS_NAME"

    # 2. Invalid email format
    r2 = client.post("/api/v1/auth/register", json={
        "business_name": "Valid Corp",
        "email": "not-an-email",
        "password": "validPassword123"
    })
    assert r2.status_code == 400
    assert r2.json().get("error") == "INVALID_EMAIL_FORMAT"

    # 3. Weak password (< 6 characters)
    r3 = client.post("/api/v1/auth/register", json={
        "business_name": "Valid Corp",
        "email": f"test_{uuid.uuid4().hex[:6]}@domain.com",
        "password": "123"
    })
    assert r3.status_code == 400
    assert r3.json().get("error") == "WEAK_PASSWORD"

    # 4. Invalid GSTIN
    r4 = client.post("/api/v1/auth/register", json={
        "business_name": "Valid Corp",
        "email": f"test_{uuid.uuid4().hex[:6]}@domain.com",
        "password": "validPassword123",
        "gstin": "INVALID_GSTIN_123"
    })
    assert r4.status_code == 400
    assert r4.json().get("error") == "INVALID_GSTIN"


def test_seed_independence(tmp_path):
    """Test 9: System registers and authenticates new merchants without demo data seed."""
    test_db = str(tmp_path / "seedless_auth.db")
    
    # Instantiate custom AuthService that does NOT seed demo users
    class SeedlessAuthService(AuthService):
        def _seed_default_data(self):
            # Intentionally blank - zero demo data seeded
            pass

    service = SeedlessAuthService(db_path=test_db)
    
    # Confirm users table is empty
    with service._get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM users")
        assert cursor.fetchone()["count"] == 0

    # Register real merchant on the blank database
    resp = service.register_merchant(
        business_name="Seedless Organic Goods Pvt Ltd",
        email="founder@seedless.org",
        password="ProductionPassword#2026",
        gstin="29AAAAA0000A1Z5"
    )

    assert resp.status_code if hasattr(resp, "status_code") else resp.status == "ACTIVE"
    assert resp.merchant_id.startswith("mer_")
    assert resp.user.role == "merchant_owner"

    # Authenticate newly registered user on the seedless database
    auth_result = service.authenticate_user(
        email="founder@seedless.org",
        password="ProductionPassword#2026"
    )
    assert auth_result is not None
    assert auth_result.user.email == "founder@seedless.org"
    assert auth_result.user.role == "merchant_owner"
    assert "MANAGE_CATALOG" in auth_result.user.permissions
