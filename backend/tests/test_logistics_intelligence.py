import pytest
from app.services.logistics_intelligence_service import logistics_intelligence_service

def test_fleet_overview():
    overview = logistics_intelligence_service.get_fleet_overview()
    assert overview.total_shipments_month > 1000
    assert overview.on_time_delivery_rate > 95.0
    assert len(overview.carrier_performance) == 5
    assert len(overview.daily_sla_trends) == 7

def test_pincode_carrier_routing():
    # Metro test
    metro_rec = logistics_intelligence_service.recommend_carrier_for_pincode("560001")
    assert metro_rec.city == "Bengaluru"
    assert metro_rec.recommended_carrier in ["Delhivery Express", "BlueDart Express"]
    assert metro_rec.on_time_probability_pct > 95.0
    assert len(metro_rec.recommendation_reasons) >= 2

    # NCR test
    ncr_rec = logistics_intelligence_service.recommend_carrier_for_pincode("110001")
    assert ncr_rec.city == "New Delhi"
    assert ncr_rec.confidence_score > 0.90

def test_shipment_tracking_with_ai_delay_scoring():
    tracking = logistics_intelligence_service.get_shipment_tracking("DEL-994821034IN")
    assert tracking.tracking_number == "DEL-994821034IN"
    assert tracking.status == "OUT_FOR_DELIVERY"
    assert tracking.delay_risk_pct < 20.0
    assert tracking.delay_risk_level in ["LOW", "MODERATE"]
    assert len(tracking.milestones) >= 4
    assert len(tracking.ai_reassurance_note) > 10

def test_autonomous_dispatch_optimization():
    res = logistics_intelligence_service.optimize_and_assign_dispatch(
        order_id="ORD-TEST-9921",
        pincode="560100",
        priority="EXPRESS"
    )
    assert res["status"] == "DISPATCH_OPTIMIZED"
    assert res["awb_number"] is not None
    assert res["on_time_probability_pct"] > 95.0
