import sys
import os
import requests

# Add backend to sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
sys.path.insert(0, backend_path)

from app.services.catalog_service import catalog_service
from app.services.demand_intelligence_service import demand_intelligence_service

def test_reseed_and_catalog():
    print("1. Reseeding database from master_product_catalog.csv...")
    reseed_res = catalog_service.reseed_from_csv()
    print("Reseed Result:", reseed_res)
    assert reseed_res["status"] == "success"
    assert reseed_res["imported_products_count"] == 50

    print("\n2. Fetching all products from CatalogService...")
    catalog_res = catalog_service.get_all_products(limit=100)
    print(f"Total products fetched: {catalog_res.total}")
    assert catalog_res.total == 50
    assert len(catalog_res.categories) == 7

    print("Categories Breakdown:")
    for cat in catalog_res.categories:
        print(f" - {cat.name}: {cat.count} products ({cat.total_units} units)")

    print("\n3. Verifying sample products:")
    pos_item = next((p for p in catalog_res.products if "POS" in p.sku), None)
    assert pos_item is not None
    print(f"Found POS: {pos_item.name} | SKU: {pos_item.sku} | Price: {pos_item.price_display.encode('ascii', 'ignore').decode()} | Image: {pos_item.image_url}")

    soundbox_item = next((p for p in catalog_res.products if "SBOX" in p.sku), None)
    assert soundbox_item is not None
    print(f"Found Soundbox: {soundbox_item.name} | SKU: {soundbox_item.sku} | Specs: {len(soundbox_item.specs)} specs")

    print("\n4. Testing Demand Intelligence Service with master catalog...")
    demand_data = demand_intelligence_service.get_demand_intelligence()
    summary = demand_data["summary"]
    print("Demand Intelligence Summary:")
    print(f" - Avg Score: {summary['average_demand_score']}")
    print(f" - Tracked: {summary['total_products_tracked']}")
    print(f" - Trending: {summary['trending_count']}")
    print(f" - Declining: {summary['declining_count']}")
    print(f" - Dead Inventory: {summary['dead_inventory_count']}")
    print(f" - Active Autonomous Campaigns: {summary['active_campaign_recommendations_count']}")
    assert summary["total_products_tracked"] == 50

    print("\n5. Testing Inventory Optimization...")
    inv_data = demand_intelligence_service.get_inventory_optimization()
    print("Inventory Optimization Overview:", inv_data["overview"])
    print(f"Restock Queue Items: {len(inv_data['restock_queue'])}")
    assert inv_data["overview"]["total_skus"] == 50

    print("\nALL CATALOG & DEMAND INTELLIGENCE RESEED TESTS PASSED!")

if __name__ == "__main__":
    test_reseed_and_catalog()
