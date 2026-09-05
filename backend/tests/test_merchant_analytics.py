import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.merchant_analytics_service import merchant_analytics_service

client = TestClient(app)

def test_merchant_analytics_service_structure():
    """Verify service returns all 7 required chart payloads and KPI summaries."""
    data = merchant_analytics_service.get_advanced_analytics(merchant_id="all", date_range="30d")
    
    assert "charts" in data
    assert "summary_kpis" in data
    assert "merchants" in data
    assert "active_filter" in data

    charts = data["charts"]
    # 1. Revenue Trend (Line Chart)
    assert "revenue_trend" in charts
    assert len(charts["revenue_trend"]) > 0
    assert "revenue" in charts["revenue_trend"][0]
    assert "target" in charts["revenue_trend"][0]

    # 2. Daily Orders (Bar Chart)
    assert "daily_orders" in charts
    assert len(charts["daily_orders"]) > 0
    assert "orders_count" in charts["daily_orders"][0]
    assert "units_sold" in charts["daily_orders"][0]

    # 3. Category Revenue (Pie Chart)
    assert "category_revenue" in charts
    assert len(charts["category_revenue"]) >= 3
    assert "percentage" in charts["category_revenue"][0]
    assert "value" in charts["category_revenue"][0]

    # 4. Top Selling Products (Horizontal Bar)
    assert "top_products" in charts
    assert len(charts["top_products"]) >= 3
    assert "sales_count" in charts["top_products"][0]
    assert "revenue" in charts["top_products"][0]

    # 5. Agent Orders vs Human Orders (Donut Chart)
    assert "agent_vs_human" in charts
    assert len(charts["agent_vs_human"]) == 2
    types = [item["name"] for item in charts["agent_vs_human"]]
    assert "Autonomous AI Agents" in types
    assert "Human Manual Shoppers" in types

    # 6. Revenue Forecast (Line Graph)
    assert "revenue_forecast" in charts
    assert len(charts["revenue_forecast"]) > 14
    forecast_item = next(p for p in charts["revenue_forecast"] if p["is_forecast"])
    assert "forecasted_revenue" in forecast_item
    assert "upper_bound" in forecast_item
    assert "lower_bound" in forecast_item

    # 7. Customer Lifetime Value (Histogram)
    assert "clv_histogram" in charts
    assert len(charts["clv_histogram"]) >= 5
    assert "customer_count" in charts["clv_histogram"][0]
    assert "avg_spend" in charts["clv_histogram"][0]

def test_merchant_drilldown_filtering():
    """Verify selecting a specific merchant adjusts metrics and product focus."""
    all_data = merchant_analytics_service.get_advanced_analytics(merchant_id="all", date_range="30d")
    acme_data = merchant_analytics_service.get_advanced_analytics(merchant_id="mcht_acme_pos", date_range="30d")

    # Acme is a subset of total platform revenue
    assert acme_data["summary_kpis"]["gross_revenue"] < all_data["summary_kpis"]["gross_revenue"]
    assert acme_data["active_filter"]["merchant_id"] == "mcht_acme_pos"

def test_date_range_filtering():
    """Verify different date ranges return corresponding intervals."""
    data_7d = merchant_analytics_service.get_advanced_analytics(merchant_id="all", date_range="7d")
    data_90d = merchant_analytics_service.get_advanced_analytics(merchant_id="all", date_range="90d")

    assert data_7d["active_filter"]["days_count"] == 7
    assert data_90d["active_filter"]["days_count"] == 90

def test_api_endpoint_advanced_analytics():
    """Verify HTTP GET /api/v1/merchant/growth/advanced-analytics endpoint."""
    response = client.get("/api/v1/merchant/growth/advanced-analytics?merchant_id=all&date_range=30d")
    assert response.status_code == 200
    res_json = response.json()
    assert "charts" in res_json
    assert "revenue_trend" in res_json["charts"]
    assert "agent_vs_human" in res_json["charts"]

def test_api_endpoint_merchant_list():
    """Verify HTTP GET /api/v1/merchant/growth/merchants endpoint."""
    response = client.get("/api/v1/merchant/growth/merchants")
    assert response.status_code == 200
    merchants = response.json()
    assert len(merchants) >= 5
    assert any(m["id"] == "mcht_acme_pos" for m in merchants)
