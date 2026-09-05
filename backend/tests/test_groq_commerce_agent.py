import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.services.groq_service import GroqService, groq_service
from app.services.commerce_service import commerce_service

client = TestClient(app)


def test_groq_service_unconfigured_fallback():
    """When GROQ_API_KEY is unset or empty, service reports unconfigured and returns None."""
    svc = GroqService()
    with patch.dict("os.environ", {"GROQ_API_KEY": ""}):
        assert svc.is_configured() is False
        res = svc.generate_commerce_response(query="I need a POS terminal under 20000")
        assert res is None


def test_groq_service_success_with_model():
    """When GROQ_API_KEY is present, calls Groq API using configured model openai/gpt-oss-120b."""
    svc = GroqService()
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "choices": [
            {
                "message": {
                    "content": "Here is my tailored recommendation for your POS terminal with instant AutoPay settlement!"
                }
            }
        ]
    }

    with patch.dict("os.environ", {"GROQ_API_KEY": "gsk_test_mock_key_12345", "GROQ_MODEL": "openai/gpt-oss-120b"}):
        with patch("httpx.Client.post", return_value=mock_response) as mock_post:
            res = svc.generate_commerce_response(
                query="Find best POS machine",
                products=commerce_service.products[:3]
            )
            assert res is not None
            assert "tailored recommendation" in res
            assert mock_post.called
            called_payload = mock_post.call_args[1]["json"]
            assert called_payload["model"] == "openai/gpt-oss-120b"


def test_groq_service_graceful_error_handling():
    """If Groq returns 500 or network timeout, service catches error and returns None for local fallback."""
    svc = GroqService()
    mock_response = MagicMock()
    mock_response.status_code = 500
    mock_response.text = "Internal Server Error"

    with patch.dict("os.environ", {"GROQ_API_KEY": "gsk_test_mock_key_12345"}):
        with patch("httpx.Client.post", return_value=mock_response):
            res = svc.generate_commerce_response(query="Recommend laptop")
            assert res is None


def test_commerce_chat_endpoint_with_groq_integration():
    """End-to-end test verifying /api/v1/commerce/chat uses Groq output when available."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "choices": [
            {
                "message": {
                    "content": "🤖 **Groq LLM Shopping Assistant**: Razorpay Smart POS Terminal V3 Pro is your top choice for high throughput retail."
                }
            }
        ]
    }

    with patch.dict("os.environ", {"GROQ_API_KEY": "gsk_test_mock_key_12345", "GROQ_MODEL": "openai/gpt-oss-120b"}):
        with patch("httpx.Client.post", return_value=mock_response):
            resp = client.post("/api/v1/commerce/chat", json={"query": "Recommend POS machine"})
            assert resp.status_code == 200
            data = resp.json()
            assert "Groq LLM Shopping Assistant" in data["message"]
            assert len(data["recommended_products"]) > 0
            assert data["comparison_data"] is not None


def test_commerce_chat_unconnected_autopay_blocks_autonomous_purchase_and_adds_to_cart():
    """When user without connected AutoPay/mandate replies 'yes' or asks to buy, agent blocks autonomous purchase, adds to cart, and provides checkout link."""
    prev_assistant_message = {
        "role": "assistant",
        "content": "⚠️ AutoPay Purchase Limit Check:\n• Product Price: ₹14,999.00\nThis purchase exceeds your configured AutoPay limits. Would you like to authorize this manually or complete checkout?",
        "flow_step": "APPROVAL_REQUIRED",
        "requires_approval": True,
        "selected_product": {
            "id": "prod_pos_smart_v3",
            "name": "Razorpay Smart POS Terminal V3 Pro",
            "price": 14999.0,
            "category": "Payment Terminals"
        },
        "selected_address": {
            "address_line": "123 Tech Park Alpha",
            "city": "Bengaluru",
            "state": "Karnataka",
            "pincode": "560100"
        }
    }

    # User without connected mandate replies 'yes' or asks to buy
    resp = client.post("/api/v1/commerce/chat", json={
        "query": "yes",
        "history": [prev_assistant_message]
    })
    assert resp.status_code == 200
    data = resp.json()
    
    # Must NOT complete autonomous purchase
    assert data["flow_step"] == "MANDATE_REQUIRED"
    assert data["action_triggered"] == "add_to_cart"
    assert "AutoPay Mandate Not Connected" in data["message"]
    assert "I have added Razorpay Smart POS Terminal V3 Pro" in data["message"]
    assert data["checkout_link"] is not None
    assert "/checkout" in data["checkout_link"]
    # Cart must have item added
    assert data["cart"] is not None
    assert any(i["product_id"] == "prod_pos_smart_v3" for i in data["cart"]["items"])


def test_commerce_chat_direct_buy_intent_without_mandate():
    """When customer says 'buy it' or 'confirm purchase' without connected mandate, agent adds to cart with checkout link."""
    prev_assistant_message = {
        "role": "assistant",
        "content": "Here are your recommendations",
        "flow_step": "TOP_RECOMMENDATIONS",
        "recommended_products": [
            {
                "id": "prod_pos_smart_v3",
                "name": "Razorpay Smart POS Terminal V3 Pro",
                "price": 14999.0,
                "category": "Payment Terminals"
            }
        ]
    }

    resp = client.post("/api/v1/commerce/chat", json={
        "query": "buy it",
        "history": [prev_assistant_message]
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["flow_step"] == "MANDATE_REQUIRED"
    assert data["action_triggered"] == "add_to_cart"
    assert "AutoPay Mandate Not Connected" in data["message"]
    assert data["checkout_link"] is not None
    assert any(i["product_id"] == "prod_pos_smart_v3" for i in data["cart"]["items"])


def test_commerce_chat_connected_autopay_executes_autonomous_purchase():
    """When customer WITH connected AutoPay mandate authorizes the order, it places order autonomously."""
    from app.services.auth_service import auth_service
    from app.services.ai_autopay_service import ai_autopay_service
    user = auth_service.list_users()[0]
    token = auth_service._generate_jwt(user)

    from app.services.customer_order_service import customer_order_service
    customer_order_service.add_address(user.id, {
        "full_name": "Test Customer",
        "phone": "+91 98765 43210",
        "address_line1": "123 Tech Park Alpha",
        "address_line2": "Outer Ring Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pincode": "560100",
        "is_default": 1
    })

    # Ensure user has connected mandate and enabled AutoPay
    ai_autopay_service.add_mandate(user.id, {
        "type": "UPI_AUTOPAY",
        "bank_name": "HDFC Bank",
        "account_or_vpa": "testuser@okhdfcbank",
        "max_amount": 50000.0
    })
    ai_autopay_service.update_settings(user.id, {
        "autopay_enabled": 1,
        "monthly_budget": 50000.0,
        "spent_this_month": 0.0,
        "max_single_purchase_limit": 25000.0
    })

    prev_assistant_message = {
        "role": "assistant",
        "content": "⚠️ AutoPay Purchase Limit Check",
        "flow_step": "APPROVAL_REQUIRED",
        "requires_approval": True,
        "selected_product": {
            "id": "prod_pos_smart_v3",
            "name": "Razorpay Smart POS Terminal V3 Pro",
            "price": 14999.0,
            "category": "Payment Terminals"
        },
        "selected_address": {
            "address_line": "123 Tech Park Alpha",
            "city": "Bengaluru",
            "state": "Karnataka",
            "pincode": "560100"
        }
    }

    resp = client.post(
        "/api/v1/commerce/chat",
        json={"query": "yes", "history": [prev_assistant_message]},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["flow_step"] == "AUTONOMOUS_PURCHASE"
    assert "Approved & Placed Successfully" in data["message"]


def test_commerce_chat_user_replies_no_to_cancel():
    """When user replies 'no' or 'cancel' to an approval prompt, it cleanly cancels."""
    prev_assistant_message = {
        "role": "assistant",
        "content": "⚠️ AutoPay Purchase Limit Check",
        "flow_step": "APPROVAL_REQUIRED",
        "requires_approval": True
    }

    resp = client.post("/api/v1/commerce/chat", json={
        "query": "no",
        "history": [prev_assistant_message]
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["flow_step"] == "CANCELLED"
    assert "Cancelled" in data["message"]


def test_commerce_chat_merchant_added_product_discovery_and_purchase():
    """When a merchant adds a new product in catalog.db, agent can discover it and recommend it."""
    resp = client.post("/api/v1/commerce/chat", json={
        "query": "i need samsung s26 5g"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["recommended_products"]) > 0
    top_p = data["recommended_products"][0]
    assert "Samsung S26" in top_p["name"]
    assert top_p["price"] == 79900.0


