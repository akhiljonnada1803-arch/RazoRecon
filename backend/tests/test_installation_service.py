import pytest
from app.services.installation_service import installation_service
from app.schemas.installation import InstallationBookingCreate, InstallationStatusUpdate

def test_installation_catalog_seeded():
    services = installation_service.get_services_catalog()
    assert len(services) >= 4
    skus = [s.sku for s in services]
    assert "INST-POS-STD" in skus
    assert "INST-POS-EXP" in skus

def test_create_and_manage_booking():
    payload = InstallationBookingCreate(
        product_id="prod_rzp_pos_v3_pro",
        service_id="serv_pos_exp",
        customer_id="usr_test_cust",
        customer_name="Aarav Gupta",
        customer_phone="+91 98888 11111",
        service_address="Indiranagar 100ft Road, Bengaluru",
        pincode="560038",
        scheduled_date="2026-09-08",
        time_slot="10:00 AM - 01:00 PM",
        payment_method="razorpay_autopay"
    )

    booking = installation_service.create_booking(payload)
    assert booking.id.startswith("inst_bk_")
    assert booking.customer_name == "Aarav Gupta"
    assert booking.tier == "EXPRESS"
    assert booking.price == 999.0
    assert booking.status == "technician_assigned"
    assert booking.technician_name is not None
    assert len(booking.otp_code) == 4

    # Update status to in_transit then completed
    updated = installation_service.update_booking_status(
        booking_id=booking.id,
        status="completed",
        notes="Field engineer verified ₹1.00 QR test transaction."
    )
    assert updated.status == "completed"

    # Query customer bookings
    cust_bookings = installation_service.get_customer_bookings("usr_test_cust")
    assert len(cust_bookings) >= 1
    assert cust_bookings[0].id == booking.id

def test_installation_kpis():
    kpis = installation_service.get_kpis()
    assert kpis.total_bookings > 0
    assert kpis.on_time_completion_rate > 95.0
    assert kpis.customer_satisfaction_score >= 4.5
