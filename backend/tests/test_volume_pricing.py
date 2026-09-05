import json
import pytest
import sqlite3
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.pricing_service import (
    get_applicable_tier,
    calculate_volume_discount,
    apply_volume_pricing,
    pricing_service
)
from app.schemas.catalog import PriceTierDTO, ProductCreateDTO
from app.services.catalog_service import catalog_service
from app.services.checkout_service import checkout_service
from app.schemas.checkout import CheckoutOrderRequestDTO


STANDARD_TIERS = [
    {"min_qty": 5, "max_qty": 9, "discount_pct": 8.0},
    {"min_qty": 10, "max_qty": None, "discount_pct": 15.0}
]


# =============================================================================
# 1. TIER MATCHING ENGINE TESTS (get_applicable_tier)
# =============================================================================
def test_get_applicable_tier_below_minimum():
    """Quantity below first tier (min_qty=5) returns None."""
    assert get_applicable_tier(STANDARD_TIERS, quantity=1) is None
    assert get_applicable_tier(STANDARD_TIERS, quantity=4) is None
    assert get_applicable_tier(STANDARD_TIERS, quantity=0) is None
    assert get_applicable_tier(STANDARD_TIERS, quantity=-5) is None


def test_get_applicable_tier_first_tier():
    """Quantities 5 to 9 match Tier 1 (8% discount)."""
    for qty in [5, 6, 8, 9]:
        tier = get_applicable_tier(STANDARD_TIERS, quantity=qty)
        assert tier is not None
        assert tier["min_qty"] == 5
        assert tier["max_qty"] == 9
        assert tier["discount_pct"] == 8.0


def test_get_applicable_tier_upper_unbounded_tier():
    """Quantities 10 and above match Tier 2 (15% discount, max_qty=None)."""
    for qty in [10, 11, 25, 100, 500]:
        tier = get_applicable_tier(STANDARD_TIERS, quantity=qty)
        assert tier is not None
        assert tier["min_qty"] == 10
        assert tier["max_qty"] is None
        assert tier["discount_pct"] == 15.0


def test_get_applicable_tier_with_json_string():
    """Accepts JSON serialized string directly."""
    tiers_json = json.dumps(STANDARD_TIERS)
    tier = get_applicable_tier(tiers_json, quantity=7)
    assert tier is not None
    assert tier["min_qty"] == 5
    assert tier["discount_pct"] == 8.0

    tier_large = get_applicable_tier(tiers_json, quantity=15)
    assert tier_large is not None
    assert tier_large["min_qty"] == 10
    assert tier_large["discount_pct"] == 15.0


def test_get_applicable_tier_with_dto_objects():
    """Accepts PriceTierDTO instances."""
    dtos = [
        PriceTierDTO(min_qty=5, max_qty=9, discount_pct=8.0),
        PriceTierDTO(min_qty=10, max_qty=None, discount_pct=15.0)
    ]
    tier = get_applicable_tier(dtos, quantity=6)
    assert tier is not None
    assert tier["discount_pct"] == 8.0


def test_get_applicable_tier_empty_or_malformed():
    """Gracefully handles empty lists, None, or invalid JSON strings."""
    assert get_applicable_tier([], quantity=10) is None
    assert get_applicable_tier(None, quantity=10) is None
    assert get_applicable_tier("invalid json string", quantity=10) is None
    assert get_applicable_tier([{"invalid": 123}], quantity=10) is None


# =============================================================================
# 2. CALCULATION ENGINE TESTS (calculate_volume_discount)
# =============================================================================
def test_calculate_volume_discount_without_tier():
    """Without tier, discount is 0 and effective price equals unit price."""
    calc = calculate_volume_discount(unit_price=10000.0, quantity=3, tier=None)
    assert calc["unit_price"] == 10000.0
    assert calc["quantity"] == 3
    assert calc["original_subtotal"] == 30000.0
    assert calc["tier_used"] is None
    assert calc["discount_pct"] == 0.0
    assert calc["discount_amount"] == 0.0
    assert calc["effective_price"] == 10000.0
    assert calc["effective_subtotal"] == 30000.0


def test_calculate_volume_discount_tier_1():
    """Price 10,000 INR, Qty 6, 8% discount -> 4,800 discount, 55,200 subtotal, 9,200 unit price."""
    tier = {"min_qty": 5, "max_qty": 9, "discount_pct": 8.0}
    calc = calculate_volume_discount(unit_price=10000.0, quantity=6, tier=tier)
    assert calc["original_subtotal"] == 60000.0
    assert calc["discount_pct"] == 8.0
    assert calc["discount_amount"] == 4800.0
    assert calc["effective_subtotal"] == 55200.0
    assert calc["effective_price"] == 9200.0
    assert calc["tier_used"] == tier


def test_calculate_volume_discount_tier_2():
    """Price 14,999 INR, Qty 10, 15% discount -> 22,498.50 discount, 127,491.50 subtotal."""
    tier = {"min_qty": 10, "max_qty": None, "discount_pct": 15.0}
    calc = calculate_volume_discount(unit_price=14999.0, quantity=10, tier=tier)
    assert calc["original_subtotal"] == 149990.0
    assert calc["discount_pct"] == 15.0
    assert calc["discount_amount"] == 22498.50
    assert calc["effective_subtotal"] == 127491.50
    assert calc["effective_price"] == 12749.15


# =============================================================================
# 3. APPLY VOLUME PRICING END-TO-END TESTS (apply_volume_pricing)
# =============================================================================
def test_apply_volume_pricing_with_product_dict():
    """Works seamlessly with dictionary product representations."""
    product = {
        "id": "prod_test_001",
        "sku": "TEST-SKU-001",
        "price": 2000.0,
        "price_tiers": STANDARD_TIERS
    }
    # Qty 2 -> No tier
    res_2 = apply_volume_pricing(product, quantity=2)
    assert res_2["tier_used"] is None
    assert res_2["discount_amount"] == 0.0
    assert res_2["effective_price"] == 2000.0
    assert res_2["effective_subtotal"] == 4000.0

    # Qty 5 -> Tier 1 (8%)
    res_5 = apply_volume_pricing(product, quantity=5)
    assert res_5["tier_used"]["discount_pct"] == 8.0
    assert res_5["discount_amount"] == 800.0
    assert res_5["effective_subtotal"] == 9200.0
    assert res_5["effective_price"] == 1840.0

    # Qty 12 -> Tier 2 (15%)
    res_12 = apply_volume_pricing(product, quantity=12)
    assert res_12["tier_used"]["discount_pct"] == 15.0
    assert res_12["discount_amount"] == 3600.0
    assert res_12["effective_subtotal"] == 20400.0
    assert res_12["effective_price"] == 1700.0


# =============================================================================
# 4. CATALOG SERVICE CRUD & PERSISTENCE TESTS
# =============================================================================
def test_catalog_create_and_retrieve_with_price_tiers():
    """Verify price_tiers_json is persisted in catalog SQLite database and mapped to DTO."""
    import uuid
    unique_sku = f"TEST-TIER-{uuid.uuid4().hex[:6].upper()}"
    custom_tiers = [
        PriceTierDTO(min_qty=3, max_qty=6, discount_pct=5.0),
        PriceTierDTO(min_qty=7, max_qty=None, discount_pct=12.0)
    ]
    new_prod = catalog_service.create_product(ProductCreateDTO(
        sku=unique_sku,
        name="Test Volume Tier Hardware Device",
        category="Payment Terminals",
        price=10000.0,
        description="Testing tiered pricing persistence in database.",
        price_tiers=custom_tiers
    ))

    assert new_prod.sku == unique_sku
    assert new_prod.price_tiers is not None
    assert len(new_prod.price_tiers) == 2
    assert new_prod.price_tiers[0].min_qty == 3
    assert new_prod.price_tiers[0].discount_pct == 5.0
    assert new_prod.price_tiers[1].min_qty == 7
    assert new_prod.price_tiers[1].discount_pct == 12.0

    # Retrieve from DB
    retrieved = catalog_service.get_product_by_id(new_prod.id)
    assert retrieved is not None
    assert len(retrieved.price_tiers) == 2
    assert retrieved.price_tiers[0].discount_pct == 5.0
    assert retrieved.price_tiers[1].discount_pct == 12.0


# =============================================================================
# 5. CHECKOUT SERVICE DYNAMIC TIER DETECTION & RECALCULATION TESTS
# =============================================================================
def test_checkout_cart_volume_pricing_lifecycle():
    """
    Test adding item with Qty 1 -> update Qty to 6 (Tier 1) -> update Qty to 10 (Tier 2).
    Verify recalculation of Subtotal, GST, and Grand Total.
    """
    # 1. Create a known product with standard volume tiers
    test_sku = "TEST-POS-BULK-01"
    prod = catalog_service.get_product_by_id(test_sku)
    if not prod:
        prod = catalog_service.create_product(ProductCreateDTO(
            sku=test_sku,
            name="Enterprise Bulk Terminal V1",
            category="Payment Terminals",
            price=10000.0,
            description="POS terminal for bulk checkout testing.",
            gst_rate_pct=18.0,
            price_tiers=[
                PriceTierDTO(min_qty=5, max_qty=9, discount_pct=8.0),
                PriceTierDTO(min_qty=10, max_qty=None, discount_pct=15.0)
            ]
        ))

    # 2. Add 1 item to cart -> No volume discount
    cart = checkout_service.get_or_create_cart()
    cart = checkout_service.add_to_cart(cart.id, prod.id, quantity=1)
    
    assert len(cart.items) == 1
    item = cart.items[0]
    assert item.quantity == 1
    assert item.tier_used is None
    assert item.discount_amount == 0.0
    assert item.effective_price == 10000.0
    assert item.subtotal == 10000.0
    assert cart.summary.volume_discount_amount == 0.0
    assert cart.summary.subtotal == 10000.0
    assert cart.summary.final_amount == 10000.0
    # Embedded GST: 10000 - (10000 / 1.18) = 1525.42
    assert abs(cart.summary.gst_included_amount - 1525.42) < 0.1

    # 3. Update quantity to 6 -> Tier 1 (8% discount) automatically applied!
    cart = checkout_service.update_quantity(cart.id, prod.id, quantity=6)
    item = cart.items[0]
    assert item.quantity == 6
    assert item.tier_used is not None
    assert item.tier_used["min_qty"] == 5
    assert item.tier_used["discount_pct"] == 8.0
    assert item.discount_amount == 4800.0  # 6 * 10000 * 0.08
    assert item.effective_price == 9200.0
    assert item.subtotal == 55200.0

    assert cart.summary.volume_discount_amount == 4800.0
    assert cart.summary.subtotal == 55200.0
    assert cart.summary.final_amount == 55200.0
    # Embedded GST recalculated on discounted subtotal: 55200 - (55200 / 1.18) = 8420.34
    assert abs(cart.summary.gst_included_amount - 8420.34) < 0.1

    # 4. Update quantity to 10 -> Tier 2 (15% discount) automatically applied!
    cart = checkout_service.update_quantity(cart.id, prod.id, quantity=10)
    item = cart.items[0]
    assert item.quantity == 10
    assert item.tier_used is not None
    assert item.tier_used["min_qty"] == 10
    assert item.tier_used["discount_pct"] == 15.0
    assert item.discount_amount == 15000.0  # 10 * 10000 * 0.15
    assert item.effective_price == 8500.0
    assert item.subtotal == 85000.0

    assert cart.summary.volume_discount_amount == 15000.0
    assert cart.summary.subtotal == 85000.0
    assert cart.summary.final_amount == 85000.0
    # Embedded GST on 85,000: 85000 - (85000 / 1.18) = 12966.10
    assert abs(cart.summary.gst_included_amount - 12966.10) < 0.1

    # 5. Verify persistence in SQLite cart_items table
    with checkout_service._get_conn() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?", (cart.id, prod.id))
        row = cursor.fetchone()
        assert row is not None
        assert row["quantity"] == 10
        assert row["discount_amount"] == 15000.0
        assert row["effective_price"] == 8500.0
        assert row["subtotal"] == 85000.0
        tier_db = json.loads(row["tier_used"])
        assert tier_db["min_qty"] == 10
        assert tier_db["discount_pct"] == 15.0


def test_checkout_coupon_stacking_with_volume_pricing():
    """Verify promotional coupons stack cleanly on top of volume-discounted cart subtotals."""
    prod = catalog_service.get_all_products(limit=1).products[0]
    cart = checkout_service.get_or_create_cart()
    # Add 6 units to trigger 8% volume discount
    cart = checkout_service.add_to_cart(cart.id, prod.id, quantity=6)
    
    vol_discount = cart.summary.volume_discount_amount
    vol_subtotal = cart.summary.subtotal
    assert vol_discount > 0

    # Apply promo coupon RAZOR2026 (10% extra discount)
    cart = checkout_service.apply_coupon(cart.id, "RAZOR2026")
    expected_coupon_discount = round(vol_subtotal * 0.10, 2)
    assert cart.summary.coupon_discount_amount == expected_coupon_discount
    assert cart.summary.volume_discount_amount == vol_discount
    assert cart.summary.discount_amount == round(vol_discount + expected_coupon_discount, 2)
    assert cart.summary.final_amount == round(vol_subtotal - expected_coupon_discount, 2)


def test_checkout_order_creation_persists_volume_tier():
    """Verify order creation captures volume discounts and effective prices."""
    prod = catalog_service.get_all_products(limit=1).products[0]
    cart = checkout_service.get_or_create_cart()
    cart = checkout_service.add_to_cart(cart.id, prod.id, quantity=5)

    res = checkout_service.create_checkout_order(CheckoutOrderRequestDTO(
        cart_id=cart.id,
        customer_name="Acme Bulk Corp",
        customer_email="procurement@acmebulk.com"
    ))
    assert res.order_id.startswith("order_rzp_")
    assert res.final_amount == cart.summary.final_amount


# =============================================================================
# 6. BACKWARD COMPATIBILITY TESTS
# =============================================================================
def test_backward_compatibility_product_without_tiers():
    """Products with empty or null tiers function identically to standard products."""
    legacy_prod = {
        "id": "prod_legacy_100",
        "sku": "LEGACY-100",
        "price": 5000.0,
        "price_tiers": None,
        "price_tiers_json": "[]"
    }
    pricing = apply_volume_pricing(legacy_prod, quantity=20)
    assert pricing["tier_used"] is None
    assert pricing["discount_pct"] == 0.0
    assert pricing["discount_amount"] == 0.0
    assert pricing["effective_price"] == 5000.0
    assert pricing["effective_subtotal"] == 100000.0


# =============================================================================
# 7. AI CATALOG CONTEXT API TESTS
# =============================================================================
def test_ai_catalog_context_volume_pricing_tiers():
    """Verify AICatalogContextDTO exposes volume_pricing_tiers for AI agents."""
    ctx = catalog_service.get_ai_readable_context()
    assert ctx.total_items > 0
    assert len(ctx.products) > 0
    assert "volume_pricing_tiers" in ctx.instructions_for_ai_agent

    # Find a product with tiers
    prod_with_tiers = next((p for p in ctx.products if len(p.volume_pricing_tiers) > 0), None)
    assert prod_with_tiers is not None, "At least one product should have volume pricing tiers"
    assert prod_with_tiers.sku is not None
    assert prod_with_tiers.price > 0
    assert isinstance(prod_with_tiers.volume_pricing_tiers, list)

    tier0 = prod_with_tiers.volume_pricing_tiers[0]
    assert "min_qty" in tier0
    assert "discount_pct" in tier0
    assert tier0["min_qty"] > 0
    assert tier0["discount_pct"] > 0


def test_ai_agent_autonomous_quantity_selection():
    """Simulate an AI shopping agent evaluating volume_pricing_tiers to pick optimal quantity."""
    ctx = catalog_service.get_ai_readable_context()
    prod = next(p for p in ctx.products if p.sku.startswith("RZP-") and len(p.volume_pricing_tiers) >= 2)

    # Agent objective: wants between 4 and 6 items, checks if increasing to 5 saves money
    base_qty = 4
    base_cost = prod.price * base_qty

    # Look for tier matching 5
    tier_5 = get_applicable_tier(prod.volume_pricing_tiers, 5)
    assert tier_5 is not None
    assert tier_5["discount_pct"] >= 8.0

    calc_5 = calculate_volume_discount(prod.price, 5, tier_5)
    # Effective price for 5 items with 8% discount
    assert calc_5["effective_price"] < prod.price
    assert calc_5["discount_amount"] > 0
    # 5 items discounted should have lower unit price than standard
    assert calc_5["effective_price"] == round(prod.price * (1 - tier_5["discount_pct"] / 100.0), 2)

