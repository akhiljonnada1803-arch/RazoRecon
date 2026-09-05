import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, r"c:\PROJECTS\RazoPay\financial-reconciliation-agent-main\backend")

from app.services.auth_service import auth_service
from app.services.catalog_service import catalog_service
from app.services.merchant_service import merchant_service

print("=== Testing Track 01 Commerce Platform Services ===")

# 1. Test 4 Roles
auth_service._seed_default_data()
roles = auth_service.list_roles()
print(f"Roles Count: {len(roles)}")
for r in roles:
    print(f" - [{r.id}] {r.name}: {len(r.permissions)} permissions")

assert len(roles) >= 4

# Test login for 4 personas
for email in ["admin@razorcommerce.ai", "owner@acme.com", "ops@acme.com", "customer@acme.com"]:
    res = auth_service.authenticate_user(email, "demo123")
    assert res is not None, f"Login failed for {email}"
    print(f" Auth OK: {res.user.role} ({email})")

# 2. Test Catalog & Agent Context
catalog_service._seed_data(catalog_service._get_conn().cursor())
products_resp = catalog_service.get_all_products(limit=10)
print(f"\nCatalog Products: {products_resp.total_count} total items, returned {len(products_resp.items)}")
assert products_resp.total_count >= 50
assert len(products_resp.items) > 0

agent_ctx = catalog_service.get_ai_readable_context()
print(f"AI Agent Context: {agent_ctx.total_items} items, {len(agent_ctx.categories)} categories")
assert agent_ctx.total_items >= 50

stats = catalog_service.get_catalog_stats()
print(f"Catalog Valuation: INR {stats.total_valuation_inr:,}, In-Stock: {stats.in_stock_rate_pct}%")

# 3. Test Merchant Orders, 7-Stage Workflow & Delivery Partners
merchant_service._seed_data()
dash = merchant_service.get_dashboard_metrics()
print(f"\nMerchant Revenue: INR {dash['gross_revenue']:,}, Total Orders: {dash['total_orders']}, Active Shipments: {dash['active_shipments']}")
assert dash['total_orders'] >= 200

orders = merchant_service.get_orders()
print(f"Orders in DB: {len(orders)}")
assert len(orders) >= 200

# Test Workflow on first order
test_ord = orders[0]
ord_id = test_ord["id"]
print(f"\nTesting 7-Stage Order Pipeline on Order #{test_ord['order_number']}:")
print(f" Initial Status: {test_ord['order_status']}")

acc = merchant_service.accept_order(ord_id)
print(f" 1. Accepted: Status = {acc['order_status']}")

pck = merchant_service.pack_order(ord_id)
print(f" 2. Packed: Status = {pck['order_status']}")

shp = merchant_service.assign_courier(ord_id, "Delhivery")
print(f" 3. Courier Assigned: Partner = {shp['delivery_partner']}, AWB = {shp['tracking_id']}, Status = {shp['order_status']}")

delv = merchant_service.update_order_status(ord_id, "DELIVERED", notes="Customer received and signed")
print(f" 4. Delivered: Status = {delv['order_status']}, Timeline Events = {len(delv['timeline'])}")

partners = merchant_service.get_delivery_partners()
print(f"\nDelivery Partners: {[p['name'] for p in partners]}")
assert len(partners) == 4

shipments = merchant_service.get_shipments()
print(f"Active Tracked Shipments: {len(shipments)}")
assert len(shipments) >= 20

customers = merchant_service.get_customers()
print(f"Customers Count: {len(customers)}")
assert len(customers) >= 100

print("\n>>> ALL TRACK 01 COMMERCE SERVICES VALIDATED WITH 100% SUCCESS! <<<")
