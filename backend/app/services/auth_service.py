import sqlite3
import os
import uuid
import hmac
import hashlib
import base64
import json
import time
import secrets
from datetime import datetime
from typing import Optional, Dict, Any, List
from app.schemas.auth import (
    UserDTO, 
    LoginResponseDTO, 
    OrganizationDTO, 
    RoleDTO, 
    PermissionDTO, 
    AuditLogEntryDTO,
    AIAgentTelemetryDTO
)

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "auth.db")
SECRET_KEY = "razorrecon-ai-fintech-jwt-secret-key-2026"

PERMISSIONS_DEFINITIONS: List[Dict[str, str]] = [
    {"id": "perm_view_dashboard", "name": "VIEW_DASHBOARD", "description": "Access executive operations dashboard and core KPIs"},
    {"id": "perm_manage_catalog", "name": "MANAGE_CATALOG", "description": "Manage products, categories, stock, and pricing"},
    {"id": "perm_manage_orders", "name": "MANAGE_ORDERS", "description": "View and manage merchant orders and fulfillment"},
    {"id": "perm_view_customers", "name": "VIEW_CUSTOMERS", "description": "Access customer profiles, LTV, and AI purchase patterns"},
    {"id": "perm_manage_growth", "name": "MANAGE_GROWTH", "description": "Configure upsell engine, campaigns, and customer segments"},
    {"id": "perm_run_recon", "name": "RUN_RECONCILIATION", "description": "Execute deterministic multi-channel reconciliation ingestion"},
    {"id": "perm_view_exceptions", "name": "VIEW_EXCEPTIONS", "description": "View active ledger exceptions and pending review queues"},
    {"id": "perm_resolve_exceptions", "name": "RESOLVE_EXCEPTIONS", "description": "Approve, reclassify, or resolve accounting exception items"},
    {"id": "perm_view_vendor_intel", "name": "VIEW_VENDOR_INTELLIGENCE", "description": "Access counterparty risk ratings, memory patterns, and dossiers"},
    {"id": "perm_view_cfo_copilot", "name": "VIEW_CFO_COPILOT", "description": "Execute executive AI copilot strategic queries and financial briefings"},
    {"id": "perm_view_cash_forecast", "name": "VIEW_CASH_FORECAST", "description": "Access predictive liquidity projections and simulation engines"},
    {"id": "perm_view_audit_logs", "name": "VIEW_AUDIT_LOGS", "description": "Inspect chronological forensic compliance logs and operator trail"},
    {"id": "perm_close_books", "name": "CLOSE_BOOKS", "description": "Execute autonomous month-end financial close and ledger period locks"},
    {"id": "perm_manage_users", "name": "MANAGE_USERS", "description": "Create, modify, and assign enterprise operator accounts"},
    {"id": "perm_manage_roles", "name": "MANAGE_ROLES", "description": "Configure RBAC permission policies and access matrix"},
    {"id": "perm_manage_system", "name": "MANAGE_SYSTEM", "description": "Full system configuration, gateway endpoints, and platform overrides"},
]

ROLE_PERMISSIONS_MAP: Dict[str, List[str]] = {
    "role_controller": [
        "VIEW_DASHBOARD",
        "RUN_RECONCILIATION",
        "VIEW_EXCEPTIONS",
        "RESOLVE_EXCEPTIONS",
        "VIEW_VENDOR_INTELLIGENCE",
        "VIEW_CASH_FORECAST",
        "CLOSE_BOOKS",
        "VIEW_AUDIT_LOGS",
    ],
    "role_cfo": [
        "VIEW_DASHBOARD",
        "VIEW_VENDOR_INTELLIGENCE",
        "VIEW_CFO_COPILOT",
        "VIEW_CASH_FORECAST",
        "VIEW_AUDIT_LOGS",
        "MANAGE_GROWTH",
    ],
    "role_auditor": [
        "VIEW_DASHBOARD",
        "VIEW_EXCEPTIONS",
        "VIEW_VENDOR_INTELLIGENCE",
        "VIEW_AUDIT_LOGS",
    ],
    "role_revenue_manager": [
        "VIEW_DASHBOARD",
        "MANAGE_CATALOG",
        "MANAGE_ORDERS",
        "VIEW_CUSTOMERS",
        "MANAGE_GROWTH",
        "VIEW_AUDIT_LOGS",
    ],
    "role_ops_manager": [
        "VIEW_DASHBOARD",
        "MANAGE_CATALOG",
        "MANAGE_ORDERS",
        "VIEW_CUSTOMERS",
        "VIEW_AUDIT_LOGS",
    ],
    "role_admin": [
        "VIEW_DASHBOARD",
        "MANAGE_CATALOG",
        "MANAGE_ORDERS",
        "VIEW_CUSTOMERS",
        "MANAGE_GROWTH",
        "RUN_RECONCILIATION",
        "VIEW_EXCEPTIONS",
        "RESOLVE_EXCEPTIONS",
        "VIEW_VENDOR_INTELLIGENCE",
        "VIEW_CFO_COPILOT",
        "VIEW_CASH_FORECAST",
        "VIEW_AUDIT_LOGS",
        "CLOSE_BOOKS",
        "MANAGE_USERS",
        "MANAGE_ROLES",
        "MANAGE_SYSTEM",
    ],
}

class AuthService:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self._init_tables()
        self._seed_default_data()

    def _get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _hash_password(self, password: str, salt: str) -> str:
        return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000).hex()

    def _init_tables(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS organizations (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL UNIQUE,
                    industry TEXT NOT NULL,
                    merchant_id TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS roles (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL UNIQUE,
                    description TEXT NOT NULL
                )
            """)
            # Check permissions table schema
            cursor.execute("PRAGMA table_info(permissions)")
            perm_cols = [row[1] for row in cursor.fetchall()]
            if perm_cols and "description" not in perm_cols:
                cursor.execute("DROP TABLE IF EXISTS role_permissions")
                cursor.execute("DROP TABLE IF EXISTS permissions")

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS permissions (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL UNIQUE,
                    description TEXT NOT NULL
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS role_permissions (
                    role_id TEXT NOT NULL,
                    permission_id TEXT NOT NULL,
                    PRIMARY KEY(role_id, permission_id),
                    FOREIGN KEY(role_id) REFERENCES roles(id),
                    FOREIGN KEY(permission_id) REFERENCES permissions(id)
                )
            """)
            
            # Check users table schema
            cursor.execute("PRAGMA table_info(users)")
            columns = [row[1] for row in cursor.fetchall()]
            if columns and "role_id" not in columns:
                cursor.execute("DROP TABLE IF EXISTS users")

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    password_hash TEXT NOT NULL,
                    salt TEXT NOT NULL,
                    role_id TEXT NOT NULL,
                    organization_id TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY(role_id) REFERENCES roles(id),
                    FOREIGN KEY(organization_id) REFERENCES organizations(id)
                )
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id TEXT PRIMARY KEY,
                    user_name TEXT NOT NULL,
                    role TEXT NOT NULL,
                    action TEXT NOT NULL,
                    resource TEXT NOT NULL,
                    status TEXT NOT NULL,
                    timestamp TEXT NOT NULL
                )
            """)
            conn.commit()

    def _seed_default_data(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

            # 1. Seed Permissions
            for p in PERMISSIONS_DEFINITIONS:
                cursor.execute("""
                    INSERT OR REPLACE INTO permissions (id, name, description)
                    VALUES (?, ?, ?)
                """, (p["id"], p["name"], p["description"]))

            # 2. Seed Roles
            roles_data = [
                {
                    "id": "role_controller",
                    "name": "Finance Controller",
                    "description": "Responsible for reconciliation, exception handling, and month-end close."
                },
                {
                    "id": "role_cfo",
                    "name": "Chief Financial Officer (CFO)",
                    "description": "Executive user focused on financial health, risk, and strategic insights."
                },
                {
                    "id": "role_auditor",
                    "name": "Auditor",
                    "description": "Read-only user responsible for compliance, audit trails, and investigations."
                },
                {
                    "id": "role_revenue_manager",
                    "name": "Revenue Manager",
                    "description": "Oversees commerce catalog, orders, upsell engine, campaigns, and customer segmentation."
                },
                {
                    "id": "role_ops_manager",
                    "name": "Operations Manager",
                    "description": "Manages catalog inventory, order fulfillment, refund operations, and integrations."
                },
                {
                    "id": "role_admin",
                    "name": "Platform Admin",
                    "description": "Full system administrator with unrestricted security policy access."
                },
            ]
            for r in roles_data:
                cursor.execute("""
                    INSERT OR REPLACE INTO roles (id, name, description)
                    VALUES (?, ?, ?)
                """, (r["id"], r["name"], r["description"]))

            # 3. Seed Role-Permissions
            for role_id, perm_names in ROLE_PERMISSIONS_MAP.items():
                for p_name in perm_names:
                    p_def = next((x for x in PERMISSIONS_DEFINITIONS if x["name"] == p_name), None)
                    if p_def:
                        cursor.execute("""
                            INSERT OR REPLACE INTO role_permissions (role_id, permission_id)
                            VALUES (?, ?)
                        """, (role_id, p_def["id"]))

            # 4. Seed Organizations
            orgs = [
                {"id": "org_acme_corp", "name": "Acme Direct Corp", "industry": "D2C E-Commerce & Retail", "merchant_id": "rzp_live_acme_8842"},
                {"id": "org_razorpay_ops", "name": "Razorpay Merchant Ops", "industry": "Fintech & Payments Platform", "merchant_id": "rzp_live_ops_9921"},
                {"id": "org_startup_fin", "name": "Startup Finance Team", "industry": "B2B SaaS Subscriptions", "merchant_id": "rzp_test_start_3310"},
            ]
            for o in orgs:
                cursor.execute("""
                    INSERT OR REPLACE INTO organizations (id, name, industry, merchant_id, created_at)
                    VALUES (?, ?, ?, ?, ?)
                """, (o["id"], o["name"], o["industry"], o["merchant_id"], now_str))

            # 5. Seed Users
            seed_users = [
                {
                    "id": "usr_controller_01",
                    "name": "Finance Controller",
                    "email": "controller@acme.com",
                    "password": "demo123",
                    "role_id": "role_controller",
                    "org_id": "org_acme_corp"
                },
                {
                    "id": "usr_cfo_02",
                    "name": "Chief Financial Officer",
                    "email": "cfo@acme.com",
                    "password": "demo123",
                    "role_id": "role_cfo",
                    "org_id": "org_acme_corp"
                },
                {
                    "id": "usr_auditor_03",
                    "name": "Senior Auditor",
                    "email": "auditor@acme.com",
                    "password": "demo123",
                    "role_id": "role_auditor",
                    "org_id": "org_acme_corp"
                },
                {
                    "id": "usr_rev_mgr_05",
                    "name": "Revenue Growth Manager",
                    "email": "growth@razorcommerce.ai",
                    "password": "demo123",
                    "role_id": "role_revenue_manager",
                    "org_id": "org_acme_corp"
                },
                {
                    "id": "usr_ops_mgr_06",
                    "name": "Operations Manager",
                    "email": "ops@razorcommerce.ai",
                    "password": "demo123",
                    "role_id": "role_ops_manager",
                    "org_id": "org_acme_corp"
                },
                {
                    "id": "usr_admin_04",
                    "name": "Platform Admin",
                    "email": "admin@razorrecon.ai",
                    "password": "demo123",
                    "role_id": "role_admin",
                    "org_id": "org_acme_corp"
                }
            ]

            for u in seed_users:
                salt = secrets.token_hex(16)
                pwd_hash = self._hash_password(u["password"], salt)
                cursor.execute("""
                    INSERT OR REPLACE INTO users (id, name, email, password_hash, salt, role_id, organization_id, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (u["id"], u["name"], u["email"], pwd_hash, salt, u["role_id"], u["org_id"], now_str))

            # 6. Seed Audit Logs demonstrating both human actors and the non-human AI Finance Agent
            cursor.execute("SELECT COUNT(*) as cnt FROM audit_logs")
            if cursor.fetchone()["cnt"] == 0:
                audit_seeds = [
                    ("log_01", "Autonomous AI Finance Agent", "AI System Actor", "Reconciled 500 Razorpay batch transactions (94.0% match rate)", "Reconciliation Engine", "SUCCESS", "2026-09-03 22:45:10 UTC"),
                    ("log_02", "Finance Controller", "Finance Controller", "Closed books for March 2026 accounting period", "Month-End Close Agent", "SUCCESS", "2026-09-03 22:50:32 UTC"),
                    ("log_03", "Autonomous AI Finance Agent", "AI System Actor", "Updated Vendor Memory profile for ABC Logistics (+4 risk pts)", "Memory Engine", "SUCCESS", "2026-09-03 23:01:14 UTC"),
                    ("log_04", "Chief Financial Officer", "Chief Financial Officer (CFO)", "Queried CFO Copilot for 30-day runway sensitivity forecast", "CFO AI Copilot", "SUCCESS", "2026-09-03 23:15:20 UTC"),
                    ("log_05", "Senior Auditor", "Auditor", "Inspected ABC Logistics forensic exception dossier & GST classification", "Vendor Intelligence", "SUCCESS", "2026-09-03 23:28:45 UTC"),
                    ("log_06", "Platform Admin", "Platform Admin", "Verified multi-tenant RBAC policies across Acme Direct Corp", "RBAC Policy Engine", "SUCCESS", "2026-09-03 23:40:02 UTC"),
                ]
                for l in audit_seeds:
                    cursor.execute("""
                        INSERT INTO audit_logs (id, user_name, role, action, resource, status, timestamp)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, l)

            conn.commit()

    def _generate_jwt(self, user_dto: UserDTO, remember_me: bool = False) -> str:
        header = {"alg": "HS256", "typ": "JWT"}
        header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
        
        duration = (86400 * 30) if remember_me else (86400 * 7)
        payload = {
            "sub": user_dto.id,
            "email": user_dto.email,
            "name": user_dto.name,
            "role": user_dto.role,
            "role_id": user_dto.role_id,
            "org_id": user_dto.organization_id,
            "company": user_dto.company,
            "permissions": user_dto.permissions,
            "exp": int(time.time()) + duration
        }
        payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")

        signature = hmac.new(
            SECRET_KEY.encode(),
            f"{header_b64}.{payload_b64}".encode(),
            hashlib.sha256
        ).digest()
        sig_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")

        return f"{header_b64}.{payload_b64}.{sig_b64}"

    def get_user_dto(self, user_row: sqlite3.Row) -> UserDTO:
        role_id = user_row["role_id"]
        perms = ROLE_PERMISSIONS_MAP.get(role_id, [])

        return UserDTO(
            id=user_row["id"],
            name=user_row["name"],
            email=user_row["email"],
            role=user_row["role_name"],
            role_id=role_id,
            organization_id=user_row["organization_id"],
            company=user_row["company"],
            merchant_id=user_row["merchant_id"],
            created_at=user_row["created_at"],
            permissions=perms
        )

    def authenticate_user(self, email: str, password: str, remember_me: bool = False) -> Optional[LoginResponseDTO]:
        email_clean = email.strip().lower()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT u.*, r.name as role_name, o.name as company, o.merchant_id
                FROM users u
                JOIN roles r ON u.role_id = r.id
                JOIN organizations o ON u.organization_id = o.id
                WHERE LOWER(u.email) = ?
            """, (email_clean,))
            row = cursor.fetchone()

            if not row:
                return None

            expected_hash = self._hash_password(password, row["salt"])
            if not hmac.compare_digest(expected_hash, row["password_hash"]):
                return None

            user_dto = self.get_user_dto(row)
            token = self._generate_jwt(user_dto, remember_me=remember_me)

            return LoginResponseDTO(
                access_token=token,
                token_type="bearer",
                user=user_dto
            )

    def quick_switch_user(self, email: str) -> Optional[LoginResponseDTO]:
        email_clean = email.strip().lower()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT u.*, r.name as role_name, o.name as company, o.merchant_id
                FROM users u
                JOIN roles r ON u.role_id = r.id
                JOIN organizations o ON u.organization_id = o.id
                WHERE LOWER(u.email) = ?
            """, (email_clean,))
            row = cursor.fetchone()

            if not row:
                return None

            user_dto = self.get_user_dto(row)
            token = self._generate_jwt(user_dto, remember_me=True)

            return LoginResponseDTO(
                access_token=token,
                token_type="bearer",
                user=user_dto
            )

    def get_current_user_profile(self, email: Optional[str] = None) -> UserDTO:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            target_email = email.strip().lower() if email else "controller@acme.com"
            cursor.execute("""
                SELECT u.*, r.name as role_name, o.name as company, o.merchant_id
                FROM users u
                JOIN roles r ON u.role_id = r.id
                JOIN organizations o ON u.organization_id = o.id
                WHERE LOWER(u.email) = ?
            """, (target_email,))
            row = cursor.fetchone()

            if row:
                return self.get_user_dto(row)

            # Fallback
            cursor.execute("""
                SELECT u.*, r.name as role_name, o.name as company, o.merchant_id
                FROM users u
                JOIN roles r ON u.role_id = r.id
                JOIN organizations o ON u.organization_id = o.id
                WHERE u.id = 'usr_controller_01'
            """)
            fallback = cursor.fetchone()
            return self.get_user_dto(fallback)

    def list_users(self) -> List[UserDTO]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT u.*, r.name as role_name, o.name as company, o.merchant_id
                FROM users u
                JOIN roles r ON u.role_id = r.id
                JOIN organizations o ON u.organization_id = o.id
                ORDER BY u.created_at ASC
            """)
            rows = cursor.fetchall()
            return [self.get_user_dto(r) for r in rows]

    def list_roles(self) -> List[RoleDTO]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM roles")
            rows = cursor.fetchall()
            return [
                RoleDTO(
                    id=r["id"],
                    name=r["name"],
                    description=r["description"],
                    permissions=ROLE_PERMISSIONS_MAP.get(r["id"], [])
                ) for r in rows
            ]

    def list_permissions(self) -> List[PermissionDTO]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM permissions")
            rows = cursor.fetchall()
            return [
                PermissionDTO(
                    id=r["id"],
                    name=r["name"],
                    description=r["description"]
                ) for r in rows
            ]

    def list_audit_logs(self, limit: int = 50) -> List[AuditLogEntryDTO]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?", (limit,))
            rows = cursor.fetchall()
            return [
                AuditLogEntryDTO(
                    id=r["id"],
                    user_name=r["user_name"],
                    role=r["role"],
                    action=r["action"],
                    resource=r["resource"],
                    status=r["status"],
                    timestamp=r["timestamp"]
                ) for r in rows
            ]

    def log_audit_event(self, user_name: str, role: str, action: str, resource: str, status: str = "SUCCESS") -> AuditLogEntryDTO:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            log_id = f"log_{uuid.uuid4().hex[:8]}"
            now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
            cursor.execute("""
                INSERT INTO audit_logs (id, user_name, role, action, resource, status, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (log_id, user_name, role, action, resource, status, now_str))
            conn.commit()

            return AuditLogEntryDTO(
                id=log_id,
                user_name=user_name,
                role=role,
                action=action,
                resource=resource,
                status=status,
                timestamp=now_str
            )

    def get_ai_agent_status(self) -> AIAgentTelemetryDTO:
        return AIAgentTelemetryDTO(
            agent_name="Autonomous AI Finance Agent",
            status="ACTIVE",
            transactions_processed=500,
            match_rate=94.0,
            exceptions_escalated=30,
            memory_engine_status="ACTIVE & SYNCED",
            risk_engine_status="ACTIVE (22 PROFILES SCORED)",
            last_reconciliation=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        )

    def list_organizations(self, active_org_name: str = "Acme Direct Corp") -> List[OrganizationDTO]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM organizations ORDER BY created_at ASC")
            rows = cursor.fetchall()
            return [
                OrganizationDTO(
                    id=r["id"],
                    name=r["name"],
                    industry=r["industry"],
                    merchant_id=r["merchant_id"],
                    is_active=(r["name"] == active_org_name),
                    created_at=r["created_at"]
                ) for r in rows
            ]

    def switch_organization(self, user_email: str, target_org_name: str) -> UserDTO:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, merchant_id FROM organizations WHERE name = ?", (target_org_name,))
            org_row = cursor.fetchone()
            if org_row:
                cursor.execute("UPDATE users SET organization_id = ? WHERE LOWER(email) = ?", (org_row["id"], user_email.lower()))
                conn.commit()

        return self.get_current_user_profile(user_email)

auth_service = AuthService()
