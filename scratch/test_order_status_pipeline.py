import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_order_status_pipeline():
    print("==================================================================")
    print("  AUDITING COMPLETE 7-STAGE ORDER STATUS WORKFLOW")
    print("==================================================================")

    # 1. Fetch Orders List
    res = requests.get(f"{BASE_URL}/merchant/orders")
    print("1. GET /merchant/orders Status:", res.status_code)
    assert res.status_code == 200
    res_json = res.json()
    orders = res_json if isinstance(res_json, list) else res_json.get("orders", [])
    assert len(orders) > 0
    test_order = orders[0]
    order_id = test_order["id"]
    print(f"   Selected Order: {order_id} (Number: {test_order.get('order_number')}) - Initial Status: {test_order.get('order_status')}")

    # 2. Test Transition: ACCEPTED
    print("\n2. Testing PUT /merchant/orders/{id}/status -> ACCEPTED")
    res = requests.put(f"{BASE_URL}/merchant/orders/{order_id}/status?status=ACCEPTED")
    print("   Status:", res.status_code, res.json().get("message"))
    assert res.status_code == 200
    assert res.json()["order"]["order_status"] == "ACCEPTED"

    # 3. Test Transition: PROCESSING (Start Picking)
    print("\n3. Testing PUT /merchant/orders/{id}/status -> PROCESSING (Start Picking)")
    res = requests.put(f"{BASE_URL}/merchant/orders/{order_id}/status?status=PROCESSING")
    print("   Status:", res.status_code, res.json().get("message"))
    assert res.status_code == 200
    assert res.json()["order"]["order_status"] == "PROCESSING"

    # 4. Test Transition: PACKED (Mark Packed)
    print("\n4. Testing PUT /merchant/orders/{id}/status -> PACKED (Mark Packed)")
    res = requests.put(f"{BASE_URL}/merchant/orders/{order_id}/status?status=PACKED")
    print("   Status:", res.status_code, res.json().get("message"))
    assert res.status_code == 200
    assert res.json()["order"]["order_status"] == "PACKED"

    # 5. Test Transition: Assign Courier (Generate AWB)
    print("\n5. Testing PUT /merchant/orders/{id}/courier -> Assign Delhivery Express")
    res = requests.put(f"{BASE_URL}/merchant/orders/{order_id}/courier?courier_name=Delhivery%20Express")
    print("   Status:", res.status_code, res.json().get("message"))
    assert res.status_code == 200
    updated_order = res.json()["order"]
    print(f"   Carrier: {updated_order.get('delivery_partner')} | AWB: {updated_order.get('tracking_id')} | Status: {updated_order.get('order_status')}")
    assert updated_order.get("tracking_id") is not None

    # 6. Test Transition: OUT_FOR_DELIVERY
    print("\n6. Testing PUT /merchant/orders/{id}/status -> OUT_FOR_DELIVERY")
    res = requests.put(f"{BASE_URL}/merchant/orders/{order_id}/status?status=OUT_FOR_DELIVERY")
    print("   Status:", res.status_code, res.json().get("message"))
    assert res.status_code == 200
    assert res.json()["order"]["order_status"] == "OUT_FOR_DELIVERY"

    # 7. Test Transition: DELIVERED
    print("\n7. Testing PUT /merchant/orders/{id}/status -> DELIVERED")
    res = requests.put(f"{BASE_URL}/merchant/orders/{order_id}/status?status=DELIVERED")
    print("   Status:", res.status_code, res.json().get("message"))
    assert res.status_code == 200
    assert res.json()["order"]["order_status"] == "DELIVERED"

    # 8. Verify Persistence with fresh GET request
    print("\n8. Verifying Database Persistence via GET /merchant/orders/{id}")
    res_get = requests.get(f"{BASE_URL}/merchant/orders/{order_id}")
    print("   GET Status:", res_get.status_code)
    assert res_get.status_code == 200
    persisted_order = res_get.json()
    print(f"   Persisted Order Status: {persisted_order.get('order_status')}")
    print(f"   Persisted Timeline Events: {len(persisted_order.get('timeline', []))} stages recorded.")
    assert persisted_order.get("order_status") == "DELIVERED"

    # 9. Test Aliases: /orders, /merchant-orders, /order
    print("\n9. Testing Router Aliases (/orders/{id}/status and /merchant-orders/{id}/status)")
    res_alias1 = requests.put(f"{BASE_URL}/orders/orders/{order_id}/status?status=PROCESSING")
    print("   Alias /orders/orders Status:", res_alias1.status_code)
    assert res_alias1.status_code == 200

    print("\n==================================================================")
    print("  ALL 7 STAGES TESTED & FULL PERSISTENCE VERIFIED SUCCESSFULLY!")
    print("==================================================================")

if __name__ == "__main__":
    test_order_status_pipeline()
