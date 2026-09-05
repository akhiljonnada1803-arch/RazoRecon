import pytest
import sqlite3
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.services.ai_autopay_service import ai_autopay_service

client = TestClient(app)

def test_new_customer_autopay_zero_state_isolation():
    """Test 1: Newly registered customer has zero-state AutoPay configuration."""
    unique_id = uuid.uuid4().hex[:8]
    register_payload = {
        "name": f"Onboarding Test {unique_id}",
        "email": f"onboarding_{unique_id}@test.com",
        "password": "SecurePassword123!",
        "organization_name": "Test Consumer"
    }

    reg_resp = client.post("/api/v1/auth/register-customer", json=register_payload)
    assert reg_resp.status_code == 201
    auth_data = reg_resp.json()
    token = auth_data["access_token"]
    user_id = auth_data["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Direct DB assertion before any endpoints touched
    with sqlite3.connect(ai_autopay_service.db_path) as conn:
        conn.row_factory = sqlite3.Row
        mandate_count = conn.execute(
            "SELECT count(*) as cnt FROM customer_mandates WHERE user_id = ?", (user_id,)
        ).fetchone()["cnt"]
        assert mandate_count == 0, "New customer must have 0 mandates in DB"

    # 2. Check /settings endpoint
    settings_resp = client.get("/api/v1/customer/autopay/settings", headers=headers)
    assert settings_resp.status_code == 200
    settings = settings_resp.json()

    assert settings["autopay_enabled"] is False, "AutoPay must start DISABLED"
    assert settings["monthly_budget"] is None, "Budget must start NULL"
    assert settings["max_single_purchase_limit"] is None, "Max single limit must start NULL"
    assert settings["purchase_mode"] == "RECOMMENDATION_ONLY", "Purchase mode must be RECOMMENDATION_ONLY"
    assert settings["is_configured"] is False, "New customer must be flagged is_configured=False"
    assert settings["spent_this_month"] == 0.0, "Spent this month must be 0"

    # 3. Check /dashboard endpoint
    dash_resp = client.get("/api/v1/customer/autopay/dashboard", headers=headers)
    assert dash_resp.status_code == 200
    dash_data = dash_resp.json()

    assert dash_data["autopay_status"] == "DISABLED"
    assert dash_data["active_mandates_count"] == 0
    assert len(dash_data["mandates"]) == 0
    assert len(dash_data["upcoming_recommendations"]) == 0
    assert dash_data["settings"]["monthly_budget"] is None
    assert dash_data["settings"]["is_configured"] is False

    # 4. Check /recommendations endpoint
    rec_resp = client.get("/api/v1/customer/autopay/recommendations", headers=headers)
    assert rec_resp.status_code == 200
    assert rec_resp.json() == [], "No recommendations should be seeded or auto-generated for new customers"

    # 5. Check direct recommendation generation gating
    gen_resp = client.post("/api/v1/customer/autopay/recommendations/generate", headers=headers)
    assert gen_resp.status_code == 200
    assert gen_resp.json() == [], "Recommendation generation must be blocked when mandate or history is missing"


def test_complete_autopay_setup_wizard_flow():
    """Test 2: Complete the 5-step onboarding wizard via API and verify transition."""
    unique_id = uuid.uuid4().hex[:8]
    register_payload = {
        "name": f"Wizard Customer {unique_id}",
        "email": f"wizard_{unique_id}@test.com",
        "password": "SecurePassword123!",
        "organization_name": "Wizard Consumer"
    }

    reg_resp = client.post("/api/v1/auth/register-customer", json=register_payload)
    assert reg_resp.status_code == 201
    auth_data = reg_resp.json()
    token = auth_data["access_token"]
    user_id = auth_data["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}

    # Step 1 & 2: Connect Mandate
    mandate_payload = {
        "type": "UPI_AUTOPAY",
        "bank_name": "HDFC Bank",
        "account_or_vpa": f"wizard_{unique_id}@okhdfcbank",
        "max_amount": 25000.0
    }
    m_resp = client.post("/api/v1/customer/autopay/mandates", json=mandate_payload, headers=headers)
    assert m_resp.status_code == 200 or m_resp.status_code == 201
    mandate = m_resp.json()
    assert mandate["status"] == "ACTIVE"
    assert mandate["bank_name"] == "HDFC Bank"

    # Step 3, 4, 5: Configure Spending Rules, Categories, Mode and Enable AutoPay
    settings_payload = {
        "monthly_budget": 20000.0,
        "max_single_purchase_limit": 4000.0,
        "allowed_categories": ["HARDWARE", "ACCESSORIES"],
        "merchant_trust_level": "VERIFIED_ONLY",
        "purchase_mode": "AUTO_BUY",
        "autopay_enabled": True
    }
    s_resp = client.put("/api/v1/customer/autopay/settings", json=settings_payload, headers=headers)
    assert s_resp.status_code == 200
    updated_settings = s_resp.json()
    assert updated_settings["autopay_enabled"] is True
    assert updated_settings["monthly_budget"] == 20000.0
    assert updated_settings["max_single_purchase_limit"] == 4000.0
    assert updated_settings["purchase_mode"] == "AUTO_BUY"
    assert updated_settings["is_configured"] is True

    # Verify Dashboard updates
    dash_resp = client.get("/api/v1/customer/autopay/dashboard", headers=headers)
    assert dash_resp.status_code == 200
    dash_data = dash_resp.json()
    assert dash_data["autopay_status"] == "ACTIVE"
    assert dash_data["active_mandates_count"] == 1
    assert dash_data["settings"]["monthly_budget"] == 20000.0
    assert dash_data["settings"]["is_configured"] is True


def test_demo_user_preserves_configuration():
    """Test 3: Demo customer usr_customer_demo retains active mandate and budget."""
    demo_dash = ai_autopay_service.get_dashboard_summary("usr_customer_demo")
    assert demo_dash["active_mandates_count"] >= 1, "Demo user must retain at least 1 mandate"
    assert demo_dash["settings"]["monthly_budget"] is not None, "Demo user must have budget set"
    assert demo_dash["settings"]["is_configured"] is True
