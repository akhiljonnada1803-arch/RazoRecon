import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_merchant_growth():
    print("\n--- 1. TESTING UPSELL & CROSS-SELL ENGINE ---")
    r = requests.get(f"{BASE_URL}/api/v1/merchant/growth/upsell-cross-sell")
    assert r.status_code == 200, f"Failed: {r.status_code} {r.text}"
    data = r.json()
    assert "frequently_bought_together" in data
    assert "bundles" in data
    assert "cross_sell_opportunities" in data
    assert "upsell_suggestions" in data
    print(f"Upsell Engine PASS: {len(data['frequently_bought_together'])} FBT pairs, {len(data['bundles'])} bundles, predicted lift: INR {data['summary']['total_predicted_monthly_revenue_lift_inr']}")

    print("\n--- 2. TESTING AGENT ANALYTICS ---")
    r = requests.get(f"{BASE_URL}/api/v1/merchant/growth/agent-analytics")
    assert r.status_code == 200, f"Failed: {r.status_code} {r.text}"
    data = r.json()
    assert "overview" in data
    assert "revenue_split_history" in data
    assert "top_ai_purchased_products" in data
    assert "autopay_performance" in data
    print(f"Agent Analytics PASS: AI Order Share {data['overview']['ai_order_share_pct']}%, AutoPay Success {data['overview']['autopay_success_rate_pct']}%, Conversion Multiplier {data['overview']['conversion_multiplier']}x")

    print("\n--- 3. TESTING CUSTOMER INTELLIGENCE ---")
    r = requests.get(f"{BASE_URL}/api/v1/merchant/growth/customer-intelligence")
    assert r.status_code == 200, f"Failed: {r.status_code} {r.text}"
    data = r.json()
    assert "metrics" in data
    assert "clv_distribution" in data
    assert "retention_cohorts" in data
    assert "vip_customers" in data
    print(f"Customer Intelligence PASS: {data['metrics']['total_active_customers']} Active Customers, Repeat Rate {data['metrics']['repeat_purchase_rate_pct']}%, VIP Count {len(data['vip_customers'])}")

    print("\n--- 4. TESTING REVENUE DASHBOARD ---")
    r = requests.get(f"{BASE_URL}/api/v1/merchant/growth/revenue-dashboard")
    assert r.status_code == 200, f"Failed: {r.status_code} {r.text}"
    data = r.json()
    assert "kpis" in data
    assert "hourly_velocity_today" in data
    assert "monthly_trend" in data
    assert "payment_channel_breakdown" in data
    print(f"Revenue Dashboard PASS: Rev Today INR {data['kpis']['revenue_today_inr']}, AI Rev % {data['kpis']['ai_commerce_revenue_pct']}%, MTD INR {data['kpis']['revenue_mtd_inr']}")

    print("\n--- 5. TESTING CAMPAIGN MANAGER ---")
    r = requests.get(f"{BASE_URL}/api/v1/merchant/growth/campaigns")
    assert r.status_code == 200, f"Failed: {r.status_code} {r.text}"
    data = r.json()
    assert "campaigns" in data
    print(f"Campaigns List PASS: {len(data['campaigns'])} Campaigns, ROI Multiplier {data['summary']['blended_roi_multiplier']}x")

    # Launch a new test campaign
    launch_res = requests.post(f"{BASE_URL}/api/v1/merchant/growth/campaigns/launch", json={
        "title": "Weekend Flash Hardware AI Discount",
        "goal": "Immediate GMV Burst",
        "discount_offer": "₹2,000 Flat OFF POS Terminals",
        "channels": ["WhatsApp AutoPay Push", "SMS"]
    })
    assert launch_res.status_code == 200
    camp_id = launch_res.json()["campaign"]["id"]
    print(f"Launch Campaign PASS: Created {camp_id}")

    # Toggle status
    toggle_res = requests.post(f"{BASE_URL}/api/v1/merchant/growth/campaigns/{camp_id}/toggle", json={"status": "PAUSED"})
    assert toggle_res.status_code == 200
    print(f"Toggle Campaign PASS: New status {toggle_res.json()['campaign']['status']}")

    print("\n--- 6. TESTING AGENT READINESS SCORE ---")
    r = requests.get(f"{BASE_URL}/api/v1/merchant/growth/agent-readiness")
    assert r.status_code == 200, f"Failed: {r.status_code} {r.text}"
    data = r.json()
    assert "overall_score" in data
    assert "dimensions" in data
    print(f"Agent Readiness PASS: Overall Score {data['overall_score']}/100, Status: {data['status']}")

    # Auto Optimize
    opt_res = requests.post(f"{BASE_URL}/api/v1/merchant/growth/agent-readiness/optimize")
    assert opt_res.status_code == 200
    print(f"Optimize Readiness PASS: New Score {opt_res.json()['readiness']['overall_score']}/100")

    print("\n=======================================================")
    print("ALL 6 AI COMMERCE GROWTH OS BACKEND ENDPOINTS PASSED!")
    print("=======================================================")

if __name__ == "__main__":
    try:
        test_merchant_growth()
    except Exception as e:
        print(f"TEST FAILED: {e}")
        sys.exit(1)
