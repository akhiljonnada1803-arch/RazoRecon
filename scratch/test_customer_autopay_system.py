import sys
import os
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath("backend"))

from app.services.ai_autopay_service import ai_autopay_service

def test_complete_autopay_system():
    print("=== 1. TESTING SETTINGS & SPENDING RULES ===")
    import uuid
    user_id = f"usr_test_{uuid.uuid4().hex[:8]}"
    
    settings = ai_autopay_service.get_settings(user_id=user_id)
    print("Initial Settings:", settings["monthly_budget"], settings["purchase_mode"])
    assert settings["monthly_budget"] == 25000.0
    
    # Update settings
    updated = ai_autopay_service.update_settings(user_id=user_id, data={
        "monthly_budget": 50000.0,
        "max_single_purchase_limit": 5000.0,
        "allowed_categories": ["HARDWARE", "ACCESSORIES"],
        "merchant_trust_level": "VERIFIED_ONLY",
        "purchase_mode": "AUTO_BUY",
        "autopay_enabled": True
    })
    print("Updated Settings:", updated["monthly_budget"], updated["allowed_categories"])
    assert updated["monthly_budget"] == 50000.0
    assert "HARDWARE" in updated["allowed_categories"]

    print("\n=== 2. TESTING MANDATE REGISTRATION (4 TYPES) ===")
    # 1. UPI AutoPay
    m_upi = ai_autopay_service.add_mandate(user_id=user_id, data={
        "type": "UPI_AUTOPAY",
        "bank_name": "HDFC Bank",
        "account_or_vpa": "testuser@okhdfcbank",
        "max_amount": 25000.0
    })
    print("UPI Mandate:", m_upi)
    assert m_upi["type"] == "UPI_AUTOPAY"
    assert m_upi["account_or_vpa_masked"] == "testuser@okhdfcbank"

    # 2. Credit Card
    m_cc = ai_autopay_service.add_mandate(user_id=user_id, data={
        "type": "CREDIT_CARD_MANDATE",
        "bank_name": "ICICI Bank",
        "account_or_vpa": "4315888899991234",
        "max_amount": 50000.0
    })
    print("Credit Card Mandate:", m_cc)
    assert m_cc["account_or_vpa_masked"] == "•••• •••• •••• 1234"

    # 3. Debit Card
    m_dc = ai_autopay_service.add_mandate(user_id=user_id, data={
        "type": "DEBIT_CARD_MANDATE",
        "bank_name": "Axis Bank",
        "account_or_vpa": "5123456789019988",
        "max_amount": 15000.0
    })
    print("Debit Card Mandate:", m_dc)
    assert m_dc["account_or_vpa_masked"] == "•••• •••• •••• 9988"

    # 4. NetBanking e-Mandate
    m_nb = ai_autopay_service.add_mandate(user_id=user_id, data={
        "type": "NETBANKING_EMANDATE",
        "bank_name": "State Bank of India",
        "account_or_vpa": "987654321011",
        "max_amount": 30000.0
    })
    print("NetBanking Mandate:", m_nb)
    assert "•••• 1011" in m_nb["account_or_vpa_masked"]

    print("\n=== 3. TESTING PRE-PURCHASE GUARDRAILS ENGINE ===")
    # Test A: Valid Purchase (Passes all 6 guardrails)
    v_pass = ai_autopay_service.validate_autonomous_purchase(
        user_id=user_id,
        product_id="ACC-ROLL-006",
        product_name="Thermal Paper Rolls",
        category="ACCESSORIES",
        unit_price=999.0,
        quantity=2,
        merchant_name="Razorpay Official Store",
        merchant_verified=True
    )
    print("Valid Purchase Check:", v_pass["allowed"], v_pass["checks"])
    assert v_pass["allowed"] is True

    # Test B: Exceeds Single Purchase Limit (₹6000 > ₹5000 limit)
    v_fail_single = ai_autopay_service.validate_autonomous_purchase(
        user_id=user_id,
        product_id="HW-EXP-001",
        product_name="High-End POS Terminal",
        category="HARDWARE",
        unit_price=6000.0,
        quantity=1,
        merchant_name="Razorpay Official Store",
        merchant_verified=True
    )
    print("Single Limit Fail Check:", v_fail_single["allowed"], v_fail_single["failures"])
    assert v_fail_single["allowed"] is False
    assert any("Single Purchase Limit" in f for f in v_fail_single["failures"])

    # Test C: Disallowed Category ("SOFTWARE" not in ["HARDWARE", "ACCESSORIES"])
    v_fail_cat = ai_autopay_service.validate_autonomous_purchase(
        user_id=user_id,
        product_id="SOFT-001",
        product_name="ERP Cloud Addon",
        category="SOFTWARE",
        unit_price=1000.0,
        quantity=1,
        merchant_name="Razorpay Official Store",
        merchant_verified=True
    )
    print("Disallowed Category Check:", v_fail_cat["allowed"], v_fail_cat["failures"])
    assert v_fail_cat["allowed"] is False
    assert any("not checked" in f for f in v_fail_cat["failures"])

    # Test D: Unverified Merchant (Trust Level = VERIFIED_ONLY)
    v_fail_merchant = ai_autopay_service.validate_autonomous_purchase(
        user_id=user_id,
        product_id="ACC-002",
        product_name="Generic Cable",
        category="ACCESSORIES",
        unit_price=500.0,
        quantity=1,
        merchant_name="Unknown 3rd Party Vendor",
        merchant_verified=False
    )
    print("Unverified Merchant Check:", v_fail_merchant["allowed"], v_fail_merchant["failures"])
    assert v_fail_merchant["allowed"] is False
    assert any("not verified" in f for f in v_fail_merchant["failures"])

    print("\n=== 4. TESTING AI REPLENISHMENT GENERATION & EXECUTION ===")
    recs = ai_autopay_service.generate_replenishment_recommendations(user_id=user_id)
    print(f"Generated {len(recs)} replenishment recommendations.")
    target_rec = recs[0] # Thermal Paper Rolls
    print(f"Executing AutoPay for '{target_rec['product_name']}' (Rs. {target_rec['total_price']})...")
    
    exec_res = ai_autopay_service.execute_recommendation(
        recommendation_id=target_rec["id"],
        user_id=user_id,
        is_customer_action=False
    )
    print("Execution Result:", exec_res["status"], "Order ID:", exec_res["order_id"], "New Spent:", exec_res["spent_this_month"])
    assert exec_res["status"] == "success"
    assert exec_res["order_id"] is not None

    print("\n=== 5. TESTING 1-CLICK REVERSIBLE REFUND WORKFLOW ===")
    log_id = exec_res["execution_id"]
    spent_before_refund = exec_res["spent_this_month"]
    refund_res = ai_autopay_service.refund_autonomous_purchase(
        log_id=log_id,
        user_id=user_id,
        reason="Test reversal by customer"
    )
    print("Refund Result:", refund_res["status"], "Refund ID:", refund_res["refund_id"], "New Spent After Refund:", refund_res["new_spent_this_month"])
    assert refund_res["status"] == "success"
    assert refund_res["new_spent_this_month"] < spent_before_refund

    print("\n=== 6. TESTING IN-APP NOTIFICATIONS ===")
    notifs = ai_autopay_service.get_notifications(user_id=user_id)
    print(f"Customer has {len(notifs)} notifications:")
    for n in notifs[:4]:
        print(f"  [{n['type']}] ({n['severity']}) {n['title']} -> {n['message'][:60]}...")
    assert len(notifs) >= 3

    # Mark first read
    first_notif_id = notifs[0]["id"]
    ai_autopay_service.mark_notification_read(notif_id=first_notif_id, user_id=user_id)
    updated_notifs = ai_autopay_service.get_notifications(user_id=user_id)
    first_read = [n for n in updated_notifs if n["id"] == first_notif_id][0]
    assert first_read["is_read"] is True

    print("\n=== 7. TESTING DASHBOARD SUMMARY ===")
    dashboard = ai_autopay_service.get_dashboard_summary(user_id=user_id)
    print("KPIs:", dashboard["kpis"])
    assert dashboard["kpis"]["autopay_status"] == "ACTIVE"
    assert dashboard["kpis"]["active_mandates_count"] == 4
    assert len(dashboard["execution_history"]) >= 1

    print("\n>>> ALL TESTS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    test_complete_autopay_system()
