from __future__ import annotations

import json
from typing import List, Dict, Any, Optional, Union


def get_applicable_tier(
    price_tiers: Optional[Union[List[Dict[str, Any]], str]],
    quantity: int
) -> Optional[Dict[str, Any]]:
    """
    Finds and returns the best matching price tier for a given quantity.
    
    Structure of each tier:
    {
        "min_qty": 5,
        "max_qty": 9,      # or None for unbounded upper limit
        "discount_pct": 8.0
    }
    
    Returns:
        The matched tier dict if applicable, else None.
    """
    if not price_tiers or quantity <= 0:
        return None

    # Handle JSON string deserialization
    tiers_list: List[Dict[str, Any]] = []
    if isinstance(price_tiers, str):
        try:
            parsed = json.loads(price_tiers)
            if isinstance(parsed, list):
                tiers_list = parsed
        except Exception:
            return None
    elif isinstance(price_tiers, list):
        for t in price_tiers:
            if hasattr(t, "model_dump"):
                tiers_list.append(t.model_dump())
            elif isinstance(t, dict):
                tiers_list.append(t)

    if not tiers_list:
        return None

    matching_tiers: List[Dict[str, Any]] = []
    for tier in tiers_list:
        min_qty = tier.get("min_qty")
        if min_qty is None:
            continue
        try:
            min_qty = int(min_qty)
        except (ValueError, TypeError):
            continue

        max_qty = tier.get("max_qty")
        if max_qty is not None:
            try:
                max_qty = int(max_qty)
            except (ValueError, TypeError):
                max_qty = None

        discount_pct = float(tier.get("discount_pct", 0.0) or 0.0)

        # Check bounds: min_qty <= quantity and (max_qty is None or quantity <= max_qty)
        if quantity >= min_qty and (max_qty is None or quantity <= max_qty):
            matching_tiers.append({
                "min_qty": min_qty,
                "max_qty": max_qty,
                "discount_pct": discount_pct
            })

    if not matching_tiers:
        return None

    # Pick the tier offering the best discount (or highest min_qty as tie-breaker)
    matching_tiers.sort(key=lambda x: (x["discount_pct"], x["min_qty"]), reverse=True)
    return matching_tiers[0]


def calculate_volume_discount(
    unit_price: float,
    quantity: int,
    tier: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Calculates volume discount amounts and effective price per unit.
    
    Returns:
        {
            "unit_price": float,
            "quantity": int,
            "original_subtotal": float,
            "tier_used": Optional[Dict[str, Any]],
            "discount_pct": float,
            "discount_amount": float,
            "effective_price": float,
            "effective_subtotal": float
        }
    """
    unit_price = float(unit_price)
    quantity = max(0, int(quantity))
    original_subtotal = round(unit_price * quantity, 2)

    if not tier or quantity <= 0:
        return {
            "unit_price": unit_price,
            "quantity": quantity,
            "original_subtotal": original_subtotal,
            "tier_used": None,
            "discount_pct": 0.0,
            "discount_amount": 0.0,
            "effective_price": unit_price,
            "effective_subtotal": original_subtotal
        }

    discount_pct = float(tier.get("discount_pct", 0.0) or 0.0)
    discount_amount = round(original_subtotal * (discount_pct / 100.0), 2)
    effective_subtotal = max(0.0, round(original_subtotal - discount_amount, 2))
    effective_price = round(effective_subtotal / quantity, 2) if quantity > 0 else unit_price

    return {
        "unit_price": unit_price,
        "quantity": quantity,
        "original_subtotal": original_subtotal,
        "tier_used": {
            "min_qty": tier.get("min_qty"),
            "max_qty": tier.get("max_qty"),
            "discount_pct": discount_pct
        },
        "discount_pct": discount_pct,
        "discount_amount": discount_amount,
        "effective_price": effective_price,
        "effective_subtotal": effective_subtotal
    }


def apply_volume_pricing(
    product: Any,
    quantity: int
) -> Dict[str, Any]:
    """
    Takes a product (object or dict) and quantity, detects its volume tier,
    and returns full volume pricing calculation.
    """
    # Extract unit price
    if hasattr(product, "price"):
        unit_price = float(product.price)
    elif isinstance(product, dict) and "price" in product:
        unit_price = float(product["price"])
    else:
        unit_price = 0.0

    # Extract price tiers (object attribute or dict key)
    price_tiers = None
    if hasattr(product, "price_tiers") and product.price_tiers:
        price_tiers = product.price_tiers
    elif hasattr(product, "price_tiers_json") and product.price_tiers_json:
        price_tiers = product.price_tiers_json
    elif isinstance(product, dict):
        price_tiers = product.get("price_tiers") or product.get("price_tiers_json")

    tier = get_applicable_tier(price_tiers, quantity)
    pricing = calculate_volume_discount(unit_price, quantity, tier)

    # Attach product identifier if present
    prod_id = getattr(product, "id", None) if not isinstance(product, dict) else product.get("id")
    sku = getattr(product, "sku", None) if not isinstance(product, dict) else product.get("sku")
    pricing["product_id"] = prod_id
    pricing["sku"] = sku

    return pricing


class VolumePricingService:
    """Service wrapper for volume pricing operations."""

    @staticmethod
    def get_applicable_tier(price_tiers: Optional[Union[List[Dict[str, Any]], str]], quantity: int) -> Optional[Dict[str, Any]]:
        return get_applicable_tier(price_tiers, quantity)

    @staticmethod
    def calculate_volume_discount(unit_price: float, quantity: int, tier: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return calculate_volume_discount(unit_price, quantity, tier)

    @staticmethod
    def apply_volume_pricing(product: Any, quantity: int) -> Dict[str, Any]:
        return apply_volume_pricing(product, quantity)


pricing_service = VolumePricingService()
