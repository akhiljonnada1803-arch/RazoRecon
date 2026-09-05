import urllib.request
import urllib.parse
import json

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

partners_to_test = [
    ("Delhivery Express", "DLV"),
    ("BlueDart Express", "BLU"),
    ("XpressBees Logistics", "XPB"),
    ("Ekart Logistics", "EKT"),
    ("Shadowfax Express", "SFX"),
]

print("=" * 70)
print("TESTING ALL 5 COURIER PARTNER PICKUPS & LIVE AWB GENERATION")
print("=" * 70)

_, orders = api_call("GET", "/merchant/orders")

for idx, (p_name, expected_prefix) in enumerate(partners_to_test):
    ord_item = orders[idx + 1]
    ord_id = ord_item["id"]
    
    # 1. Accept -> Picking -> Packed -> Ready for Pickup
    api_call("POST", f"/merchant/orders/{ord_id}/accept")
    api_call("POST", f"/merchant/orders/{ord_id}/start-picking")
    api_call("POST", f"/merchant/orders/{ord_id}/pack")
    status, ready_res = api_call("POST", f"/merchant/orders/{ord_id}/ready-for-pickup")
    
    order = ready_res.get("order", {})
    assert order.get("order_status") == "READY_FOR_PICKUP"
    assert order.get("awb_number") is None, f"AWB should be None for {ord_id} before pickup"
    
    # 2. Courier Pickup
    encoded_p = urllib.parse.quote(p_name)
    status, pickup_res = api_call("POST", f"/merchant/orders/{ord_id}/courier-pickup?courier_name={encoded_p}")
    p_order = pickup_res.get("order", {})
    
    awb = p_order.get("awb_number")
    trk = p_order.get("tracking_id")
    c_name = p_order.get("delivery_partner")
    
    print(f"[{idx+1}] Partner: {c_name} | Order: {ord_id}")
    print(f"    AWB: {awb} (Prefix: {expected_prefix}) | Tracking ID: {trk} | Status: {p_order.get('order_status')}")
    
    assert p_order.get("order_status") == "PICKED_UP_BY_COURIER"
    assert awb and f"-{expected_prefix}-" in awb, f"Expected {expected_prefix} in AWB, got {awb}"
    assert trk and trk.startswith(expected_prefix), f"Expected tracking to start with {expected_prefix}, got {trk}"

print("\n" + "=" * 70)
print("ALL 5 PARTNERS SUCCESSFULLY VERIFIED WITH REALISTIC PREFIXES & TIMELINES!")
print("=" * 70)
