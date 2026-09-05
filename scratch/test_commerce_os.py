import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_commerce_operating_system():
    print("==================================================================")
    print("  TESTING AI COMMERCE OPERATING SYSTEM - 4 CORE MODULES")
    print("==================================================================")

    # 1. Module 1: Commerce Transaction Engine & 7 Lifecycle Stages
    print("\n--- [Module 1] Commerce Transaction Engine ---")
    res = requests.get(f"{BASE_URL}/reconciliation")
    print("GET /reconciliation Status:", res.status_code)
    assert res.status_code == 200
    data = res.json()
    summary = data.get("summary", {})
    print(f"Total GMV: INR {summary.get('total_gmv_inr', 0):,.2f}")
    print(f"Agent Purchases %: {summary.get('agent_purchases_pct')}%")
    print(f"Lifecycle Breakdown: {summary.get('lifecycle_breakdown')}")

    res_txns = requests.get(f"{BASE_URL}/reconciliation/commerce-transactions")
    print("GET /reconciliation/commerce-transactions Status:", res_txns.status_code)
    assert res_txns.status_code == 200
    txns = res_txns.json().get("transactions", [])
    print(f"Loaded {len(txns)} full commerce transactions with timelines.")
    first_txn = txns[0]
    print(f"Sample Txn: {first_txn['order_id']} | {first_txn['customer_name']} | {first_txn['lifecycle_stage']} | {first_txn['payment_method']}")
    assert len(first_txn.get("timeline", [])) > 0

    # 2. Module 2: Commerce Exception Center
    print("\n--- [Module 2] Commerce Exception Center ---")
    res_exc = requests.get(f"{BASE_URL}/exceptions")
    print("GET /exceptions Status:", res_exc.status_code)
    assert res_exc.status_code == 200
    exc_data = res_exc.json()
    exc_summary = exc_data.get("summary", {})
    print(f"Total Exceptions: {exc_summary.get('total_exceptions')} | Exposure: INR {exc_summary.get('total_exposure_amount', 0):,.2f}")
    print(f"Categories: {list(exc_summary.get('by_category', {}).keys())}")
    
    # Test resolution
    res_resolve = requests.post(f"{BASE_URL}/exceptions/EXC-2026-001/resolve", json={
        "exception_id": "EXC-2026-001",
        "resolution_action": "Re-issue Dynamic Razorpay Payment Link"
    })
    print("POST /exceptions/EXC-2026-001/resolve Status:", res_resolve.status_code)
    assert res_resolve.status_code == 200

    # 3. Module 3: Merchant & Buyer Intelligence
    print("\n--- [Module 3] Merchant & Buyer Intelligence ---")
    res_intel = requests.get(f"{BASE_URL}/vendor-risk")
    print("GET /vendor-risk Status:", res_intel.status_code)
    assert res_intel.status_code == 200
    intel_data = res_intel.json()
    merchant = intel_data.get("merchant_intelligence", {})
    buyer = intel_data.get("buyer_intelligence", {})
    print(f"Merchant Run-Rate: INR {merchant.get('revenue_runrate_inr', 0):,.2f} | SLA: {merchant.get('fulfillment_score')}%")
    print(f"Buyer Base: {buyer.get('total_buyers_count')} buyers | Avg LTV: INR {buyer.get('avg_ltv_inr', 0):,.2f}")
    print(f"Buying Patterns: {len(buyer.get('buying_patterns', []))} channels tracked.")

    # 4. Module 4: Commerce AI Copilot
    print("\n--- [Module 4] Commerce AI Copilot ---")
    res_copilot = requests.post(f"{BASE_URL}/copilot/query", json={
        "messages": [
            {"role": "user", "content": "Analyze our 30-day sales and GMV velocity"}
        ]
    })
    print("POST /copilot/query (Merchant Sales) Status:", res_copilot.status_code)
    assert res_copilot.status_code == 200
    copilot_answer = res_copilot.json().get("answer", "")
    print("Copilot Answer Snippet:", copilot_answer[:120].replace("₹", "INR "), "...")

    res_copilot_cust = requests.post(f"{BASE_URL}/copilot/query", json={
        "messages": [
            {"role": "user", "content": "Find titanium smartwatch products"}
        ]
    })
    print("POST /copilot/query (Customer Discovery) Status:", res_copilot_cust.status_code)
    assert res_copilot_cust.status_code == 200

    print("\n==================================================================")
    print("  ALL 4 CORE MODULES VERIFIED SUCCESSFULLY & 100% OPERATIONAL!")
    print("==================================================================")

if __name__ == "__main__":
    test_commerce_operating_system()
