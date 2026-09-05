import requests
import json

BASE_URL = "http://localhost:8000/api/v1/customer"

def test_full_customer_commerce_flow():
    print("==================================================")
    print("1. Testing Address Book CRUD & Defaults")
    print("==================================================")
    
    # 1a. List addresses
    addr_res = requests.get(f"{BASE_URL}/addresses")
    assert addr_res.status_code == 200, f"Get addresses failed: {addr_res.text}"
    addrs = addr_res.json()
    print(f"Initial addresses count: {len(addrs)}")
    
    # 1b. Add new address
    new_addr_payload = {
        "full_name": "Akhil Enterprise Test",
        "phone": "+91 99887 76655",
        "address_line1": "Tower 4, Floor 12, RMZ Ecospace",
        "address_line2": "Bellandur Outer Ring Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pincode": "560103",
        "landmark": "Near Intel Campus",
        "is_default": True
    }
    create_addr_res = requests.post(f"{BASE_URL}/addresses", json=new_addr_payload)
    assert create_addr_res.status_code == 200, f"Create address failed: {create_addr_res.text}"
    created_addr = create_addr_res.json()
    addr_id = created_addr["id"]
    print(f"[SUCCESS] Created address: {addr_id}, Default: {created_addr['is_default']}")
    
    # 1c. Update address
    update_res = requests.put(f"{BASE_URL}/addresses/{addr_id}", json={"landmark": "Next to Pritech Park"})
    assert update_res.status_code == 200, f"Update address failed: {update_res.text}"
    print(f"[SUCCESS] Updated landmark: {update_res.json()['landmark']}")

    print("\n==================================================")
    print("2. Testing Amazon/Flipkart Multi-Step Checkout")
    print("==================================================")
    checkout_payload = {
        "customer_name": "Akhil Jonnada",
        "customer_email": "akhil@razorcommerce.in",
        "customer_phone": "+91 98765 43210",
        "shipping_address": created_addr,
        "delivery_option": "EXPRESS",
        "items": [
            {
                "product_id": "HW-POS-001",
                "sku": "SKU-POS-SMART-PRO",
                "name": "Razorpay Smart POS Pro Terminal",
                "price": 14999.0,
                "quantity": 2,
                "image_url": "https://images.unsplash.com/photo-1556742049-0a67c55cb211?w=300&q=80"
            }
        ],
        "subtotal": 29998.0,
        "discount": 2999.8,
        "coupon_code": "RAZOR2026",
        "tax": 4859.68,
        "total_amount": 31956.88,
        "payment_method": "UPI"
    }
    
    checkout_res = requests.post(f"{BASE_URL}/checkout", json=checkout_payload)
    assert checkout_res.status_code == 200, f"Checkout failed: {checkout_res.text}"
    order = checkout_res.json()
    order_id = order["id"]
    order_number = order.get("order_number")
    print(f"[SUCCESS] Order Created: {order_id} ({order_number})")
    print(f" - Amount: Rs.{order.get('total_amount')}")
    print(f" - Carrier: {order.get('delivery_partner')}, AWB: {order.get('awb_number')}")
    print(f" - Estimated: {order.get('estimated_delivery')}")
    print(f" - Placed At: {order.get('order_placed_at')}")

    print("\n==================================================")
    print("3. Testing Customer Orders Listing & Filtering")
    print("==================================================")
    orders_res = requests.get(f"{BASE_URL}/orders?status=ALL")
    assert orders_res.status_code == 200, f"Orders listing failed: {orders_res.text}"
    orders_data = orders_res.json()
    orders_list = orders_data.get("orders", [])
    print(f"[SUCCESS] Total orders retrieved: {len(orders_list)}")
    
    # Filter by Processing
    proc_res = requests.get(f"{BASE_URL}/orders?status=PROCESSING")
    assert proc_res.status_code == 200
    print(f"[SUCCESS] Processing orders count: {len(proc_res.json().get('orders', []))}")

    print("\n==================================================")
    print("4. Testing Single Order Details API")
    print("==================================================")
    details_res = requests.get(f"{BASE_URL}/orders/{order_id}")
    assert details_res.status_code == 200, f"Order details failed: {details_res.text}"
    details = details_res.json()
    print(f"[SUCCESS] Order Details: {details.get('order_number')}, Items: {len(details.get('items', []))}")
    print(f" - Merchant: {details.get('merchant', {}).get('name')}")
    print(f" - GSTIN: {details.get('merchant', {}).get('gstin')}")

    print("\n==================================================")
    print("5. Testing Live Shipment Tracking Telemetry")
    print("==================================================")
    tracking_res = requests.get(f"{BASE_URL}/orders/{order_id}/tracking")
    assert tracking_res.status_code == 200, f"Tracking failed: {tracking_res.text}"
    trk = tracking_res.json()
    print(f"[SUCCESS] Tracking Milestone count: {len(trk.get('milestones', []))}")
    for m in trk.get("milestones", []):
        print(f"   * {m.get('label')}: Completed={m.get('completed')}, Time={m.get('timestamp')}")
    print(f" - Carrier Info: {trk.get('carrier', {}).get('name')}, AWB: {trk.get('carrier', {}).get('awb_number')}")

    print("\n==================================================")
    print("6. Testing Return & Refund Flow")
    print("==================================================")
    return_payload = {
        "reason": "Defective / Hardware Issue",
        "details": "Screen backlight flickering on POS Terminal display.",
        "image_url": "https://images.unsplash.com/photo-1556742049-0a67c55cb211?w=300&q=80",
        "refund_amount": details.get("total_amount")
    }
    return_res = requests.post(f"{BASE_URL}/orders/{order_id}/return", json=return_payload)
    assert return_res.status_code == 200, f"Return failed: {return_res.text}"
    ret_order = return_res.json()
    print(f"[SUCCESS] Return Request Created on {order_id}!")
    print(f" - Order Status: {ret_order.get('order_status')}")
    print(f" - Return Status: {ret_order.get('return_request', {}).get('return_status')}")
    print(f" - Refund Status: {ret_order.get('refund', {}).get('status')}, Ref: {ret_order.get('refund', {}).get('transaction_id')}")

    print("\n==================================================")
    print("7. Testing Customer Dashboard Widgets")
    print("==================================================")
    widgets_res = requests.get(f"{BASE_URL}/dashboard-widgets")
    assert widgets_res.status_code == 200, f"Widgets failed: {widgets_res.text}"
    widgets = widgets_res.json()
    print(f"[SUCCESS] Dashboard Widgets Loaded:")
    print(f" - Total Orders: {widgets.get('total_orders')}")
    print(f" - In-Transit Orders: {widgets.get('in_transit_count')}")
    print(f" - Active Returns: {widgets.get('returns_count')}")
    print(f" - Saved Addresses: {widgets.get('saved_addresses_count')}")

    print("\n[ALL TESTS PASSED SUCCESSFULLY!]")

if __name__ == "__main__":
    test_full_customer_commerce_flow()
