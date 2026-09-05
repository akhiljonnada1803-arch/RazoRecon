import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_copilot_zero_data_merchant():
    """Verify that a merchant with 0 products, 0 orders, and 0 customers receives the required zero-data response."""
    suffix = uuid.uuid4().hex[:8]
    reg = client.post("/api/v1/auth/register", json={
        "business_name": f"Empty Store {suffix}",
        "email": f"empty_{suffix}@testcorp.io",
        "password": "Password#123",
        "gstin": "29AAAAA0000A1Z5"
    }).json()
    mid = reg["merchant_id"]
    headers = {"Authorization": f"Bearer {reg['access_token']}", "x-merchant-id": mid}

    resp = client.post("/api/v1/copilot/query", json={
        "messages": [{"role": "user", "content": "How can I increase sales?"}],
        "merchant_id": mid
    }, headers=headers)

    assert resp.status_code == 200
    data = resp.json()
    assert "Insufficient business data available. Recommendations will become available after products, customers, and orders are created." in data["answer"]


def test_copilot_how_can_i_increase_sales():
    """
    Verify 'How can I increase sales?' response:
    - Mentions top-selling products (actual SKU, not mock).
    - Mentions low-selling / untapped products.
    - Mentions demand trends.
    - Mentions inventory risks.
    - Estimates potential revenue impact.
    - Contains 5 actionable insights (Revenue, Campaign, Inventory, Pricing, Upsell).
    - Displays confidence score.
    - Cites underlying metrics.
    - Never mentions mock SKUs like Sony XM5 or Apple iPad.
    """
    mid = "mer_5c9250207162"  # Sri Lakshmi Enterprises (has Samsung S26 orders)
    headers = {"x-merchant-id": mid}

    resp = client.post("/api/v1/copilot/query", json={
        "messages": [{"role": "user", "content": "How can I increase sales?"}],
        "merchant_id": mid
    }, headers=headers)

    assert resp.status_code == 200
    answer = resp.json()["answer"]

    # Must mention real product, NOT mock products
    assert "Samsung" in answer, "Must mention real product Samsung"
    assert "Sony XM5" not in answer, "Must not mention mock Sony XM5"
    assert "Apple iPad" not in answer, "Must not mention mock iPad"

    # Mentions demand trends and velocity
    assert "Demand Score" in answer or "Demand" in answer
    assert "Velocity" in answer or "units/day" in answer

    # Mentions inventory risk
    assert "days left" in answer.lower() or "stockout" in answer.lower()

    # Mentions revenue impact
    assert "Revenue Opportunity" in answer
    assert "₹" in answer

    # 5 Actionable Insights
    assert "Revenue Opportunity" in answer
    assert "Campaign Recommendation" in answer
    assert "Inventory Recommendation" in answer
    assert "Pricing Recommendation" in answer
    assert "Upsell Recommendation" in answer

    # Displays confidence score
    assert "Confidence Score" in answer
    assert "%" in answer

    # Cites underlying metric
    assert "Metric Citation" in answer or "[MTD GMV" in answer


def test_copilot_which_products_should_i_restock():
    """
    Verify 'Which products should I restock?' response:
    - Analyzes inventory velocity.
    - Analyzes recent orders.
    - Identifies stockout risk products.
    - Actionable insights, confidence score, metric citation.
    """
    mid = "mer_5c9250207162"
    headers = {"x-merchant-id": mid}

    resp = client.post("/api/v1/copilot/query", json={
        "messages": [{"role": "user", "content": "Which products should I restock?"}],
        "merchant_id": mid
    }, headers=headers)

    assert resp.status_code == 200
    answer = resp.json()["answer"]

    # Analyzes inventory velocity
    assert "units/day" in answer or "Velocity" in answer
    # Analyzes recent orders
    assert "orders" in answer.lower()
    # Identifies stockout risk
    assert "days" in answer.lower() or "stockout" in answer.lower()
    # Mentions actual product
    assert "Samsung" in answer

    # Confidence score & citations
    assert "Confidence Score" in answer
    assert "Metric Citation" in answer
    assert "Inventory Recommendation" in answer


def test_copilot_which_products_should_i_promote():
    """
    Verify 'Which products should I promote?' response:
    - Analyzes conversion rates.
    - Analyzes demand scores.
    - Recommends specific SKUs.
    - Actionable insights, confidence score, metric citation.
    """
    mid = "mer_5c9250207162"
    headers = {"x-merchant-id": mid}

    resp = client.post("/api/v1/copilot/query", json={
        "messages": [{"role": "user", "content": "Which products should I promote?"}],
        "merchant_id": mid
    }, headers=headers)

    assert resp.status_code == 200
    answer = resp.json()["answer"]

    # Analyzes conversion rate & demand score
    assert "Conversion" in answer or "%" in answer
    assert "Demand Score" in answer or "/100" in answer
    # Recommends real SKU
    assert "Samsung" in answer

    assert "Confidence Score" in answer
    assert "Campaign Recommendation" in answer
    assert "Metric Citation" in answer


def test_copilot_why_are_my_sales_down():
    """
    Verify 'Why are my sales down?' response:
    - Compares current period vs previous period.
    - Identifies declining SKUs or single-product concentration.
    - Identifies customer drop-off and repeat purchase rate.
    - Actionable insights, confidence score, metric citation.
    """
    mid = "mer_5c9250207162"
    headers = {"x-merchant-id": mid}

    resp = client.post("/api/v1/copilot/query", json={
        "messages": [{"role": "user", "content": "Why are my sales down?"}],
        "merchant_id": mid
    }, headers=headers)

    assert resp.status_code == 200
    answer = resp.json()["answer"]

    # Period comparison
    assert "Revenue" in answer or "Run-Rate" in answer
    # Customer drop-off / repeat rate
    assert "Repeat Purchase Rate" in answer or "Retention" in answer or "Customer" in answer

    assert "Confidence Score" in answer
    assert "Revenue Opportunity" in answer
    assert "Metric Citation" in answer
