import sys
import os
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.services.commerce_service import commerce_service

def run_tests():
    print("=== 1. TESTING INTENT: 'I need a laptop under ₹60,000' ===")
    res1 = commerce_service.process_chat_query("I need a laptop under ₹60,000")
    print("Flow Step:", res1.flow_step)
    print("Top 3 Products:", [f"{p.name} (₹{p.price})" for p in res1.recommended_products])
    print("AI Recommendation:", res1.ai_recommendation_reason)
    print("Comparison Table Attributes:", [a.attribute for a in res1.comparison_data.attributes])
    assert res1.flow_step == "TOP_RECOMMENDATIONS"
    assert len(res1.recommended_products) == 3
    assert all(p.category == "Workstations & Laptops" for p in res1.recommended_products)
    assert res1.ai_recommendation_reason is not None

    print("\n=== 2. TESTING INTENT: 'Find the best POS machine' ===")
    res2 = commerce_service.process_chat_query("Find the best POS machine")
    print("Flow Step:", res2.flow_step)
    print("Top 3 POS:", [f"{p.name} (₹{p.price})" for p in res2.recommended_products])
    assert res2.recommended_products[0].name == "Razorpay Smart POS Terminal V3 Pro"

    print("\n=== 3. TESTING INTENT: 'Recommend a CCTV camera' ===")
    res3 = commerce_service.process_chat_query("Recommend a CCTV camera")
    print("Top 3 CCTV:", [f"{p.name} (₹{p.price})" for p in res3.recommended_products])
    assert any("Hikvision" in p.name for p in res3.recommended_products)

    print("\n=== 4. TESTING STEP 6 & 7: CUSTOMER SELECTION ➔ ADDRESS SELECTION ===")
    selected_prod = res2.recommended_products[0]
    res_select = commerce_service.process_chat_query(
        query=f"Select {selected_prod.name}",
        action="select_product",
        selected_product_id=selected_prod.id
    )
    print("Flow Step:", res_select.flow_step)
    print("Selected Product:", res_select.selected_product.name)
    print("Saved Addresses:", [a["label"] for a in res_select.saved_addresses])
    assert res_select.flow_step == "ADDRESS_SELECTION"
    assert res_select.selected_product.id == selected_prod.id
    assert len(res_select.saved_addresses) >= 1

    print("\n=== 5. TESTING STEP 8 & 9: ADDRESS SELECTION ➔ ORDER SUMMARY & AUTOPAY VALIDATION ===")
    chosen_addr = res_select.saved_addresses[0]
    res_addr = commerce_service.process_chat_query(
        query="Ship to Acme Direct Corp - HQ",
        action="select_address",
        selected_product_id=selected_prod.id,
        selected_address=chosen_addr,
        quantity=1
    )
    print("Flow Step:", res_addr.flow_step)
    print("Order Summary Total:", res_addr.order_summary["total_amount"])
    print("Within Limit:", res_addr.order_summary["within_limit"])
    print("Within Budget:", res_addr.order_summary["within_budget"])
    assert res_addr.flow_step == "ORDER_SUMMARY"
    assert res_addr.order_summary["total_amount"] == 14999.00
    assert res_addr.order_summary["within_limit"] == True

    print("\n=== 6. TESTING STEP 10: CONFIRM PURCHASE ➔ AUTOPAY EXECUTION ===")
    res_buy = commerce_service.process_chat_query(
        query="Confirm & Buy via AutoPay",
        action="confirm_autopay_purchase",
        selected_product_id=selected_prod.id,
        selected_address=chosen_addr,
        quantity=1
    )
    print("Flow Step:", res_buy.flow_step)
    print("Autonomous Order Confirmed:", res_buy.autonomous_order is not None)
    assert res_buy.flow_step == "AUTONOMOUS_PURCHASE"

    print("\n>>> ALL 10-STEP ADVISOR BACKEND TESTS PASSED! <<<")

if __name__ == "__main__":
    run_tests()
