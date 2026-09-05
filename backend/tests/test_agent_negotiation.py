import pytest
from app.services.agent_commerce_service import AgentCommerceService
from app.schemas.agent_commerce import A2ASimulationRequestDTO


@pytest.fixture
def agent_commerce_svc():
    return AgentCommerceService()


def test_get_preset_scenarios(agent_commerce_svc):
    scenarios = agent_commerce_svc.get_preset_scenarios()
    assert len(scenarios) >= 4
    scenario_ids = [s.id for s in scenarios]
    assert "scenario_retail_expansion" in scenario_ids
    assert "scenario_finops_enterprise" in scenario_ids
    assert "scenario_dev_workstation" in scenario_ids
    assert "scenario_storage_cluster" in scenario_ids


def test_agent_negotiation_volume_discount_payloads(agent_commerce_svc):
    req = A2ASimulationRequestDTO(scenario_id="scenario_retail_expansion")
    res = agent_commerce_svc.run_simulation(req)

    assert res is not None
    assert res.simulation_id.startswith("sim_a2a_")
    assert len(res.steps) == 6

    # Verify Step 2: Autonomous Multi-Turn Negotiation
    negotiate_step = next(s for s in res.steps if s.step_id == "negotiate")
    assert negotiate_step is not None
    assert negotiate_step.status == "completed"
    assert len(negotiate_step.dialogue) == 4

    # 1. Buyer baseline proposal (msg_2_1)
    msg_buyer_initial = negotiate_step.dialogue[0]
    assert msg_buyer_initial.sender == "buyer_agent"
    assert "Baseline Concession Proposal" in msg_buyer_initial.message
    assert msg_buyer_initial.structured_payload["intent"] == "flat_concession_proposal"

    # 2. Seller volume tier counter-offer (msg_2_2)
    msg_seller_counter = negotiate_step.dialogue[1]
    assert msg_seller_counter.sender == "seller_agent"
    assert "Buy 5+ units → 8% discount" in msg_seller_counter.message
    assert "Buy 10+ units → 15% discount" in msg_seller_counter.message

    # Verify required fields in dialogue message & structured_payload
    assert msg_seller_counter.volume_discount_offer is not None
    assert len(msg_seller_counter.volume_discount_offer) == 2
    assert msg_seller_counter.recommended_quantity == 10
    assert msg_seller_counter.savings_amount > 0

    assert msg_seller_counter.structured_payload["volume_discount_offer"] == msg_seller_counter.volume_discount_offer
    assert msg_seller_counter.structured_payload["recommended_quantity"] == 10
    assert msg_seller_counter.structured_payload["savings_amount"] == msg_seller_counter.savings_amount

    tier_1 = msg_seller_counter.volume_discount_offer[0]
    tier_2 = msg_seller_counter.volume_discount_offer[1]
    assert tier_1["min_qty"] == 5
    assert tier_1["discount_pct"] == 8.0
    assert "Buy 5+ units → 8% discount" in tier_1["offer_text"]

    assert tier_2["min_qty"] == 10
    assert tier_2["discount_pct"] == 15.0
    assert "Buy 10+ units → 15% discount" in tier_2["offer_text"]

    # 3. Buyer trade-off evaluation (msg_2_3)
    msg_buyer_eval = negotiate_step.dialogue[2]
    assert msg_buyer_eval.sender == "buyer_agent"
    assert "Autonomous Trade-off Evaluation" in msg_buyer_eval.message
    assert "Evaluating quantity increase vs savings" in msg_buyer_eval.message
    assert "Decision: Quantity increase justified" in msg_buyer_eval.message

    assert msg_buyer_eval.volume_discount_offer is not None
    assert msg_buyer_eval.recommended_quantity == 10
    assert msg_buyer_eval.savings_amount == msg_seller_counter.savings_amount
    assert msg_buyer_eval.structured_payload["intent"] in ["volume_evaluation_acceptance", "volume_tradeoff_evaluation"]
    assert msg_buyer_eval.structured_payload["evaluated_quantity_increase"] > 0
    assert msg_buyer_eval.structured_payload["within_budget"] is True
    assert msg_buyer_eval.structured_payload["consensus"] is True

    # 4. Seller consensus ratification (msg_2_4)
    msg_seller_consensus = negotiate_step.dialogue[3]
    assert msg_seller_consensus.sender == "seller_agent"
    assert "Consensus Finalized" in msg_seller_consensus.message
    assert msg_seller_consensus.structured_payload["consensus"] is True
    assert msg_seller_consensus.structured_payload["final_discount_pct"] == 15.0


def test_agent_negotiation_state_snapshot_and_cart(agent_commerce_svc):
    req = A2ASimulationRequestDTO(scenario_id="scenario_retail_expansion")
    res = agent_commerce_svc.run_simulation(req)

    # Verify Step 2 state_snapshot
    negotiate_step = next(s for s in res.steps if s.step_id == "negotiate")
    snapshot = negotiate_step.state_snapshot
    assert snapshot["discount_pct"] == 15.0
    assert snapshot["recommended_quantity"] == 10
    assert snapshot["savings_amount"] > 0
    assert len(snapshot["volume_discount_offer"]) == 2

    # Verify Final Cart
    final_cart = res.final_cart
    assert final_cart["discount_amount"] == snapshot["savings_amount"]
    assert final_cart["total"] > 0
    assert sum(i["qty"] for i in final_cart["items"]) == 10

    # Verify Real Order and Payment were created
    assert res.created_order_id is not None
    assert res.created_order_number is not None
    assert res.final_payment["order_id"] is not None
    assert "Reconciled" in res.reconciliation_status


def test_agent_negotiation_across_all_scenarios(agent_commerce_svc):
    scenarios = agent_commerce_svc.get_preset_scenarios()
    for sc in scenarios:
        res = agent_commerce_svc.run_simulation(A2ASimulationRequestDTO(scenario_id=sc.id))
        negotiate_step = next(s for s in res.steps if s.step_id == "negotiate")
        assert len(negotiate_step.dialogue) == 4
        seller_offer = negotiate_step.dialogue[1]
        buyer_eval = negotiate_step.dialogue[2]

        assert seller_offer.volume_discount_offer is not None
        assert seller_offer.recommended_quantity is not None
        assert seller_offer.savings_amount is not None

        assert buyer_eval.volume_discount_offer is not None
        assert buyer_eval.recommended_quantity is not None
        assert buyer_eval.savings_amount is not None
        assert buyer_eval.structured_payload["within_budget"] is True
