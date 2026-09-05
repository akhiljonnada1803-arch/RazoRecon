import sqlite3
import json
import random
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Optional, Dict, Any

from app.schemas.installation import (
    InstallationServiceItem,
    InstallationBookingCreate,
    InstallationBookingDTO,
    InstallationKPIsDTO
)
from app.services.audit_service import audit_service
from app.services.catalog_service import catalog_service

DB_PATH = Path(__file__).parent.parent.parent / "data" / "installations.db"

class InstallationService:
    def __init__(self, db_path: Path = DB_PATH):
        self.db_path = db_path
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._ensure_tables()
        self._seed_catalog()
        self._seed_sample_bookings()

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _ensure_tables(self):
        with self._get_conn() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS installation_catalog (
                    id TEXT PRIMARY KEY,
                    sku TEXT UNIQUE,
                    title TEXT NOT NULL,
                    category TEXT NOT NULL,
                    tier TEXT NOT NULL,
                    price REAL NOT NULL,
                    duration_mins INTEGER NOT NULL,
                    description TEXT NOT NULL,
                    features TEXT NOT NULL,
                    technician_role TEXT NOT NULL,
                    sla_hours INTEGER NOT NULL
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS installation_bookings (
                    id TEXT PRIMARY KEY,
                    product_id TEXT NOT NULL,
                    product_name TEXT NOT NULL,
                    service_id TEXT NOT NULL,
                    service_title TEXT NOT NULL,
                    tier TEXT NOT NULL,
                    price REAL NOT NULL,
                    customer_id TEXT NOT NULL,
                    customer_name TEXT NOT NULL,
                    customer_phone TEXT NOT NULL,
                    service_address TEXT NOT NULL,
                    pincode TEXT NOT NULL,
                    scheduled_date TEXT NOT NULL,
                    time_slot TEXT NOT NULL,
                    status TEXT NOT NULL,
                    technician_name TEXT,
                    technician_phone TEXT,
                    technician_rating REAL,
                    technician_badge TEXT,
                    otp_code TEXT NOT NULL,
                    checklist TEXT NOT NULL,
                    payment_status TEXT NOT NULL,
                    payment_method TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """)
            conn.commit()

    def _seed_catalog(self):
        with self._get_conn() as conn:
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*) FROM installation_catalog")
            if cur.fetchone()[0] == 0:
                services = [
                    (
                        "serv_pos_std",
                        "INST-POS-STD",
                        "Standard POS Terminal Setup & Cloud Sync",
                        "Payment Terminals",
                        "STANDARD",
                        499.0,
                        45,
                        "Complete unboxing, Wi-Fi/4G SIM configuration, firmware update, and Razorpay Merchant Cloud pairing.",
                        json.dumps([
                            "Hardware inspection & power adapter verification",
                            "Razorpay POS App setup & cloud account activation",
                            "1 test payment verification (UPI QR & NFC Tap)",
                            "Staff handover with digital quick-start guide"
                        ]),
                        "Certified Hardware Technician",
                        24
                    ),
                    (
                        "serv_pos_exp",
                        "INST-POS-EXP",
                        "Express Same-Day POS & Soundbox Deployment",
                        "Payment Terminals",
                        "EXPRESS",
                        999.0,
                        30,
                        "Priority same-day dispatch and physical setup by a senior Razorpay field engineer within 4 hours.",
                        json.dumps([
                            "Guaranteed 4-hour on-site arrival SLA",
                            "Dual device setup (Android Smart POS + Audio Soundbox)",
                            "Soundbox voice alert testing in English/Hindi/Regional languages",
                            "Countertop anti-theft cable locking setup"
                        ]),
                        "Senior Deployment Specialist",
                        4
                    ),
                    (
                        "serv_ent_vip",
                        "INST-ENT-VIP",
                        "Enterprise Multi-Lane Retail POS & ERP Integration",
                        "Payment Terminals",
                        "ENTERPRISE",
                        2499.0,
                        120,
                        "End-to-end integration with merchant billing ERP (Tally, SAP, Marg), custom receipt printing, and staff training.",
                        json.dumps([
                            "Multi-counter barcode scanner & printer calibration",
                            "Local ERP API webhook listener configuration",
                            "High-volume stress test & offline batching verification",
                            "Comprehensive 30-min staff & cashier certification training"
                        ]),
                        "Enterprise Solutions Architect",
                        12
                    ),
                    (
                        "serv_prn_bar",
                        "INST-PRN-BAR",
                        "Barcode & Thermal Receipt Printer Calibration",
                        "Accessories",
                        "STANDARD",
                        399.0,
                        30,
                        "Precision alignment for 58mm/80mm thermal rolls, cutter testing, and Bluetooth/USB driver installation.",
                        json.dumps([
                            "Thermal head alignment and print density optimization",
                            "Driver integration on Windows/Android/Linux POS",
                            "Custom GST tax invoice template formatting"
                        ]),
                        "Hardware Support Engineer",
                        24
                    ),
                    (
                        "serv_bio_aad",
                        "INST-BIO-AAD",
                        "Aadhaar Biometric Scanner & e-KYC Station Setup",
                        "Payment Terminals",
                        "STANDARD",
                        599.0,
                        45,
                        "UIDAI RD service driver registration, sensor calibration, and instant merchant e-KYC testing.",
                        json.dumps([
                            "Official UIDAI Registered Device (RD) driver setup",
                            "Optical sensor cleaning and accuracy calibration",
                            "End-to-end live biometric Aadhaar verification test"
                        ]),
                        "Biometrics Compliance Engineer",
                        24
                    )
                ]
                cur.executemany("""
                    INSERT INTO installation_catalog (
                        id, sku, title, category, tier, price, duration_mins,
                        description, features, technician_role, sla_hours
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, services)
                conn.commit()

    def _seed_sample_bookings(self):
        with self._get_conn() as conn:
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*) FROM installation_bookings")
            if cur.fetchone()[0] == 0:
                now = datetime.utcnow()
                sample_bookings = [
                    (
                        "inst_bk_001",
                        "prod_rzp_pos_v3_pro",
                        "Razorpay POS V3 Pro Smart Terminal",
                        "serv_pos_exp",
                        "Express Same-Day POS & Soundbox Deployment",
                        "EXPRESS",
                        999.0,
                        "usr_customer_demo",
                        "Rajesh Verma (Store Owner)",
                        "+91 98450 11223",
                        "Shop #4, Phoenix Marketcity, Whitefield",
                        "560048",
                        (now + timedelta(days=1)).strftime("%Y-%m-%d"),
                        "10:00 AM - 01:00 PM",
                        "technician_assigned",
                        "Vikramaditya Rao",
                        "+91 98765 43210",
                        4.95,
                        "Razorpay Senior Field Engineer",
                        "7842",
                        json.dumps([
                            {"task": "Hardware unboxing & inspection", "done": True},
                            {"task": "Wi-Fi & 4G APN configuration", "done": True},
                            {"task": "Dynamic QR & UPI payment test", "done": False},
                            {"task": "Cashier staff onboarding", "done": False}
                        ]),
                        "PAID",
                        "razorpay_autopay",
                        (now - timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S UTC"),
                        now.strftime("%Y-%m-%d %H:%M:%S UTC")
                    ),
                    (
                        "inst_bk_002",
                        "prod_rzp_soundbox_v2",
                        "Razorpay Audio Soundbox 4G",
                        "serv_pos_std",
                        "Standard POS Terminal Setup & Cloud Sync",
                        "STANDARD",
                        499.0,
                        "usr_customer_demo",
                        "Rajesh Verma (Store Owner)",
                        "+91 98450 11223",
                        "Shop #4, Phoenix Marketcity, Whitefield",
                        "560048",
                        (now - timedelta(days=3)).strftime("%Y-%m-%d"),
                        "02:00 PM - 05:00 PM",
                        "completed",
                        "Amitabh Sengupta",
                        "+91 91234 56789",
                        4.88,
                        "Certified Hardware Technician",
                        "9140",
                        json.dumps([
                            {"task": "Hardware unboxing & inspection", "done": True},
                            {"task": "Wi-Fi & 4G APN configuration", "done": True},
                            {"task": "Dynamic QR & UPI payment test", "done": True},
                            {"task": "Cashier staff onboarding", "done": True}
                        ]),
                        "PAID",
                        "razorpay_autopay",
                        (now - timedelta(days=4)).strftime("%Y-%m-%d %H:%M:%S UTC"),
                        (now - timedelta(days=3)).strftime("%Y-%m-%d %H:%M:%S UTC")
                    )
                ]
                cur.executemany("""
                    INSERT INTO installation_bookings (
                        id, product_id, product_name, service_id, service_title,
                        tier, price, customer_id, customer_name, customer_phone,
                        service_address, pincode, scheduled_date, time_slot,
                        status, technician_name, technician_phone, technician_rating,
                        technician_badge, otp_code, checklist, payment_status,
                        payment_method, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, sample_bookings)
                conn.commit()

    def get_services_catalog(self, category: Optional[str] = None) -> List[InstallationServiceItem]:
        with self._get_conn() as conn:
            cur = conn.cursor()
            if category:
                cur.execute("SELECT * FROM installation_catalog WHERE category = ? OR category = 'Payment Terminals'", (category,))
            else:
                cur.execute("SELECT * FROM installation_catalog")
            rows = cur.fetchall()

            return [
                InstallationServiceItem(
                    id=r["id"],
                    sku=r["sku"],
                    title=r["title"],
                    category=r["category"],
                    tier=r["tier"],
                    price=float(r["price"]),
                    duration_mins=int(r["duration_mins"]),
                    description=r["description"],
                    features=json.loads(r["features"]),
                    technician_role=r["technician_role"],
                    sla_hours=int(r["sla_hours"])
                )
                for r in rows
            ]

    def get_service_by_id(self, service_id: str) -> Optional[InstallationServiceItem]:
        with self._get_conn() as conn:
            cur = conn.cursor()
            cur.execute("SELECT * FROM installation_catalog WHERE id = ? OR sku = ?", (service_id, service_id))
            r = cur.fetchone()
            if not r:
                return None
            return InstallationServiceItem(
                id=r["id"],
                sku=r["sku"],
                title=r["title"],
                category=r["category"],
                tier=r["tier"],
                price=float(r["price"]),
                duration_mins=int(r["duration_mins"]),
                description=r["description"],
                features=json.loads(r["features"]),
                technician_role=r["technician_role"],
                sla_hours=int(r["sla_hours"])
            )

    def create_booking(self, payload: InstallationBookingCreate, user_id: Optional[str] = None) -> InstallationBookingDTO:
        service = self.get_service_by_id(payload.service_id)
        if not service:
            # Fallback to standard
            service = self.get_services_catalog()[0]

        # Resolve product name
        prod = catalog_service.get_product_by_id(payload.product_id)
        prod_name = prod.name if prod else "Razorpay Hardware Terminal"

        booking_id = f"inst_bk_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{random.randint(100, 999)}"
        otp_code = str(random.randint(1000, 9999))
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        checklist = [
            {"task": "On-site arrival & hardware unboxing check", "done": False},
            {"task": "Power rail, battery & peripheral inspection", "done": False},
            {"task": "Cloud sync, terminal provisioning & firmware update", "done": False},
            {"task": "Live ₹1.00 transaction test (QR & NFC Tap)", "done": False},
            {"task": "Merchant staff training & verification signoff", "done": False}
        ]

        technicians = [
            ("Vikramaditya Rao", "+91 98765 43210", 4.95, "Razorpay Senior Field Engineer"),
            ("Pooja Sharma", "+91 99887 76655", 4.92, "Certified POS Deployment Specialist"),
            ("Mohammad Arif", "+91 98223 34455", 4.89, "Enterprise Solutions Technician"),
        ]
        assigned_tech = random.choice(technicians)

        with self._get_conn() as conn:
            conn.execute("""
                INSERT INTO installation_bookings (
                    id, product_id, product_name, service_id, service_title,
                    tier, price, customer_id, customer_name, customer_phone,
                    service_address, pincode, scheduled_date, time_slot,
                    status, technician_name, technician_phone, technician_rating,
                    technician_badge, otp_code, checklist, payment_status,
                    payment_method, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                booking_id,
                payload.product_id,
                prod_name,
                service.id,
                service.title,
                service.tier,
                service.price,
                payload.customer_id or user_id or "usr_customer_demo",
                payload.customer_name,
                payload.customer_phone,
                payload.service_address,
                payload.pincode,
                payload.scheduled_date,
                payload.time_slot,
                "technician_assigned",
                assigned_tech[0],
                assigned_tech[1],
                assigned_tech[2],
                assigned_tech[3],
                otp_code,
                json.dumps(checklist),
                "PAID",
                payload.payment_method,
                now_str,
                now_str
            ))
            conn.commit()

        # Audit logging
        audit_service.log_action(
            action="CREATE_INSTALLATION_BOOKING",
            resource="installation",
            user_id=payload.customer_id or user_id or "usr_customer_demo",
            role="Customer",
            details={
                "booking_id": booking_id,
                "service_title": service.title,
                "tier": service.tier,
                "price": service.price,
                "payment_method": payload.payment_method,
                "technician": assigned_tech[0]
            }
        )

        return self.get_booking_by_id(booking_id)

    def get_booking_by_id(self, booking_id: str) -> Optional[InstallationBookingDTO]:
        with self._get_conn() as conn:
            cur = conn.cursor()
            cur.execute("SELECT * FROM installation_bookings WHERE id = ?", (booking_id,))
            r = cur.fetchone()
            if not r:
                return None
            return self._row_to_dto(r)

    def get_customer_bookings(self, customer_id: str = "usr_customer_demo") -> List[InstallationBookingDTO]:
        with self._get_conn() as conn:
            cur = conn.cursor()
            cur.execute("SELECT * FROM installation_bookings WHERE customer_id = ? ORDER BY created_at DESC", (customer_id,))
            rows = cur.fetchall()
            return [self._row_to_dto(r) for r in rows]

    def update_booking_status(self, booking_id: str, status: str, notes: Optional[str] = None, updated_by: Optional[str] = None) -> Optional[InstallationBookingDTO]:
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        with self._get_conn() as conn:
            conn.execute("""
                UPDATE installation_bookings
                SET status = ?, updated_at = ?
                WHERE id = ?
            """, (status, now_str, booking_id))
            conn.commit()

        audit_service.log_action(
            action=f"UPDATE_INSTALLATION_STATUS_{status.upper()}",
            resource="installation",
            user_id=updated_by or "ops_engineer",
            role="Operations Lead",
            details={"booking_id": booking_id, "new_status": status, "notes": notes}
        )
        return self.get_booking_by_id(booking_id)

    def get_kpis(self) -> InstallationKPIsDTO:
        with self._get_conn() as conn:
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*) FROM installation_bookings")
            total = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM installation_bookings WHERE status = 'completed'")
            completed = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM installation_bookings WHERE status IN ('technician_assigned', 'in_transit', 'in_progress')")
            active = cur.fetchone()[0]

            return InstallationKPIsDTO(
                total_bookings=max(total, 142),
                completed_bookings=max(completed, 128),
                active_deployments=max(active, 14),
                on_time_completion_rate=98.6,
                customer_satisfaction_score=4.92,
                avg_turnaround_hours=3.8
            )

    def _row_to_dto(self, r: sqlite3.Row) -> InstallationBookingDTO:
        return InstallationBookingDTO(
            id=r["id"],
            product_id=r["product_id"],
            product_name=r["product_name"],
            service_id=r["service_id"],
            service_title=r["service_title"],
            tier=r["tier"],
            price=float(r["price"]),
            customer_id=r["customer_id"],
            customer_name=r["customer_name"],
            customer_phone=r["customer_phone"],
            service_address=r["service_address"],
            pincode=r["pincode"],
            scheduled_date=r["scheduled_date"],
            time_slot=r["time_slot"],
            status=r["status"],
            technician_name=r["technician_name"],
            technician_phone=r["technician_phone"],
            technician_rating=float(r["technician_rating"] or 4.9),
            technician_badge=r["technician_badge"],
            otp_code=r["otp_code"],
            checklist=json.loads(r["checklist"] or "[]"),
            payment_status=r["payment_status"],
            payment_method=r["payment_method"],
            created_at=r["created_at"],
            updated_at=r["updated_at"]
        )

installation_service = InstallationService()
