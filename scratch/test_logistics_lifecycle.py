import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def api_call(method: str, path: str, data: dict = None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            return response.status, json.loads(res_body) if res_body else {}
    except urllib.error.HTTPError as e:
        res_body = e.read().decode("utf-8")
        return e.code, json.loads(res_body) if res_body else {"error": str(e)}

print("=" * 70)
print("TESTING 11-STAGE LOGISTICS LIFECYCLE & COURIER PARTNER SIMULATION")
print("=" * 70)

# 1. Fetch Partners
status, partners = api_call("GET", "/merchant/delivery-partners")
print(f"[1] Delivery Partners ({len(partners)} found):")
for p in partners:
    print(f"    - {p['name']} ({p['code']}): SLA: {p['sla']} | Active Shipments: {p.get('active_shipments', 0)}")
assert len(partners) == 5, f"Expected 5 partners, got {len(partners)}"

# 2. Fetch Orders & Find a Payment Received Order
status, orders = api_call("GET", "/merchant/orders")
print(f"\n[2] Fetched {len(orders)} orders.")
target_order = orders[0]
order_id = target_order["id"]
print(f"Target Order: {order_id} | Initial Status: {target_order.get('order_status')}")

# 3. Test Merchant Actions:
print("\n[3] Testing Merchant Workflow Actions:")

# Step A: Accept Order
status, res = api_call("POST", f"/merchant/orders/{order_id}/accept")
print(f"    - Accept Order: Status {status} | order_status: {res.get('order', {}).get('order_status')}")
assert res.get('order', {}).get('order_status') == "ACCEPTED"
assert res.get('order', {}).get('awb_number') is None, "AWB must NOT exist before courier pickup"
assert res.get('order', {}).get('tracking_id') is None, "Tracking ID must NOT exist before courier pickup"

# Step B: Start Picking
status, res = api_call("POST", f"/merchant/orders/{order_id}/start-picking")
print(f"    - Start Picking: Status {status} | order_status: {res.get('order', {}).get('order_status')}")
assert res.get('order', {}).get('order_status') == "PICKING"

# Step C: Mark Packed
status, res = api_call("POST", f"/merchant/orders/{order_id}/pack")
print(f"    - Mark Packed: Status {status} | order_status: {res.get('order', {}).get('order_status')}")
assert res.get('order', {}).get('order_status') == "PACKED"

# Step D: Mark Ready for Pickup
status, res = api_call("POST", f"/merchant/orders/{order_id}/ready-for-pickup")
print(f"    - Ready for Pickup: Status {status} | order_status: {res.get('order', {}).get('order_status')}")
assert res.get('order', {}).get('order_status') == "READY_FOR_PICKUP"
assert res.get('order', {}).get('awb_number') is None, "AWB must NOT exist before courier pickup"

# 4. Test Simulated Courier Actions:
print("\n[4] Testing Simulated Courier Actions:")

# Step E: Courier Pickup (Delhivery Express) -> GENERATES AWB and Tracking ID
status, res = api_call("POST", f"/merchant/orders/{order_id}/courier-pickup?courier_name=Delhivery%20Express")
order = res.get('order', {})
print(f"    - Courier Pickup: Status {status} | order_status: {order.get('order_status')}")
print(f"      Courier: {order.get('delivery_partner')} | AWB: {order.get('awb_number')} | Tracking ID: {order.get('tracking_id')}")
assert order.get('order_status') == "PICKED_UP_BY_COURIER"
assert order.get('awb_number') is not None and order.get('awb_number').startswith("AWB-DLV-"), "AWB must be generated upon pickup"
assert order.get('tracking_id') is not None and order.get('tracking_id').startswith("DLV"), "Tracking ID must be generated upon pickup"

# Step F: Update In-Transit Location
status, res = api_call("POST", f"/merchant/orders/{order_id}/in-transit?location=Mumbai%20Air%20Cargo%20Terminal%20(BOM)")
order = res.get('order', {})
print(f"    - In-Transit Location Update: Status {status} | order_status: {order.get('order_status')} | location: {order.get('current_location')}")
assert order.get('order_status') == "IN_TRANSIT"
assert "Mumbai Air Cargo" in order.get('current_location')

# Step G: Out for Delivery
status, res = api_call("POST", f"/merchant/orders/{order_id}/out-for-delivery?notes=Koramangala%20Delivery%20Rider%20Dispatched")
order = res.get('order', {})
print(f"    - Out for Delivery: Status {status} | order_status: {order.get('order_status')} | location: {order.get('current_location')}")
assert order.get('order_status') == "OUT_FOR_DELIVERY"

# Step H: Mark Delivered
status, res = api_call("POST", f"/merchant/orders/{order_id}/deliver")
order = res.get('order', {})
print(f"    - Delivered: Status {status} | order_status: {order.get('order_status')}")
assert order.get('order_status') == "DELIVERED"

# Step I: Return & Refund simulation
status, res = api_call("POST", f"/merchant/orders/{order_id}/return?reason=Defective%20Item%20Return")
order = res.get('order', {})
print(f"    - Return: Status {status} | order_status: {order.get('order_status')}")
assert order.get('order_status') == "RETURNED"

status, res = api_call("POST", f"/merchant/orders/{order_id}/refund")
order = res.get('order', {})
print(f"    - Refund: Status {status} | order_status: {order.get('order_status')} | payment_status: {order.get('payment_status')}")
assert order.get('order_status') == "REFUNDED"
assert order.get('payment_status') == "REFUNDED"

print("\n" + "=" * 70)
print("ALL TESTS PASSED! 100% SUCCESS.")
print("=" * 70)
