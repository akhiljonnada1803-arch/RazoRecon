import sys
import os
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath("backend"))

from app.services.ai_autopay_service import ai_autopay_service
from app.services.commerce_service import commerce_service

def test_autonomous_buying():
    print("=== 1. TESTING DIRECT ONE-CLICK BUY (AGENT PURCHASE) ===")
    user_id = "usr_customer_demo"
    
    # Ensure AutoPay settings are ready with fresh allowance
    with ai_autopay_service._get_conn() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE customer_budgets SET spent_this_month = 8500.0 WHERE user_id = ?", (user_id,))
        conn.commit()

    settings = ai_autopay_service.update_settings(user_id=user_id, data={
        "monthly_budget": 100000.0,
        "max_single_purchase_limit": 20000.0,
        "allowed_categories": ["HARDWARE", "SOFTWARE", "ACCESSORIES", "SUBSCRIPTIONS"],
        "merchant_trust_level": "VERIFIED_ONLY",
        "purchase_mode": "AUTO_BUY",
        "autopay_enabled": True
    })
    print("Settings Active:", settings["monthly_budget"], settings["max_single_purchase_limit"])

    # Execute 1-Click Agent Purchase
    buy_res = ai_autopay_service.direct_one_click_buy(
        product_id="prod_pos_smart_v3",
        quantity=1,
        user_id=user_id,
        custom_reason="Direct 1-Click Agent Purchase ('Buy via AutoPay')",
        is_autonomous_agent=False
    )
    print("Direct Buy Result:", buy_res["status"], "Order ID:", buy_res["order_id"])
    conf = buy_res["confirmation"]
    print("Confirmation Screen:", conf["product"]["name"], "Total:", conf["total"], "Payment:", conf["payment_method"], "Status:", conf["status"])
    assert buy_res["status"] == "success"
    assert conf["status"] == "AutoPay Approved"
    assert conf["total"] == 14999.0

    # 2. Test Conversational Advisor Flow
    print("\n=== 2. TESTING CONVERSATIONAL COMMERCE AGENT ADVISOR FLOW ===")
    chat_res = commerce_service.process_chat_query("Buy the best POS machine under ₹15,000")
    print("Chat Action Triggered:", chat_res.action_triggered)
    print("Flow Step:", chat_res.flow_step)
    print("Recommended Candidates:", [p.name for p in chat_res.recommended_products])
    assert chat_res.flow_step == "TOP_RECOMMENDATIONS"
    assert len(chat_res.recommended_products) == 3

    # Step 6 & 7: Select Product
    sel_prod = chat_res.recommended_products[0]
    res_select = commerce_service.process_chat_query(
        query=f"Select {sel_prod.name}",
        action="select_product",
        selected_product_id=sel_prod.id
    )
    assert res_select.flow_step == "ADDRESS_SELECTION"
    assert res_select.selected_product.id == sel_prod.id

    # Step 8 & 9: Select Address
    chosen_addr = res_select.saved_addresses[0]
    res_addr = commerce_service.process_chat_query(
        query="Ship to Acme Direct Corp - HQ",
        action="select_address",
        selected_product_id=sel_prod.id,
        selected_address=chosen_addr
    )
    assert res_addr.flow_step == "ORDER_SUMMARY"

    # Step 10: Confirm Purchase
    res_confirm = commerce_service.process_chat_query(
        query="Confirm & Buy via AutoPay",
        action="confirm_autopay_purchase",
        selected_product_id=sel_prod.id,
        selected_address=chosen_addr
    )
    print("Confirmed Order ID:", res_confirm.autonomous_order.get("order_id"))
    assert res_confirm.flow_step == "AUTONOMOUS_PURCHASE"

    print("\n=== 4. TESTING AUDIT LOG RECORDING ===")
    history = ai_autopay_service.get_dashboard_summary(user_id=user_id)["execution_history"]
    latest = history[0]
    print("Latest Audit Entry:")
    print("  Product:", latest.get("product_name"))
    print("  Amount:", latest.get("amount"))
    print("  Payment Method:", latest.get("payment_method"))
    print("  Approval Type:", latest.get("approval_type"))
    print("  Rule Used:", latest.get("autopay_rule_used"))
    assert latest.get("approval_type") is not None
    assert latest.get("amount") is not None

    print("\n>>> ALL AUTONOMOUS BUYING BACKEND TESTS PASSED! <<<")

if __name__ == "__main__":
    test_autonomous_buying()
