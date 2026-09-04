import sqlite3
import os
import uuid
from datetime import datetime
from typing import List, Dict, Optional, Any
from app.schemas.memory import (
    VendorBehavioralProfileDTO, 
    ExceptionMemoryDTO, 
    VendorListResponseDTO,
    MemoryEventLogDTO
)

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "memory_engine.db")

class MemoryEngine:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self._init_tables()
        self._seed_default_memory()

    def _get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_tables(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS vendor_memory (
                    vendor_id TEXT PRIMARY KEY,
                    vendor_name TEXT NOT NULL,
                    total_transactions INTEGER DEFAULT 0,
                    total_exceptions INTEGER DEFAULT 0,
                    duplicate_payment_count INTEGER DEFAULT 0,
                    tax_mismatch_count INTEGER DEFAULT 0,
                    settlement_delay_count INTEGER DEFAULT 0,
                    avg_transaction_value REAL DEFAULT 0.0,
                    risk_score INTEGER DEFAULT 0,
                    trend TEXT DEFAULT 'Stable',
                    last_updated TEXT NOT NULL
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS exception_memory (
                    exception_id TEXT PRIMARY KEY,
                    vendor_id TEXT NOT NULL,
                    exception_type TEXT NOT NULL,
                    root_cause TEXT NOT NULL,
                    resolution TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    FOREIGN KEY(vendor_id) REFERENCES vendor_memory(vendor_id)
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS memory_event_logs (
                    event_id TEXT PRIMARY KEY,
                    vendor_id TEXT NOT NULL,
                    vendor_name TEXT NOT NULL,
                    trigger_event TEXT NOT NULL,
                    previous_risk INTEGER NOT NULL,
                    updated_risk INTEGER NOT NULL,
                    delta INTEGER NOT NULL,
                    trend TEXT NOT NULL,
                    exception_type TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    log_message TEXT NOT NULL
                )
            """)
            conn.commit()

    def _calculate_score(self, tx_count: int, exc_count: int, delays: int, taxes: int, dups: int) -> int:
        tx = max(1, tx_count)
        # 40% Exception Frequency
        f_exc = min(100.0, (exc_count / tx) * 100 * 3.5) * 0.40
        # 30% Settlement Delays
        f_delay = min(100.0, (delays / tx) * 100 * 4.0) * 0.30
        # 20% Tax Mismatches
        f_tax = min(100.0, (taxes / tx) * 100 * 5.0) * 0.20
        # 10% Duplicate Payments
        f_dup = min(100.0, dups * 50.0) * 0.10

        return min(100, max(0, int(round(f_exc + f_delay + f_tax + f_dup))))

    def _seed_default_memory(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) as cnt FROM vendor_memory")
            row = cursor.fetchone()
            if row and row["cnt"] > 0:
                return

            default_vendors = [
                {
                    "vendor_id": "VEND-ABC-LOGISTICS",
                    "vendor_name": "ABC Logistics",
                    "total_transactions": 245,
                    "total_exceptions": 18,
                    "duplicate_payment_count": 2,
                    "tax_mismatch_count": 4,
                    "settlement_delay_count": 12,
                    "avg_transaction_value": 4820.00,
                    "risk_score": 82,
                    "trend": "Increasing",
                    "last_updated": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                    "exceptions": [
                        {
                            "type": "Settlement Delay",
                            "root_cause": "Freight carrier invoice timing lag exceeding T+5 SLA",
                            "resolution": "Applied automated grace period buffer and requested carrier EDI sync."
                        },
                        {
                            "type": "Tax Mismatch",
                            "root_cause": "18% GST vs 12% freight composite supply rate discrepancy",
                            "resolution": "Reclassified under SAC 9965 (Goods Transport Agency) and adjusted input tax credit."
                        },
                        {
                            "type": "Duplicate Payment",
                            "root_cause": "Proforma and final tax invoice both processed in batch AP run",
                            "resolution": "Voided secondary proforma debit and initiated AP hold."
                        }
                    ],
                    "events": [
                        {
                            "trigger": "New Tax Mismatch",
                            "prev_risk": 76,
                            "new_risk": 82,
                            "delta": 6,
                            "trend": "Increasing",
                            "exc_type": "Tax Mismatch",
                            "msg": "Vendor: ABC Logistics | Previous Risk: 76 | New Tax Mismatch: +1 | Updated Risk: 82 (Trend: Increasing)"
                        },
                        {
                            "trigger": "Settlement Delay Detected",
                            "prev_risk": 72,
                            "new_risk": 76,
                            "delta": 4,
                            "trend": "Increasing",
                            "exc_type": "Settlement Delay",
                            "msg": "Vendor: ABC Logistics | Previous Risk: 72 | New Settlement Delay: +1 | Updated Risk: 76 (Trend: Increasing)"
                        }
                    ]
                },
                {
                    "vendor_id": "VEND-AWS-CLOUD",
                    "vendor_name": "Amazon Web Services AWS",
                    "total_transactions": 112,
                    "total_exceptions": 4,
                    "duplicate_payment_count": 3,
                    "tax_mismatch_count": 0,
                    "settlement_delay_count": 1,
                    "avg_transaction_value": 12500.00,
                    "risk_score": 48,
                    "trend": "Stable",
                    "last_updated": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                    "exceptions": [
                        {
                            "type": "Duplicate Debit",
                            "root_cause": "Auto-debit card retry triggered while direct ACH was clearing",
                            "resolution": "Initiated bank refund recall and placed secondary card charge on hold."
                        }
                    ],
                    "events": [
                        {
                            "trigger": "Duplicate Debit Intercepted",
                            "prev_risk": 42,
                            "new_risk": 48,
                            "delta": 6,
                            "trend": "Increasing",
                            "exc_type": "Duplicate Debit",
                            "msg": "Vendor: Amazon Web Services AWS | Previous Risk: 42 | Duplicate Debit: +1 | Updated Risk: 48 (Trend: Increasing)"
                        }
                    ]
                },
                {
                    "vendor_id": "VEND-AMAZON-SELLER",
                    "vendor_name": "Amazon Marketplace Seller Central",
                    "total_transactions": 86,
                    "total_exceptions": 14,
                    "duplicate_payment_count": 0,
                    "tax_mismatch_count": 2,
                    "settlement_delay_count": 12,
                    "avg_transaction_value": 21400.00,
                    "risk_score": 64,
                    "trend": "Decreasing",
                    "last_updated": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                    "exceptions": [
                        {
                            "type": "Rolling Reserve Hold",
                            "root_cause": "Tier-1 14-day rolling reserve held for customer return rate threshold",
                            "resolution": "Tracked unlock schedule for March 28 release; auto-posted reserve asset balance."
                        }
                    ],
                    "events": []
                },
                {
                    "vendor_id": "VEND-SHOPIFY-PAY",
                    "vendor_name": "Shopify DTC Payments",
                    "total_transactions": 190,
                    "total_exceptions": 1,
                    "duplicate_payment_count": 0,
                    "tax_mismatch_count": 1,
                    "settlement_delay_count": 0,
                    "avg_transaction_value": 14250.00,
                    "risk_score": 8,
                    "trend": "Decreasing",
                    "last_updated": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                    "exceptions": [
                        {
                            "type": "GST Netting Variance",
                            "root_cause": "Minor ₹100 GST rounding variance on gross settlement payout",
                            "resolution": "Auto-posted rounding difference to GST Clearing account."
                        }
                    ],
                    "events": []
                },
                {
                    "vendor_id": "VEND-ALPHA-TECH",
                    "vendor_name": "Alpha Tech Consulting LLC",
                    "total_transactions": 6,
                    "total_exceptions": 3,
                    "duplicate_payment_count": 1,
                    "tax_mismatch_count": 1,
                    "settlement_delay_count": 1,
                    "avg_transaction_value": 18500.00,
                    "risk_score": 92,
                    "trend": "Increasing",
                    "last_updated": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                    "exceptions": [
                        {
                            "type": "Unregistered Vendor Wire",
                            "root_cause": "Wire transfer requested without verified procurement master agreement",
                            "resolution": "Placed payment on regulatory hold pending GSTIN and vendor tax certificate."
                        }
                    ],
                    "events": [
                        {
                            "trigger": "Unregistered Vendor Wire Intercepted",
                            "prev_risk": 80,
                            "new_risk": 92,
                            "delta": 12,
                            "trend": "Increasing",
                            "exc_type": "Unregistered Vendor Wire",
                            "msg": "Vendor: Alpha Tech Consulting LLC | Previous Risk: 80 | New Wire Exception: +1 | Updated Risk: 92 (Trend: Increasing)"
                        }
                    ]
                }
            ]

            for v in default_vendors:
                cursor.execute("""
                    INSERT INTO vendor_memory (
                        vendor_id, vendor_name, total_transactions, total_exceptions,
                        duplicate_payment_count, tax_mismatch_count, settlement_delay_count,
                        avg_transaction_value, risk_score, trend, last_updated
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    v["vendor_id"], v["vendor_name"], v["total_transactions"], v["total_exceptions"],
                    v["duplicate_payment_count"], v["tax_mismatch_count"], v["settlement_delay_count"],
                    v["avg_transaction_value"], v["risk_score"], v["trend"], v["last_updated"]
                ))

                for exc in v.get("exceptions", []):
                    exc_id = f"EXC-MEM-{uuid.uuid4().hex[:8].upper()}"
                    cursor.execute("""
                        INSERT INTO exception_memory (
                            exception_id, vendor_id, exception_type, root_cause, resolution, timestamp
                        ) VALUES (?, ?, ?, ?, ?, ?)
                    """, (
                        exc_id, v["vendor_id"], exc["type"], exc["root_cause"], exc["resolution"],
                        v["last_updated"]
                    ))

                for evt in v.get("events", []):
                    evt_id = f"EVT-MEM-{uuid.uuid4().hex[:8].upper()}"
                    cursor.execute("""
                        INSERT INTO memory_event_logs (
                            event_id, vendor_id, vendor_name, trigger_event,
                            previous_risk, updated_risk, delta, trend,
                            exception_type, timestamp, log_message
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        evt_id, v["vendor_id"], v["vendor_name"], evt["trigger"],
                        evt["prev_risk"], evt["new_risk"], evt["delta"], evt["trend"],
                        evt["exc_type"], v["last_updated"], evt["msg"]
                    ))

            conn.commit()

    def update_memory(
        self,
        vendor_id: str,
        vendor_name: str,
        transaction_amount: float,
        has_exception: bool = False,
        exception_type: Optional[str] = None,
        root_cause: Optional[str] = None,
        resolution: Optional[str] = None,
    ) -> VendorBehavioralProfileDTO:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM vendor_memory WHERE vendor_id = ?", (vendor_id,))
            existing = cursor.fetchone()

            now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

            if existing:
                previous_risk = existing["risk_score"]
                tx_count = existing["total_transactions"] + 1
                exc_count = existing["total_exceptions"] + (1 if has_exception else 0)
                dup_count = existing["duplicate_payment_count"] + (1 if exception_type == "Duplicate Payment" else 0)
                tax_count = existing["tax_mismatch_count"] + (1 if exception_type == "Tax Mismatch" else 0)
                delay_count = existing["settlement_delay_count"] + (1 if exception_type == "Settlement Delay" else 0)

                old_avg = existing["avg_transaction_value"]
                new_avg = ((old_avg * (tx_count - 1)) + transaction_amount) / tx_count

                # Recalculate risk score using the integrated 4-factor risk model
                if has_exception:
                    calculated_risk = min(100, max(previous_risk + 4, self._calculate_score(tx_count, exc_count, delay_count, tax_count, dup_count)))
                else:
                    calculated_risk = max(0, min(previous_risk, self._calculate_score(tx_count, exc_count, delay_count, tax_count, dup_count)))

                delta = calculated_risk - previous_risk
                trend = "Increasing" if delta > 0 else ("Decreasing" if delta < 0 else "Stable")

                cursor.execute("""
                    UPDATE vendor_memory SET
                        vendor_name = ?, total_transactions = ?, total_exceptions = ?,
                        duplicate_payment_count = ?, tax_mismatch_count = ?, settlement_delay_count = ?,
                        avg_transaction_value = ?, risk_score = ?, trend = ?, last_updated = ?
                    WHERE vendor_id = ?
                """, (
                    vendor_name, tx_count, exc_count, dup_count, tax_count, delay_count,
                    new_avg, calculated_risk, trend, now_str, vendor_id
                ))
            else:
                previous_risk = 0
                tx_count = 1
                exc_count = 1 if has_exception else 0
                dup_count = 1 if exception_type == "Duplicate Payment" else 0
                tax_count = 1 if exception_type == "Tax Mismatch" else 0
                delay_count = 1 if exception_type == "Settlement Delay" else 0
                new_avg = transaction_amount
                calculated_risk = 60 if has_exception else 10
                delta = calculated_risk
                trend = "Stable"

                cursor.execute("""
                    INSERT INTO vendor_memory (
                        vendor_id, vendor_name, total_transactions, total_exceptions,
                        duplicate_payment_count, tax_mismatch_count, settlement_delay_count,
                        avg_transaction_value, risk_score, trend, last_updated
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    vendor_id, vendor_name, tx_count, exc_count,
                    dup_count, tax_count, delay_count,
                    new_avg, calculated_risk, trend, now_str
                ))

            if has_exception and exception_type:
                exc_id = f"EXC-MEM-{uuid.uuid4().hex[:8].upper()}"
                cursor.execute("""
                    INSERT INTO exception_memory (
                        exception_id, vendor_id, exception_type, root_cause, resolution, timestamp
                    ) VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    exc_id, vendor_id, exception_type, root_cause or "Automated reconciliation mismatch detected",
                    resolution or "Pending operator resolution", now_str
                ))

                # Log Memory & Risk Recalculation Event
                evt_id = f"EVT-MEM-{uuid.uuid4().hex[:8].upper()}"
                sign = f"+{delta}" if delta > 0 else str(delta)
                log_msg = f"Vendor: {vendor_name} | Previous Risk: {previous_risk} | New {exception_type}: {sign} | Updated Risk: {calculated_risk} (Trend: {trend})"

                cursor.execute("""
                    INSERT INTO memory_event_logs (
                        event_id, vendor_id, vendor_name, trigger_event,
                        previous_risk, updated_risk, delta, trend,
                        exception_type, timestamp, log_message
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    evt_id, vendor_id, vendor_name, f"New {exception_type}",
                    previous_risk, calculated_risk, delta, trend,
                    exception_type, now_str, log_msg
                ))

            conn.commit()

        return self.get_vendor_profile(vendor_id)

    def get_vendor_profile(self, vendor_id: str) -> Optional[VendorBehavioralProfileDTO]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM vendor_memory WHERE vendor_id = ?", (vendor_id,))
            row = cursor.fetchone()
            if not row:
                cursor.execute("SELECT * FROM vendor_memory WHERE vendor_name LIKE ?", (f"%{vendor_id}%",))
                row = cursor.fetchone()
                if not row:
                    return None

            cursor.execute("""
                SELECT * FROM exception_memory 
                WHERE vendor_id = ? 
                ORDER BY timestamp DESC 
                LIMIT 10
            """, (row["vendor_id"],))
            exc_rows = cursor.fetchall()

            recent_exceptions = [
                ExceptionMemoryDTO(
                    exception_id=e["exception_id"],
                    vendor_id=e["vendor_id"],
                    exception_type=e["exception_type"],
                    root_cause=e["root_cause"],
                    resolution=e["resolution"],
                    timestamp=e["timestamp"]
                ) for e in exc_rows
            ]

            cursor.execute("""
                SELECT * FROM memory_event_logs 
                WHERE vendor_id = ? 
                ORDER BY timestamp DESC 
                LIMIT 10
            """, (row["vendor_id"],))
            evt_rows = cursor.fetchall()

            recent_events = [
                MemoryEventLogDTO(
                    event_id=ev["event_id"],
                    vendor_id=ev["vendor_id"],
                    vendor=ev["vendor_name"],
                    trigger_event=ev["trigger_event"],
                    previous_risk=ev["previous_risk"],
                    updated_risk=ev["updated_risk"],
                    delta=ev["delta"],
                    trend=ev["trend"],
                    exception_type=ev["exception_type"],
                    timestamp=ev["timestamp"],
                    log_message=ev["log_message"]
                ) for ev in evt_rows
            ]

            top_issue = "None"
            counts = {
                "Settlement Delay": row["settlement_delay_count"],
                "Duplicate Payment": row["duplicate_payment_count"],
                "Tax Mismatch": row["tax_mismatch_count"]
            }
            sorted_issues = sorted(counts.items(), key=lambda x: x[1], reverse=True)
            if sorted_issues and sorted_issues[0][1] > 0:
                top_issue = sorted_issues[0][0]

            return VendorBehavioralProfileDTO(
                vendor_id=row["vendor_id"],
                vendor=row["vendor_name"],
                transactions=row["total_transactions"],
                exceptions=row["total_exceptions"],
                top_issue=top_issue,
                risk_score=row["risk_score"],
                trend=row["trend"],
                avg_transaction_value=round(row["avg_transaction_value"], 2),
                duplicate_payment_count=row["duplicate_payment_count"],
                tax_mismatch_count=row["tax_mismatch_count"],
                settlement_delay_count=row["settlement_delay_count"],
                last_updated=row["last_updated"],
                recent_exceptions=recent_exceptions,
                recent_events=recent_events
            )

    def get_all_vendors(self) -> VendorListResponseDTO:
        from app.services.data_state_service import data_state_service
        if not data_state_service.has_data():
            return VendorListResponseDTO(
                total_vendors_tracked=0,
                high_risk_vendors=0,
                profiles=[],
                latest_events=[]
            )

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT vendor_id FROM vendor_memory ORDER BY risk_score DESC")
            rows = cursor.fetchall()

            profiles = []
            high_risk = 0
            for r in rows:
                p = self.get_vendor_profile(r["vendor_id"])
                if p:
                    profiles.append(p)
                    if p.risk_score >= 70:
                        high_risk += 1

            cursor.execute("""
                SELECT * FROM memory_event_logs 
                ORDER BY timestamp DESC 
                LIMIT 20
            """)
            evt_rows = cursor.fetchall()

            latest_events = [
                MemoryEventLogDTO(
                    event_id=ev["event_id"],
                    vendor_id=ev["vendor_id"],
                    vendor=ev["vendor_name"],
                    trigger_event=ev["trigger_event"],
                    previous_risk=ev["previous_risk"],
                    updated_risk=ev["updated_risk"],
                    delta=ev["delta"],
                    trend=ev["trend"],
                    exception_type=ev["exception_type"],
                    timestamp=ev["timestamp"],
                    log_message=ev["log_message"]
                ) for ev in evt_rows
            ]

            return VendorListResponseDTO(
                total_vendors_tracked=len(profiles),
                high_risk_vendors=high_risk,
                profiles=profiles,
                latest_events=latest_events
            )

    def get_recent_event_logs(self, limit: int = 20) -> List[MemoryEventLogDTO]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM memory_event_logs ORDER BY timestamp DESC LIMIT ?", (limit,))
            rows = cursor.fetchall()
            return [
                MemoryEventLogDTO(
                    event_id=r["event_id"],
                    vendor_id=r["vendor_id"],
                    vendor=r["vendor_name"],
                    trigger_event=r["trigger_event"],
                    previous_risk=r["previous_risk"],
                    updated_risk=r["updated_risk"],
                    delta=r["delta"],
                    trend=r["trend"],
                    exception_type=r["exception_type"],
                    timestamp=r["timestamp"],
                    log_message=r["log_message"]
                ) for r in rows
            ]

memory_engine = MemoryEngine()
