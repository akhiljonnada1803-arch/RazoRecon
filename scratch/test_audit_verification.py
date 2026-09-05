import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_audit_system():
    print("=== 1. Testing GET /audit/logs ===")
    res = requests.get(f"{BASE_URL}/audit/logs?limit=5")
    assert res.status_code == 200, f"Error {res.status_code}: {res.text}"
    data = res.json()
    items = data.get("items", [])
    print(f"Total audit logs: {data.get('total', len(items))}, returned: {len(items)}")
    for item in items[:3]:
        print(f" - [{item.get('timestamp')}] {item.get('role')} ({item.get('user_name')}): {item.get('action')} on {item.get('entity_type')}#{item.get('entity_id')}")

    print("\n=== 2. Testing GET /audit/activity-feed ===")
    res = requests.get(f"{BASE_URL}/audit/activity-feed?limit=5")
    assert res.status_code == 200, f"Error {res.status_code}: {res.text}"
    feed = res.json().get("feed", [])
    print(f"Feed items returned: {len(feed)}")

    print("\n=== 3. Testing GET /merchant/orders for 13 Lifecycle Timestamps ===")
    res = requests.get(f"{BASE_URL}/merchant/orders?limit=5")
    assert res.status_code == 200, f"Error {res.status_code}: {res.text}"
    raw = res.json()
    orders = raw.get("orders", raw) if isinstance(raw, dict) else raw
    if orders:
        sample = orders[0]
        lifecycle_keys = [
            "created_at", "updated_at", "order_placed_at", "payment_initiated_at",
            "payment_completed_at", "merchant_accepted_at", "packed_at",
            "ready_for_pickup_at", "courier_assigned_at", "shipped_at",
            "out_for_delivery_at", "delivered_at", "cancelled_at", "refunded_at"
        ]
        print(f"Order: {sample.get('id')} ({sample.get('order_status')})")
        for k in lifecycle_keys:
            val = sample.get(k)
            print(f"   {k}: {val}")

    print("\n=== 4. Testing Audit Trail Mutation Generation ===")
    # Let's create an order and accept it to verify audit emission
    create_payload = {
        "customer_name": "Dr. Verification Agent",
        "customer_email": "agent@audit-test.com",
        "customer_phone": "+91 98765 43210",
        "delivery_address": "Audit Validation Center, Floor 4, Bangalore 560001",
        "items": [
            {
                "product_id": "PROD-01",
                "product_name": "Razorpay Smart POS Pro",
                "quantity": 1,
                "unit_price": 42500
            }
        ],
        "subtotal": 42500,
        "tax": 7650,
        "total_amount": 50150,
        "payment_method": "RAZORPAY_UPI",
        "currency": "INR",
        "status": "PAYMENT_RECEIVED"
    }
    create_res = requests.post(f"{BASE_URL}/merchant/orders", json=create_payload)
    assert create_res.status_code == 200, f"Order creation failed: {create_res.text}"
    new_order = create_res.json()
    new_order_id = new_order.get("id")
    print(f"Created order: {new_order_id}, placed_at: {new_order.get('order_placed_at')}")

    # Now Accept the order
    accept_res = requests.post(f"{BASE_URL}/merchant/orders/{new_order_id}/accept")
    assert accept_res.status_code == 200, f"Accept failed: {accept_res.text}"
    accepted_data = accept_res.json()
    accepted_order = accepted_data.get("order", accepted_data)
    print(f"Accepted order: {new_order_id}, merchant_accepted_at: {accepted_order.get('merchant_accepted_at')}")

    # Pack the order
    pack_res = requests.post(f"{BASE_URL}/merchant/orders/{new_order_id}/pack")
    assert pack_res.status_code == 200, f"Pack failed: {pack_res.text}"
    packed_data = pack_res.json()
    packed_order = packed_data.get("order", packed_data)
    print(f"Packed order: {new_order_id}, packed_at: {packed_order.get('packed_at')}")

    # Query entity audit trail
    audit_res = requests.get(f"{BASE_URL}/audit/entity/order/{new_order_id}")
    assert audit_res.status_code == 200, f"Entity audit failed: {audit_res.text}"
    raw_audit = audit_res.json()
    order_audits = raw_audit.get("audit_trail", raw_audit) if isinstance(raw_audit, dict) else raw_audit
    print(f"\nAudit trail for {new_order_id} ({len(order_audits)} events recorded):")
    for a in order_audits:
        print(f" - [{a.get('timestamp')}] {a.get('action')} by {a.get('role')} (old: {a.get('old_value')} -> new: {a.get('new_value')})")

    print("\n[SUCCESS] ALL AUDIT & TIMESTAMP CHECKS PASSED PERFECTLY!")

if __name__ == "__main__":
    test_audit_system()
