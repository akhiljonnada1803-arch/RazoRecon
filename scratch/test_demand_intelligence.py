import urllib.request
import json
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:8000/api/v1"

def test_demand_intelligence_api():
    print("Testing GET /growth/demand-intelligence ...")
    req = urllib.request.Request(f"{BASE_URL}/growth/demand-intelligence")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode())
        summary = data["summary"]
        print(f"[OK] Summary: avg_score={summary['average_demand_score']}, tracked={summary['total_products_tracked']}, trending={summary['trending_count']}, declining={summary['declining_count']}, dead={summary['dead_inventory_count']}")
        assert len(data["products"]) > 0
        assert len(data["autonomous_campaigns"]) > 0
        assert len(data["growth_insights"]) > 0
        assert len(data["category_heatmap"]) > 0

def test_apply_discount_api():
    print("Testing POST /growth/discounts/apply ...")
    req_di = urllib.request.Request(f"{BASE_URL}/growth/demand-intelligence")
    with urllib.request.urlopen(req_di) as resp:
        di_data = json.loads(resp.read().decode())
        target_prod_id = di_data["products"][0]["id"]
    
    payload = json.dumps({"product_id": target_prod_id, "discount_pct": 10.0}).encode()
    req = urllib.request.Request(f"{BASE_URL}/growth/discounts/apply", data=payload, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        res = json.loads(resp.read().decode())
        print(f"[OK] Apply Discount Result for SKU '{target_prod_id}': {res['message']}")
        assert res["success"] is True

def test_copilot_demand_queries():
    print("Testing POST /copilot/query with demand intelligence queries ...")
    test_queries = [
        "Which products need discounts?",
        "What products are trending?",
        "Which inventory is at risk?",
        "How can I increase revenue this month?"
    ]
    for q in test_queries:
        payload = json.dumps({"messages": [{"role": "user", "content": q}]}).encode()
        req = urllib.request.Request(f"{BASE_URL}/copilot/query", data=payload, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req) as resp:
            assert resp.status == 200
            res = json.loads(resp.read().decode())
            print(f"\n--- Query: '{q}' ---")
            print(res["answer"][:180] + "...")
            assert len(res["answer"]) > 50

if __name__ == "__main__":
    test_demand_intelligence_api()
    test_apply_discount_api()
    test_copilot_demand_queries()
    print("\n[SUCCESS] ALL DEMAND INTELLIGENCE & COPILOT BACKEND TESTS PASSED 100%!")
