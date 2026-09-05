from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class InstallationServiceItem(BaseModel):
    id: str
    sku: str
    title: str
    category: str
    tier: str = Field("STANDARD", description="STANDARD, EXPRESS, ENTERPRISE")
    price: float
    duration_mins: int
    description: str
    features: List[str] = []
    technician_role: str = "Certified Hardware Technician"
    sla_hours: int = 24

class InstallationBookingCreate(BaseModel):
    product_id: str
    service_id: str
    customer_id: Optional[str] = "usr_customer_demo"
    customer_name: str
    customer_phone: str
    service_address: str
    pincode: str
    scheduled_date: str
    time_slot: str = "10:00 AM - 01:00 PM"
    notes: Optional[str] = None
    payment_method: str = "razorpay_autopay"  # razorpay_autopay, razorpay_card, razorpay_upi

class InstallationBookingDTO(BaseModel):
    id: str
    product_id: str
    product_name: str
    service_id: str
    service_title: str
    tier: str
    price: float
    customer_id: str
    customer_name: str
    customer_phone: str
    service_address: str
    pincode: str
    scheduled_date: str
    time_slot: str
    status: str = Field("requested", description="requested, technician_assigned, in_transit, in_progress, completed, cancelled")
    technician_name: Optional[str] = None
    technician_phone: Optional[str] = None
    technician_rating: Optional[float] = 4.9
    technician_badge: Optional[str] = "Razorpay Certified Expert"
    otp_code: str
    checklist: List[Dict[str, Any]] = []
    payment_status: str = "PAID"
    payment_method: str = "razorpay_autopay"
    created_at: str
    updated_at: str

class InstallationStatusUpdate(BaseModel):
    status: str = Field(..., description="requested, technician_assigned, in_transit, in_progress, completed, cancelled")
    notes: Optional[str] = None
    technician_name: Optional[str] = None
    updated_by: Optional[str] = "Operations Lead"

class InstallationKPIsDTO(BaseModel):
    total_bookings: int
    completed_bookings: int
    active_deployments: int
    on_time_completion_rate: float
    customer_satisfaction_score: float
    avg_turnaround_hours: float
