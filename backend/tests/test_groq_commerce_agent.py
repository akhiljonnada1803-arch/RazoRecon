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


def test_commerce_chat_user_replies_yes_to_approval_prompt():
    """When user replies with 'yes' to an APPROVAL_REQUIRED limit check, it executes order instead of showing products again."""
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

    # User simply replies 'yes'
    resp = client.post("/api/v1/commerce/chat", json={
        "query": "yes",
        "history": [prev_assistant_message]
    })
    assert resp.status_code == 200
    data = resp.json()
    # It must NOT search the catalog for 'yes' and show recommendations again!
    assert data["flow_step"] == "AUTONOMOUS_PURCHASE"
    assert "Approved & Placed Successfully" in data["message"]
    assert "Razorpay Smart POS Terminal V3 Pro" in data["message"]


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

