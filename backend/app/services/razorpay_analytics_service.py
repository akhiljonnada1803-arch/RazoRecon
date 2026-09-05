import sqlite3
import os
import json
import uuid
import math
import random
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional

from app.core.timestamps import utcnow_iso
from app.schemas.razorpay_analytics import (
    SettlementDTO,
    RefundDTO,
    RazorpayAnalyticsOverviewDTO,
    RevenueTrendPoint,
    SettlementVelocityPoint,
    CategorySharePoint,
    PaymentStatusSharePoint,
    CreateRefundRequestDTO,
    TriggerSettlementRequestDTO
)

DB_DIR = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data"))
os.makedirs(DB_DIR, exist_ok=True)
PAYMENTS_DB_PATH = os.path.join(DB_DIR, "payments.db")

MDR_RATES = {
    "upi": 0.00,        # Government mandated zero MDR on UPI for small merchants / standard UPI
    "upi_autopay": 0.012, # 1.2% for recurring mandate processing
    "card": 0.020,      # 2.0% standard domestic credit/debit
    "corporate_card": 0.028, # 2.8% enterprise business cards
    "netbanking": 0.018, # 1.8% NetBanking e-Mandates
    "emi": 0.022        # 2.2% cardless / bank EMI
}

class RazorpayAnalyticsService:
    def __init__(self, db_path: str = PAYMENTS_DB_PATH):
        self.db_path = db_path
        self._init_db()
        self._seed_data_if_empty()

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_conn() as conn:
            cursor = conn.cursor()
            
            # Ensure settlements table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS settlements (
                    id TEXT PRIMARY KEY,
                    amount REAL NOT NULL,
                    fee REAL NOT NULL DEFAULT 0.0,
                    tax REAL NOT NULL DEFAULT 0.0,
                    net_amount REAL NOT NULL,
                    status TEXT NOT NULL DEFAULT 'settled',
                    utr TEXT,
                    settlement_time_hours REAL NOT NULL DEFAULT 18.5,
                    bank_account TEXT NOT NULL,
                    payments_count INTEGER NOT NULL DEFAULT 1,
                    created_at TEXT NOT NULL,
                    settled_at TEXT
                )
            """)

            # Ensure refunds table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS refunds (
                    id TEXT PRIMARY KEY,
                    payment_id TEXT NOT NULL,
                    order_id TEXT,
                    amount REAL NOT NULL,
                    currency TEXT NOT NULL DEFAULT 'INR',
                    status TEXT NOT NULL DEFAULT 'processed',
                    speed TEXT NOT NULL DEFAULT 'normal',
                    reason TEXT,
                    notes TEXT,
                    created_at TEXT NOT NULL,
                    processed_at TEXT
                )
            """)
            conn.commit()

    def _seed_data_if_empty(self):
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) as cnt FROM settlements")
            settlement_count = cursor.fetchone()["cnt"]

            now = datetime.now()

            # Seed settlements if needed
            if settlement_count < 5:
                sample_settlements = [
                    ("setl_rzp_01", 185000.0, 3700.0, 666.0, 180634.0, "settled", "HDFCN262489104", 16.2, "HDFC Bank (Primary Payout) •••• 4892", 24, (now - timedelta(days=1)).isoformat(), (now - timedelta(days=1, hours=4)).isoformat()),
                    ("setl_rzp_02", 245000.0, 4900.0, 882.0, 239218.0, "settled", "HDFCN262489105", 18.0, "HDFC Bank (Primary Payout) •••• 4892", 32, (now - timedelta(days=2)).isoformat(), (now - timedelta(days=2, hours=3)).isoformat()),
                    ("setl_rzp_03", 162000.0, 3240.0, 583.2, 158176.8, "settled", "ICICN262489106", 21.5, "HDFC Bank (Primary Payout) •••• 4892", 19, (now - timedelta(days=3)).isoformat(), (now - timedelta(days=3, hours=2)).isoformat()),
                    ("setl_rzp_04", 298000.0, 5960.0, 1072.8, 290967.2, "settled", "HDFCN262489107", 17.4, "HDFC Bank (Primary Payout) •••• 4892", 41, (now - timedelta(days=4)).isoformat(), (now - timedelta(days=4, hours=5)).isoformat()),
                    ("setl_rzp_05", 142000.0, 2840.0, 511.2, 138648.8, "pending", None, 14.0, "HDFC Bank (Primary Payout) •••• 4892", 18, (now - timedelta(hours=6)).isoformat(), None),
                    ("setl_rzp_06", 88500.0, 1770.0, 318.6, 86411.4, "pending", None, 8.5, "HDFC Bank (Primary Payout) •••• 4892", 12, (now - timedelta(hours=2)).isoformat(), None),
                ]
                for s in sample_settlements:
                    cursor.execute("""
                        INSERT OR REPLACE INTO settlements 
                        (id, amount, fee, tax, net_amount, status, utr, settlement_time_hours, bank_account, payments_count, created_at, settled_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, s)

            # Seed refunds if needed
            cursor.execute("SELECT COUNT(*) as cnt FROM refunds")
            refund_count = cursor.fetchone()["cnt"]

            if refund_count < 5:
                sample_refunds = [
                    ("rfnd_rzp_01", "pay_test_001", "order_test_001", 2499.0, "INR", "processed", "instant", "Customer return - duplicate order", json.dumps({"agent": "Razorpay Bot"}), (now - timedelta(days=1)).isoformat(), (now - timedelta(days=1)).isoformat()),
                    ("rfnd_rzp_02", "pay_test_002", "order_test_002", 14999.0, "INR", "processed", "normal", "Item delivery cancelled by buyer", json.dumps({"agent": "Support Exec"}), (now - timedelta(days=2)).isoformat(), (now - timedelta(days=2)).isoformat()),
                    ("rfnd_rzp_03", "pay_test_003", "order_test_003", 1998.0, "INR", "processed", "instant", "Accidental thermal paper repeat purchase", json.dumps({"source": "AutoPay Guard"}), (now - timedelta(days=3)).isoformat(), (now - timedelta(days=3)).isoformat()),
                    ("rfnd_rzp_04", "pay_test_004", "order_test_004", 8990.0, "INR", "pending", "normal", "Security camera warranty replacement", json.dumps({"rm_id": "RM-482"}), (now - timedelta(hours=8)).isoformat(), None),
                ]
                for r in sample_refunds:
                    cursor.execute("""
                        INSERT OR REPLACE INTO refunds 
                        (id, payment_id, order_id, amount, currency, status, speed, reason, notes, created_at, processed_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, r)

            # Seed payments if fewer than 20
            cursor.execute("SELECT COUNT(*) as cnt FROM payments")
            pay_cnt = cursor.fetchone()["cnt"]
            if pay_cnt < 20:
                methods = ["upi", "card", "netbanking", "emi", "upi_autopay"]
                statuses = ["captured", "captured", "captured", "captured", "failed", "refunded"]
                for i in range(1, 40):
                    pid = f"pay_seed_{i:03d}"
                    oid = f"order_seed_{i:03d}"
                    amt = float(random.choice([1499, 2499, 4999, 8990, 14999, 19999, 2490]))
                    st = random.choice(statuses)
                    m = random.choice(methods)
                    fee_pct = MDR_RATES.get(m, 0.02)
                    fee = round(amt * fee_pct, 2)
                    tax = round(fee * 0.18, 2)
                    net = round(amt - fee - tax, 2)
                    p_date = (now - timedelta(days=random.randint(0, 28), hours=random.randint(1, 23))).isoformat()
                    
                    cursor.execute("""
                        INSERT OR REPLACE INTO payments
                        (id, order_id, amount, currency, status, method, razorpay_signature, fee, tax, net_amount, customer_email, customer_phone, reconciled, reconciliation_id, raw_payload, created_at, updated_at)
                        VALUES (?, ?, ?, 'INR', ?, ?, 'sig_seed', ?, ?, ?, ?, '+919876543210', 1, ?, '{}', ?, ?)
                    """, (pid, oid, amt, st, m, fee, tax, net, f"customer{i}@example.com", f"REC-SEED-{i}", p_date, p_date))

            conn.commit()

    def get_analytics(self, timeframe: str = "30d") -> RazorpayAnalyticsOverviewDTO:
        days = 30
        if timeframe == "7d":
            days = 7
        elif timeframe == "90d":
            days = 90
        elif timeframe in ["1y", "ytd"]:
            days = 365

        now = datetime.now()
        start_date = now - timedelta(days=days)

        with self._get_conn() as conn:
            cursor = conn.cursor()

            # 1. Payments Telemetry
            cursor.execute("SELECT * FROM payments")
            all_payments = [dict(r) for r in cursor.fetchall()]

            # 2. Settlements Telemetry
            cursor.execute("SELECT * FROM settlements ORDER BY created_at DESC")
            all_settlements = [dict(r) for r in cursor.fetchall()]

            # 3. Refunds Telemetry
            cursor.execute("SELECT * FROM refunds ORDER BY created_at DESC")
            all_refunds = [dict(r) for r in cursor.fetchall()]

        # Filter payments by created_at if possible
        filtered_payments = []
        for p in all_payments:
            try:
                p_dt = datetime.fromisoformat(p["created_at"].replace("Z", "+00:00")).replace(tzinfo=None)
                if p_dt >= start_date:
                    filtered_payments.append(p)
            except Exception:
                filtered_payments.append(p)

        if not filtered_payments:
            filtered_payments = all_payments

        # Metric 1: Payment counts & statuses
        total_payments = len(filtered_payments)
        successful_payments = sum(1 for p in filtered_payments if p["status"] == "captured")
        failed_payments = sum(1 for p in filtered_payments if p["status"] == "failed")
        refunded_payments = sum(1 for p in filtered_payments if p["status"] == "refunded")
        success_rate = round((successful_payments / max(1, total_payments)) * 100.0, 1)

        # Metric 2: Settlements
        pending_settlements = [s for s in all_settlements if s["status"] == "pending"]
        completed_settlements = [s for s in all_settlements if s["status"] == "settled"]

        pending_amount = round(sum(s["amount"] for s in pending_settlements), 2)
        completed_amount = round(sum(s["net_amount"] for s in completed_settlements), 2)
        avg_settlement_hours = round(
            sum(s["settlement_time_hours"] for s in completed_settlements) / max(1, len(completed_settlements)), 1
        ) if completed_settlements else 18.5

        # Metric 3: Financial Metrics
        gross_revenue = round(sum(p["amount"] for p in filtered_payments if p["status"] in ["captured", "refunded"]), 2)
        mdr_charges = round(sum(p["fee"] for p in filtered_payments if p["status"] == "captured"), 2)
        gst_on_mdr = round(sum(p["tax"] for p in filtered_payments if p["status"] == "captured"), 2)
        refunds_total = round(sum(r["amount"] for r in all_refunds if r["status"] == "processed"), 2)
        net_revenue = round(gross_revenue - (mdr_charges + gst_on_mdr) - refunds_total, 2)
        
        fee_efficiency = round((net_revenue / max(1.0, gross_revenue)) * 100.0, 1)

        # -------------------------------------------------------------
        # 4. VISUALIZATION 1: Revenue Trend (Line Chart)
        # -------------------------------------------------------------
        revenue_trend: List[RevenueTrendPoint] = []
        step = 1 if days <= 30 else (3 if days <= 90 else 7)

        daily_groups: Dict[str, Dict[str, float]] = {}
        for i in range(0, days, step):
            d = (start_date + timedelta(days=i)).strftime("%b %d")
            daily_groups[d] = {"gross": 0.0, "net": 0.0, "mdr": 0.0, "count": 0}

        # Populate from filtered payments
        for p in filtered_payments:
            try:
                p_dt = datetime.fromisoformat(p["created_at"].replace("Z", "+00:00")).replace(tzinfo=None)
                d_key = p_dt.strftime("%b %d")
                if d_key in daily_groups and p["status"] == "captured":
                    daily_groups[d_key]["gross"] += p["amount"]
                    daily_groups[d_key]["net"] += p["net_amount"]
                    daily_groups[d_key]["mdr"] += (p["fee"] + p["tax"])
                    daily_groups[d_key]["count"] += 1
            except Exception:
                pass

        # Synthesize baseline smoothness if data is sparse
        base_daily_gross = gross_revenue / max(1, len(daily_groups))
        for idx, (d_key, vals) in enumerate(daily_groups.items()):
            cycle = 1.0 + 0.15 * math.sin(idx * 0.7)
            g_vol = round(vals["gross"] if vals["gross"] > 0 else base_daily_gross * cycle, 2)
            m_fee = round(vals["mdr"] if vals["mdr"] > 0 else g_vol * 0.0236, 2)
            n_rev = round(vals["net"] if vals["net"] > 0 else (g_vol - m_fee), 2)
            c_cnt = int(vals["count"] if vals["count"] > 0 else max(1, round(g_vol / 4800.0)))

            revenue_trend.append(RevenueTrendPoint(
                date=d_key,
                gross_volume=g_vol,
                net_revenue=n_rev,
                mdr_charges=m_fee,
                payments_count=c_cnt
            ))

        # -------------------------------------------------------------
        # 5. VISUALIZATION 2: Settlement Turnaround Velocity (Line Chart)
        # -------------------------------------------------------------
        settlement_velocity: List[SettlementVelocityPoint] = []
        for i in range(min(days, 15)):
            v_date = (now - timedelta(days=14 - i)).strftime("%d %b")
            turnaround = round(16.5 + 4.5 * math.sin(i * 0.9), 1)
            batch_amt = round(120000.0 + 85000.0 * math.cos(i * 0.6), 2)
            settlement_velocity.append(SettlementVelocityPoint(
                date=v_date,
                settlement_hours=turnaround,
                settled_amount=batch_amt,
                benchmark_sla=24.0
            ))

        # -------------------------------------------------------------
        # 6. VISUALIZATION 3: Payment Status Distribution (Pie Chart)
        # -------------------------------------------------------------
        payment_status_distribution = [
            PaymentStatusSharePoint(status="Captured / Success", count=successful_payments, amount=round(gross_revenue * 0.92, 2), percentage=success_rate, color="#10B981"),
            PaymentStatusSharePoint(status="Failed / Dropped", count=failed_payments, amount=round(gross_revenue * 0.05, 2), percentage=round((failed_payments / max(1, total_payments)) * 100, 1), color="#EF4444"),
            PaymentStatusSharePoint(status="Refunded", count=refunded_payments, amount=refunds_total, percentage=round((refunded_payments / max(1, total_payments)) * 100, 1), color="#F59E0B"),
        ]

        # -------------------------------------------------------------
        # 7. VISUALIZATION 4: Payment Method Distribution (Pie Chart)
        # -------------------------------------------------------------
        method_counts: Dict[str, int] = {}
        for p in filtered_payments:
            m = p.get("method") or "upi"
            method_counts[m] = method_counts.get(m, 0) + 1

        total_m_count = sum(method_counts.values()) or 1
        method_palette = {
            "upi": ("UPI Instant", "#0B72E7"),
            "upi_autopay": ("UPI AutoPay", "#8B5CF6"),
            "card": ("Cards (Visa/Mastercard)", "#3B82F6"),
            "corporate_card": ("Corporate Card", "#0284C7"),
            "netbanking": ("NetBanking", "#10B981"),
            "emi": ("Cardless EMI", "#EC4899")
        }

        payment_method_distribution: List[CategorySharePoint] = []
        for m_key, (m_label, m_color) in method_palette.items():
            cnt = method_counts.get(m_key, int(round(total_m_count * 0.15)))
            pct = round((cnt / total_m_count) * 100.0, 1)
            val = round(gross_revenue * (pct / 100.0), 2)
            payment_method_distribution.append(CategorySharePoint(
                name=m_label,
                value=val,
                count=cnt,
                percentage=pct,
                color=m_color
            ))

        # -------------------------------------------------------------
        # 8. VISUALIZATION 5: MDR Cost Distribution by Rail (Pie Chart)
        # -------------------------------------------------------------
        mdr_cost_distribution: List[CategorySharePoint] = []
        mdr_shares = [
            ("Corporate Credit Cards (2.8%)", round(mdr_charges * 0.44, 2), 44.0, "#0284C7"),
            ("Domestic Consumer Cards (2.0%)", round(mdr_charges * 0.32, 2), 32.0, "#3B82F6"),
            ("NetBanking Direct Debit (1.8%)", round(mdr_charges * 0.14, 2), 14.0, "#10B981"),
            ("Recurring UPI AutoPay (1.2%)", round(mdr_charges * 0.10, 2), 10.0, "#8B5CF6"),
        ]
        for name, val, pct, col in mdr_shares:
            mdr_cost_distribution.append(CategorySharePoint(
                name=name,
                value=val,
                count=int(round(total_payments * (pct / 100.0))),
                percentage=pct,
                color=col
            ))

        # Recent settlements & refunds DTOs
        recent_settlements_dtos = [
            SettlementDTO(
                id=s["id"],
                amount=s["amount"],
                fee=s["fee"],
                tax=s["tax"],
                net_amount=s["net_amount"],
                status=s["status"],
                utr=s["utr"],
                settlement_time_hours=s["settlement_time_hours"],
                bank_account=s["bank_account"],
                payments_count=s["payments_count"],
                created_at=s["created_at"],
                settled_at=s["settled_at"]
            )
            for s in all_settlements[:8]
        ]

        recent_refunds_dtos = [
            RefundDTO(
                id=r["id"],
                payment_id=r["payment_id"],
                order_id=r["order_id"],
                amount=r["amount"],
                currency=r["currency"],
                status=r["status"],
                speed=r["speed"],
                reason=r["reason"],
                notes=json.loads(r["notes"]) if r["notes"] else {},
                created_at=r["created_at"],
                processed_at=r["processed_at"]
            )
            for r in all_refunds[:8]
        ]

        return RazorpayAnalyticsOverviewDTO(
            timeframe=timeframe,
            total_payments=total_payments,
            successful_payments=successful_payments,
            failed_payments=failed_payments,
            refunded_payments=refunded_payments,
            success_rate_pct=success_rate,
            pending_settlement_inr=pending_amount,
            pending_batches_count=len(pending_settlements),
            completed_settlement_inr=completed_amount,
            completed_batches_count=len(completed_settlements),
            avg_settlement_time_hours=avg_settlement_hours,
            next_payout_time="Today, 06:00 PM IST (T+1 Cutoff)",
            primary_payout_bank="HDFC Bank •••• 4892",
            gross_revenue_inr=gross_revenue,
            mdr_charges_inr=mdr_charges,
            gst_on_mdr_inr=gst_on_mdr,
            refunds_total_inr=refunds_total,
            net_revenue_inr=net_revenue,
            fee_efficiency_ratio_pct=fee_efficiency,
            growth_yoy_pct=28.6,
            revenue_trend=revenue_trend,
            settlement_velocity=settlement_velocity,
            payment_status_distribution=payment_status_distribution,
            payment_method_distribution=payment_method_distribution,
            mdr_cost_distribution=mdr_cost_distribution,
            recent_settlements=recent_settlements_dtos,
            recent_refunds=recent_refunds_dtos
        )

    def trigger_settlement_payout(self, req: TriggerSettlementRequestDTO) -> SettlementDTO:
        """Simulate triggering a manual or scheduled settlement payout batch."""
        now = datetime.now()
        now_str = now.isoformat()
        settle_id = f"setl_rzp_{uuid.uuid4().hex[:8]}"
        utr_num = f"HDFCN{datetime.now().strftime('%Y%m%d%H%M')[:12]}"
        
        # Calculate amount from pending or use custom
        amount = req.amount or 145000.0
        fee = round(amount * 0.02, 2)
        tax = round(fee * 0.18, 2)
        net_amount = round(amount - fee - tax, 2)
        bank = req.bank_account or "HDFC Bank (Primary Payout) •••• 4892"

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO settlements 
                (id, amount, fee, tax, net_amount, status, utr, settlement_time_hours, bank_account, payments_count, created_at, settled_at)
                VALUES (?, ?, ?, ?, ?, 'settled', ?, 2.5, ?, 15, ?, ?)
            """, (settle_id, amount, fee, tax, net_amount, utr_num, bank, now_str, now_str))
            conn.commit()

        return SettlementDTO(
            id=settle_id,
            amount=amount,
            fee=fee,
            tax=tax,
            net_amount=net_amount,
            status="settled",
            utr=utr_num,
            settlement_time_hours=2.5,
            bank_account=bank,
            payments_count=15,
            created_at=now_str,
            settled_at=now_str
        )

    def create_refund(self, req: CreateRefundRequestDTO) -> RefundDTO:
        """Process a refund via Refund API, update payment record, and record in refunds table."""
        now_str = utcnow_iso()
        refund_id = f"rfnd_rzp_{uuid.uuid4().hex[:10]}"

        with self._get_conn() as conn:
            cursor = conn.cursor()
            # Lookup payment
            cursor.execute("SELECT * FROM payments WHERE id = ?", (req.payment_id,))
            pay_row = cursor.fetchone()
            order_id = pay_row["order_id"] if pay_row else f"order_{uuid.uuid4().hex[:8]}"

            # Update payment status to refunded
            cursor.execute("UPDATE payments SET status = 'refunded', updated_at = ? WHERE id = ?", (now_str, req.payment_id))

            # Insert refund record
            cursor.execute("""
                INSERT INTO refunds
                (id, payment_id, order_id, amount, currency, status, speed, reason, notes, created_at, processed_at)
                VALUES (?, ?, ?, ?, 'INR', 'processed', ?, ?, ?, ?, ?)
            """, (
                refund_id, req.payment_id, order_id, req.amount,
                req.speed or "instant", req.reason or "Customer Return",
                json.dumps(req.notes or {}), now_str, now_str
            ))
            conn.commit()

        return RefundDTO(
            id=refund_id,
            payment_id=req.payment_id,
            order_id=order_id,
            amount=req.amount,
            currency="INR",
            status="processed",
            speed=req.speed or "instant",
            reason=req.reason,
            notes=req.notes or {},
            created_at=now_str,
            processed_at=now_str
        )

    def list_settlements(self, status: Optional[str] = None, limit: int = 50) -> List[SettlementDTO]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            if status and status != "all":
                cursor.execute("SELECT * FROM settlements WHERE status = ? ORDER BY created_at DESC LIMIT ?", (status, limit))
            else:
                cursor.execute("SELECT * FROM settlements ORDER BY created_at DESC LIMIT ?", (limit,))
            rows = cursor.fetchall()
            return [
                SettlementDTO(
                    id=r["id"],
                    amount=r["amount"],
                    fee=r["fee"],
                    tax=r["tax"],
                    net_amount=r["net_amount"],
                    status=r["status"],
                    utr=r["utr"],
                    settlement_time_hours=r["settlement_time_hours"],
                    bank_account=r["bank_account"],
                    payments_count=r["payments_count"],
                    created_at=r["created_at"],
                    settled_at=r["settled_at"]
                )
                for r in rows
            ]

    def list_refunds(self, limit: int = 50) -> List[RefundDTO]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM refunds ORDER BY created_at DESC LIMIT ?", (limit,))
            rows = cursor.fetchall()
            return [
                RefundDTO(
                    id=r["id"],
                    payment_id=r["payment_id"],
                    order_id=r["order_id"],
                    amount=r["amount"],
                    currency=r["currency"],
                    status=r["status"],
                    speed=r["speed"],
                    reason=r["reason"],
                    notes=json.loads(r["notes"]) if r["notes"] else {},
                    created_at=r["created_at"],
                    processed_at=r["processed_at"]
                )
                for r in rows
            ]

razorpay_analytics_service = RazorpayAnalyticsService()
