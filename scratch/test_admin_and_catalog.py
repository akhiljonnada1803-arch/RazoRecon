import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_admin_and_catalog():
    print("--- 1. Testing Catalog Status Update ---")
    cat_res = requests.get(f"{BASE_URL}/catalog")
    products = cat_res.json()
    first_prod_id = products["items"][0]["id"]
    print("Testing on product ID:", first_prod_id)

    res = requests.patch(f"{BASE_URL}/catalog/products/{first_prod_id}/status", json={"status": "LOW_STOCK"})
    print("PATCH status response:", res.status_code, res.json().get("inventory_status"))
    assert res.status_code == 200
    assert res.json().get("inventory_status") == "LOW_STOCK"

    # Reset back to IN_STOCK
    res = requests.patch(f"{BASE_URL}/catalog/products/{first_prod_id}/status", json={"status": "IN_STOCK"})
    print("Reset status response:", res.status_code, res.json().get("inventory_status"))

    print("\n--- 2. Testing Admin API Keys ---")
    res = requests.get(f"{BASE_URL}/admin/api-keys")
    print("GET api-keys count:", len(res.json()))
    assert res.status_code == 200

    create_key_res = requests.post(f"{BASE_URL}/admin/api-keys", json={"name": "Test LLM Bot Key", "environment": "live"})
    print("POST api-keys response:", create_key_res.status_code, create_key_res.json())
    new_key_id = create_key_res.json().get("id")

    del_key_res = requests.delete(f"{BASE_URL}/admin/api-keys/{new_key_id}")
    print("DELETE api-key response:", del_key_res.status_code)

    print("\n--- 3. Testing Admin Webhooks ---")
    res = requests.get(f"{BASE_URL}/admin/webhooks")
    print("GET webhooks count:", len(res.json()))
    assert res.status_code == 200

    print("\n--- 4. Testing Admin AI Buyer Logs ---")
    res = requests.get(f"{BASE_URL}/admin/ai-buyer-logs")
    print("GET ai-buyer-logs count:", len(res.json()))
    assert res.status_code == 200

    print("\n--- 5. Testing Protocol Monitoring ---")
    res = requests.get(f"{BASE_URL}/admin/protocol-monitoring")
    print("GET protocol-monitoring:", res.status_code, res.json().get("protocol_version"))
    assert res.status_code == 200

    print("\n ALL VERIFICATIONS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_admin_and_catalog()
