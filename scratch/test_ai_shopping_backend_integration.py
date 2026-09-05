import urllib.request
import json
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:8000"

def test_health_check():
    print("\n--- 1. Testing GET /api/health & /health ---")
    for path in ["/api/health", "/health", "/api/v1/health"]:
        req = urllib.request.Request(f"{BASE_URL}{path}")
        with urllib.request.urlopen(req) as resp:
            assert resp.status == 200
            data = json.loads(resp.read().decode())
            print(f"[OK] {path} -> {data}")
            assert data.get("status") == "healthy"

def test_customer_autopay_endpoints():
    print("\n--- 2. Testing Customer AutoPay Endpoints ---")
    endpoints = [
        "/api/v1/customer/autopay",
        "/customer/autopay",
        "/api/customer/autopay",
        "/api/v1/customer/autopay/one-click-buy"
    ]
    payload = json.dumps({
        "product_id": "prod_soundbox_4g",
        "quantity": 1,
        "user_id": "usr_customer_demo",
        "reason": "Test Automated AutoPay Checkout"
    }).encode()

    for ep in endpoints:
        req = urllib.request.Request(
            f"{BASE_URL}{ep}",
            data=payload,
            headers={"Content-Type": "application/json", "Origin": "http://localhost:3000"}
        )
        with urllib.request.urlopen(req) as resp:
            assert resp.status == 200
            data = json.loads(resp.read().decode())
            print(f"[OK] POST {ep} -> Status: {data.get('status')}, Order ID: {data.get('order_id')}, Amount: ₹{data.get('amount')}")
            assert data.get("status") == "success" or data.get("success") is True
            assert data.get("order_id") is not None
            assert "payment_method" in data

    # Test over-budget guardrail returns 400 (not 500)
    print("Testing AutoPay monthly budget exceeding guardrail (should return 400)...")
    over_budget_payload = json.dumps({
        "product_id": "prod_pos_smart_v3",
        "quantity": 10, # ₹1,49,990 exceeds limit
        "user_id": "usr_customer_demo",
        "reason": "Test Over Budget Purchase"
    }).encode()
    req_over = urllib.request.Request(
        f"{BASE_URL}/api/v1/customer/autopay",
        data=over_budget_payload,
        headers={"Content-Type": "application/json", "Origin": "http://localhost:3000"}
    )
    try:
        urllib.request.urlopen(req_over)
        assert False, "Should have thrown 400"
    except urllib.error.HTTPError as he:
        assert he.code == 400
        print(f"[OK] Over-budget guardrail successfully blocked with HTTP 400: {he.reason}")


def test_commerce_chat_endpoint():
    print("\n--- 3. Testing POST /api/v1/commerce/chat ---")
    test_cases = [
        {"desc": "Intent Discovery: Best POS", "payload": {"query": "Find the best POS machine"}},
        {"desc": "Intent Discovery: Laptop under 60k", "payload": {"query": "I need a laptop under ₹60,000"}},
        {"desc": "Empty Prompt Handling", "payload": {"query": ""}},
        {"desc": "Action: Select Product", "payload": {"query": "", "action": "select_product", "selected_product_id": "prod_pos_smart_v3"}},
        {"desc": "Action: Select Address", "payload": {"query": "", "action": "select_address", "selected_product_id": "prod_pos_smart_v3"}},
        {"desc": "Action: Confirm AutoPay Purchase", "payload": {"query": "", "action": "confirm_autopay_purchase", "selected_product_id": "prod_pos_smart_v3"}}
    ]

    for tc in test_cases:
        req = urllib.request.Request(
            f"{BASE_URL}/api/v1/commerce/chat",
            data=json.dumps(tc["payload"]).encode(),
            headers={"Content-Type": "application/json", "Origin": "http://localhost:3000"}
        )
        with urllib.request.urlopen(req) as resp:
            assert resp.status == 200
            data = json.loads(resp.read().decode())
            print(f"[OK] Chat Case '{tc['desc']}' -> Flow Step: {data.get('flow_step')}, Message len: {len(data.get('message', ''))}")
            assert len(data.get("message", "")) > 0

def test_product_comparison():
    print("\n--- 4. Testing POST /api/v1/commerce/compare ---")
    payload = json.dumps({"product_ids": ["prod_pos_smart_v3", "prod_pos_v2_lite", "prod_pos_mini_qr"]}).encode()
    req = urllib.request.Request(
        f"{BASE_URL}/api/v1/commerce/compare",
        data=payload,
        headers={"Content-Type": "application/json", "Origin": "http://localhost:3000"}
    )
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode())
        print(f"[OK] Comparison Matrix -> {len(data.get('products', []))} products compared, {len(data.get('attributes', []))} attributes evaluated.")
        assert len(data.get("products", [])) >= 2
        assert len(data.get("attributes", [])) >= 4

def test_cors_preflight_and_headers():
    print("\n--- 5. Testing CORS Preflight & Headers ---")
    req = urllib.request.Request(
        f"{BASE_URL}/api/v1/commerce/chat",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type"
        },
        method="OPTIONS"
    )
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        allow_origin = resp.headers.get("access-control-allow-origin")
        print(f"[OK] Preflight OPTIONS CORS Header -> access-control-allow-origin: {allow_origin}")
        assert allow_origin is not None

if __name__ == "__main__":
    test_health_check()
    test_customer_autopay_endpoints()
    test_commerce_chat_endpoint()
    test_product_comparison()
    test_cors_preflight_and_headers()
    print("\n" + "="*70)
    print("ALL BACKEND INTEGRATION, CORS, AUTOPAY & CHAT TESTS PASSED 100%!")
    print("="*70)
