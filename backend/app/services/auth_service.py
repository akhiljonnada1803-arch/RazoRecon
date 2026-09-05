import sqlite3
import os
import uuid
import hmac
import hashlib
import base64
import json
import time
import secrets
import re
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from app.schemas.auth import (
    UserDTO, 
    LoginResponseDTO, 
    RegisterResponseDTO,
    OrganizationDTO, 
    RoleDTO, 
    PermissionDTO, 
    AuditLogEntryDTO,
    AIAgentTelemetryDTO
)

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "auth.db")
SECRET_KEY = "razorcommerce-ai-fintech-jwt-secret-key-2026"

PERMISSIONS_DEFINITIONS: List[Dict[str, str]] = [
    {"id": "perm_manage_merchants", "name": "MANAGE_MERCHANTS", "description": "Manage merchant accounts and multi-tenant organizations"},
    {"id": "perm_manage_users", "name": "MANAGE_USERS", "description": "Manage platform user accounts and access controls"},
    {"id": "perm_manage_platform", "name": "MANAGE_PLATFORM_SETTINGS", "description": "Configure platform settings, webhooks, and integrations"},
    {"id": "perm_view_all_orders", "name": "VIEW_ALL_ORDERS", "description": "View all platform orders across all merchants"},
    {"id": "perm_view_analytics", "name": "VIEW_ANALYTICS", "description": "Access platform-wide revenue, conversion, and growth analytics"},
    {"id": "perm_manage_delivery_partners", "name": "MANAGE_DELIVERY_PARTNERS", "description": "Configure couriers and delivery partner integrations"},
    {"id": "perm_manage_agent_config", "name": "MANAGE_AGENT_CONFIG", "description": "Configure AI agent discovery, reasoning models, and toolsets"},
    {"id": "perm_manage_catalog", "name": "MANAGE_CATALOG", "description": "Manage product SKUs, descriptions, specs, and image uploads"},
    {"id": "perm_manage_inventory", "name": "MANAGE_INVENTORY", "description": "Manage stock levels, reorder thresholds, and warehouse logistics"},
    {"id": "perm_manage_pricing", "name": "MANAGE_PRICING", "description": "Configure product pricing, discounts, and tier rates"},
    {"id": "perm_manage_promotions", "name": "MANAGE_PROMOTIONS", "description": "Create AI campaigns, coupon codes, and basket affinity rules"},
    {"id": "perm_manage_orders", "name": "MANAGE_ORDERS", "description": "Accept, reject, pack, ship, and fulfill merchant orders"},
    {"id": "perm_assign_delivery", "name": "ASSIGN_DELIVERY_PARTNERS", "description": "Assign shipping couriers and generate tracking IDs"},
    {"id": "perm_view_merchant_analytics", "name": "VIEW_MERCHANT_ANALYTICS", "description": "View merchant revenue velocity, AOV, and customer LTV"},
    {"id": "perm_manage_merchant_settings", "name": "MANAGE_MERCHANT_SETTINGS", "description": "Configure merchant profile, Razorpay keys, and bank accounts"},
    {"id": "perm_update_shipment", "name": "UPDATE_SHIPMENT_STATUS", "description": "Update live shipment tracking status and courier milestones"},
    {"id": "perm_manage_logistics", "name": "MANAGE_LOGISTICS", "description": "Oversee warehouse packing queues and delivery partner handoffs"},
    {"id": "perm_browse_catalog", "name": "BROWSE_CATALOG", "description": "Search and discover catalog products across categories"},
    {"id": "perm_use_ai_assistant", "name": "USE_AI_SHOPPING_ASSISTANT", "description": "Interact with customer conversational commerce assistant"},
    {"id": "perm_place_orders", "name": "PLACE_ORDERS", "description": "Create carts, checkout with Razorpay, and place orders"},
    {"id": "perm_track_orders", "name": "TRACK_ORDERS", "description": "Track live order status, shipment milestones, and delivery timeline"},
    {"id": "perm_view_recommendations", "name": "VIEW_RECOMMENDATIONS", "description": "View personalized product recommendations and upsells"},
    {"id": "perm_manage_profile", "name": "MANAGE_PROFILE", "description": "Manage customer profile, shipping addresses, and preferences"},
    {"id": "perm_manage_wishlist", "name": "MANAGE_WISHLIST", "description": "Save favorite products and manage personal wishlist"},
    {"id": "perm_run_recon", "name": "RUN_RECONCILIATION", "description": "Execute 3-way multi-channel financial reconciliation"},
    {"id": "perm_view_audit_logs", "name": "VIEW_AUDIT_LOGS", "description": "Inspect immutable chronological forensic audit logs"},
]

ROLE_PERMISSIONS_MAP: Dict[str, List[str]] = {
    "role_platform_admin": [
        "MANAGE_MERCHANTS",
        "MANAGE_USERS",
        "MANAGE_PLATFORM_SETTINGS",
        "VIEW_ALL_ORDERS",
        "VIEW_ANALYTICS",
        "MANAGE_DELIVERY_PARTNERS",
        "MANAGE_AGENT_CONFIG",
        "MANAGE_CATALOG",
        "MANAGE_INVENTORY",
        "MANAGE_PRICING",
        "MANAGE_PROMOTIONS",
        "MANAGE_ORDERS",
        "ASSIGN_DELIVERY_PARTNERS",
        "VIEW_MERCHANT_ANALYTICS",
        "MANAGE_MERCHANT_SETTINGS",
        "UPDATE_SHIPMENT_STATUS",
        "MANAGE_LOGISTICS",
        "BROWSE_CATALOG",
        "USE_AI_SHOPPING_ASSISTANT",
        "PLACE_ORDERS",
        "TRACK_ORDERS",
        "VIEW_RECOMMENDATIONS",
        "MANAGE_PROFILE",
        "MANAGE_WISHLIST",
        "RUN_RECONCILIATION",
        "VIEW_AUDIT_LOGS",
    ],
    "role_merchant_owner": [
        "MANAGE_CATALOG",
        "MANAGE_INVENTORY",
        "MANAGE_PRICING",
        "MANAGE_PROMOTIONS",
        "MANAGE_ORDERS",
        "ASSIGN_DELIVERY_PARTNERS",
        "VIEW_MERCHANT_ANALYTICS",
        "MANAGE_MERCHANT_SETTINGS",
        "UPDATE_SHIPMENT_STATUS",
        "MANAGE_LOGISTICS",
        "RUN_RECONCILIATION",
        "VIEW_AUDIT_LOGS",
    ],
    "role_operations_manager": [
        "MANAGE_ORDERS",
        "UPDATE_SHIPMENT_STATUS",
        "MANAGE_LOGISTICS",
        "ASSIGN_DELIVERY_PARTNERS",
        "MANAGE_INVENTORY",
        "VIEW_AUDIT_LOGS",
    ],
    "role_customer": [
        "BROWSE_CATALOG",
        "USE_AI_SHOPPING_ASSISTANT",
        "PLACE_ORDERS",
        "TRACK_ORDERS",
        "VIEW_RECOMMENDATIONS",
        "MANAGE_PROFILE",
        "MANAGE_WISHLIST",
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
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    password_hash TEXT NOT NULL,
                    hashed_password TEXT,
                    salt TEXT NOT NULL,
                    role_id TEXT NOT NULL,
                    organization_id TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY(role_id) REFERENCES roles(id),
                    FOREIGN KEY(organization_id) REFERENCES organizations(id)
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS merchants (
                    merchant_id TEXT PRIMARY KEY,
                    business_name TEXT NOT NULL,
                    gstin TEXT,
                    owner_user_id TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'ACTIVE',
                    is_demo_account INTEGER NOT NULL DEFAULT 0,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY(owner_user_id) REFERENCES users(id)
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
            # Migration check: ensure hashed_password column exists in users
            cursor.execute("PRAGMA table_info(users)")
            user_cols = [c["name"] for c in cursor.fetchall()]
            if "hashed_password" not in user_cols:
                cursor.execute("ALTER TABLE users ADD COLUMN hashed_password TEXT")

            # Migration check: ensure is_demo_account column exists in merchants
            cursor.execute("PRAGMA table_info(merchants)")
            merchant_cols = [c["name"] for c in cursor.fetchall()]
            if "is_demo_account" not in merchant_cols:
                cursor.execute("ALTER TABLE merchants ADD COLUMN is_demo_account INTEGER NOT NULL DEFAULT 0")

            # Seed core security definitions so system is independent of demo seeds
            self._init_core_security(cursor)
            conn.commit()

    def _init_core_security(self, cursor: sqlite3.Cursor):
        """Always ensure core permissions, roles, demo merchant, and bindings exist regardless of demo seed."""
        # Ensure demo merchant is recognized as a demo account
        cursor.execute("""
            INSERT OR REPLACE INTO merchants (merchant_id, business_name, gstin, owner_user_id, status, is_demo_account, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, ("rzp_live_acme_8842", "Acme Direct Corp", "29AAAAA0000A1Z5", "usr_merchant_owner", "ACTIVE", 1, "2026-01-01 00:00:00 UTC"))

        for p in PERMISSIONS_DEFINITIONS:
            cursor.execute("""
                INSERT OR REPLACE INTO permissions (id, name, description)
                VALUES (?, ?, ?)
            """, (p["id"], p["name"], p["description"]))

        roles_data = [
            {
                "id": "role_platform_admin",
                "name": "Platform Admin",
                "description": "Full platform administrator managing merchants, users, platform settings, delivery partners, and AI configurations."
            },
            {
                "id": "role_merchant_owner",
                "name": "Merchant Owner",
                "description": "Merchant owner managing product catalog, inventory, pricing, promotions, order acceptance, and revenue analytics."
            },
            {
                "id": "role_operations_manager",
                "name": "Operations Manager",
                "description": "Fulfillment operator viewing orders, packing, updating shipment statuses, and managing delivery logistics."
            },
            {
                "id": "role_customer",
                "name": "Customer",
                "description": "AI-empowered customer browsing products, using conversational shopping assistant, placing orders, and tracking shipments."
            },
        ]
        for r in roles_data:
            cursor.execute("""
                INSERT OR REPLACE INTO roles (id, name, description)
                VALUES (?, ?, ?)
            """, (r["id"], r["name"], r["description"]))

        for role_id, perm_names in ROLE_PERMISSIONS_MAP.items():
            for p_name in perm_names:
                p_def = next((x for x in PERMISSIONS_DEFINITIONS if x["name"] == p_name), None)
                if p_def:
                    cursor.execute("""
                        INSERT OR REPLACE INTO role_permissions (role_id, permission_id)
                        VALUES (?, ?)
                    """, (role_id, p_def["id"]))

    def _seed_default_data(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

            # Core security is already in _init_core_security

            # 4. Seed Organizations
            orgs = [
                {"id": "org_acme_corp", "name": "Acme Direct Corp", "industry": "D2C E-Commerce & Retail", "merchant_id": "rzp_live_acme_8842"},
                {"id": "org_razorpay_ops", "name": "Razorpay Merchant Ops", "industry": "Fintech & Payments Platform", "merchant_id": "rzp_live_ops_9921"},
                {"id": "org_consumer_hub", "name": "Consumer Commerce Network", "industry": "Retail & Consumer Goods", "merchant_id": "rzp_live_cust_1010"},
            ]
            for o in orgs:
                cursor.execute("""
                    INSERT OR REPLACE INTO organizations (id, name, industry, merchant_id, created_at)
                    VALUES (?, ?, ?, ?, ?)
                """, (o["id"], o["name"], o["industry"], o["merchant_id"], now_str))

            # 5. Seed 4 Core Persona Users
            seed_users = [
                {
                    "id": "usr_platform_admin",
                    "name": "Platform Administrator",
                    "email": "admin@razorcommerce.ai",
                    "password": "demo123",
                    "role_id": "role_platform_admin",
                    "org_id": "org_acme_corp"
                },
                {
                    "id": "usr_merchant_owner",
                    "name": "Rajesh Sharma (Merchant Owner)",
                    "email": "owner@acme.com",
                    "password": "demo123",
                    "role_id": "role_merchant_owner",
                    "org_id": "org_acme_corp"
                },
                {
                    "id": "usr_ops_manager",
                    "name": "Pooja Verma (Operations Manager)",
                    "email": "ops@acme.com",
                    "password": "demo123",
                    "role_id": "role_operations_manager",
                    "org_id": "org_acme_corp"
                },
                {
                    "id": "usr_customer",
                    "name": "Ananya Roy (Verified Customer)",
                    "email": "customer@acme.com",
                    "password": "demo123",
                    "role_id": "role_customer",
                    "org_id": "org_consumer_hub"
                },
            ]

            for u in seed_users:
                salt = secrets.token_hex(16)
                pwd_hash = self._hash_password(u["password"], salt)
                cursor.execute("""
                    INSERT OR REPLACE INTO users (id, name, email, password_hash, salt, role_id, organization_id, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (u["id"], u["name"], u["email"], pwd_hash, salt, u["role_id"], u["org_id"], now_str))

            # 6. Seed Initial Audit Logs
            cursor.execute("SELECT COUNT(*) as cnt FROM audit_logs")
            if cursor.fetchone()["cnt"] == 0:
                audit_seeds = [
                    ("log_01", "Ananya Roy (Customer)", "Customer", "Placed Order #ORD-8821 via AI Shopping Assistant (₹2,499)", "Checkout Engine", "SUCCESS", "2026-09-04 19:10:10 UTC"),
                    ("log_02", "Rajesh Sharma (Merchant Owner)", "Merchant Owner", "Accepted Order #ORD-8821 and published 50 AI-readable SKUs", "Order Management", "SUCCESS", "2026-09-04 19:15:22 UTC"),
                    ("log_03", "Pooja Verma (Operations Manager)", "Operations Manager", "Packed Order #ORD-8821 & Assigned Delhivery Courier (AWB: DLV882194)", "Shipping & Logistics", "SUCCESS", "2026-09-04 19:30:15 UTC"),
                    ("log_04", "Platform Administrator", "Platform Admin", "Configured AI Agent Discovery Context & Verified Webhook SLA", "Agent API Center", "SUCCESS", "2026-09-04 19:45:00 UTC"),
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
        role_str = "merchant_owner" if role_id == "role_merchant_owner" else user_row["role_name"]

        user_dict = dict(user_row)
        return UserDTO(
            id=user_dict.get("id", ""),
            name=user_dict.get("name", ""),
            email=user_dict.get("email", ""),
            role=role_str,
            role_id=role_id,
            organization_id=user_dict.get("organization_id", ""),
            company=user_dict.get("company", ""),
            merchant_id=user_dict.get("merchant_id", ""),
            created_at=user_dict.get("created_at", ""),
            permissions=perms
        )

    def register_merchant(
        self, 
        business_name: str, 
        email: str, 
        password: str, 
        gstin: Optional[str] = None
    ) -> RegisterResponseDTO:
        """Register a real merchant, creating records in users, merchants, and organizations tables."""
        # 1. Empty business name validation
        if not business_name or not business_name.strip():
            raise ValueError("EMPTY_BUSINESS_NAME")

        business_clean = business_name.strip()

        # 2. Invalid email format validation
        if not email or not email.strip():
            raise ValueError("INVALID_EMAIL_FORMAT")
        email_clean = email.strip().lower()
        email_regex = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
        if not re.match(email_regex, email_clean):
            raise ValueError("INVALID_EMAIL_FORMAT")

        # 3. Weak password validation
        if not password or len(password) < 6:
            raise ValueError("WEAK_PASSWORD")

        # 4. Invalid GSTIN validation (if provided)
        gstin_clean = None
        if gstin and gstin.strip():
            gstin_candidate = gstin.strip().upper()
            gstin_regex = r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
            if not re.match(gstin_regex, gstin_candidate):
                raise ValueError("INVALID_GSTIN")
            gstin_clean = gstin_candidate

        # 5. Duplicate email validation & database insertion
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM users WHERE LOWER(email) = ?", (email_clean,))
            if cursor.fetchone():
                raise ValueError("EMAIL_ALREADY_EXISTS")

            merchant_id = f"mer_{uuid.uuid4().hex[:12]}"
            user_id = f"usr_{uuid.uuid4().hex[:12]}"
            org_id = f"org_{merchant_id}"
            now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

            salt = secrets.token_hex(16)
            pwd_hash = self._hash_password(password, salt)

            # Insert Organization
            cursor.execute("""
                INSERT OR REPLACE INTO organizations (id, name, industry, merchant_id, created_at)
                VALUES (?, ?, ?, ?, ?)
            """, (org_id, business_clean, "D2C E-Commerce & Retail", merchant_id, now_str))

            # Insert User with both password_hash and hashed_password
            cursor.execute("""
                INSERT INTO users (id, name, email, password_hash, hashed_password, salt, role_id, organization_id, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (user_id, business_clean, email_clean, pwd_hash, pwd_hash, salt, "role_merchant_owner", org_id, now_str))

            # Insert Merchant (strictly real merchant with is_demo_account = 0)
            cursor.execute("""
                INSERT INTO merchants (merchant_id, business_name, gstin, owner_user_id, status, is_demo_account, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (merchant_id, business_clean, gstin_clean, user_id, "ACTIVE", 0, now_str))

            conn.commit()

        # Build User DTO and JWT Token for Auto-Login
        perms = ROLE_PERMISSIONS_MAP.get("role_merchant_owner", [])
        user_dto = UserDTO(
            id=user_id,
            name=business_clean,
            email=email_clean,
            company=business_clean,
            role="merchant_owner",
            role_id="role_merchant_owner",
            merchant_id=merchant_id,
            organization_id=org_id,
            created_at=now_str,
            permissions=perms
        )

        token = self._generate_jwt(user_dto)

        self.log_audit_event(
            user_name=business_clean,
            role="merchant_owner",
            action=f"Registered real merchant account for '{business_clean}' (Merchant ID: {merchant_id})",
            resource="Merchant Onboarding Engine"
        )

        return RegisterResponseDTO(
            merchant_id=merchant_id,
            email=email_clean,
            status="ACTIVE",
            business_name=business_clean,
            access_token=token,
            token_type="bearer",
            user=user_dto
        )

    def is_demo_merchant(self, merchant_id: Optional[str]) -> bool:
        """Determine if a merchant is a preloaded demo account or a real newly registered merchant."""
        if not merchant_id:
            return False
        if merchant_id in ("rzp_live_acme_8842", "mcht_acme_pos", "mcht_bharat_audio", "mcht_dahua_sec", "mcht_epson_pos", "mcht_novus_cloud"):
            return True
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT is_demo_account FROM merchants WHERE merchant_id = ?", (merchant_id,))
                row = cursor.fetchone()
                if row and row["is_demo_account"] == 1:
                    return True
        except Exception:
            pass
        return False


    def register_user(
        self, 
        name: Optional[str] = None, 
        email: str = "", 
        password: str = "", 
        role: Optional[str] = None, 
        org_name: Optional[str] = None,
        business_name: Optional[str] = None,
        gstin: Optional[str] = None
    ) -> RegisterResponseDTO:
        """Backwards compatible alias for merchant registration."""
        b_name = business_name or name or org_name or "Acme Merchant Corp"
        return self.register_merchant(
            business_name=b_name,
            email=email,
            password=password,
            gstin=gstin
        )

    def authenticate_user(self, email: str, password: str, remember_me: bool = False) -> Optional[LoginResponseDTO]:
        email_clean = email.strip().lower()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT u.*, r.name as role_name, o.name as company,
                       COALESCE(m.merchant_id, o.merchant_id) as merchant_id
                FROM users u
                JOIN roles r ON u.role_id = r.id
                JOIN organizations o ON u.organization_id = o.id
                LEFT JOIN merchants m ON m.owner_user_id = u.id
                WHERE LOWER(u.email) = ?
            """, (email_clean,))
            row = cursor.fetchone()

            if not row:
                return None

            expected_hash = self._hash_password(password, row["salt"])
            stored_hash = row["password_hash"] if row["password_hash"] else row["hashed_password"]
            if not hmac.compare_digest(expected_hash, stored_hash):
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
                SELECT u.*, r.name as role_name, o.name as company,
                       COALESCE(m.merchant_id, o.merchant_id) as merchant_id
                FROM users u
                JOIN roles r ON u.role_id = r.id
                JOIN organizations o ON u.organization_id = o.id
                LEFT JOIN merchants m ON m.owner_user_id = u.id
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
            target_email = email.strip().lower() if email else "owner@acme.com"
            cursor.execute("""
                SELECT u.*, r.name as role_name, o.name as company,
                       COALESCE(m.merchant_id, o.merchant_id) as merchant_id
                FROM users u
                JOIN roles r ON u.role_id = r.id
                JOIN organizations o ON u.organization_id = o.id
                LEFT JOIN merchants m ON m.owner_user_id = u.id
                WHERE LOWER(u.email) = ?
            """, (target_email,))
            row = cursor.fetchone()

            if row:
                return self.get_user_dto(row)

            cursor.execute("""
                SELECT u.*, r.name as role_name, o.name as company,
                       COALESCE(m.merchant_id, o.merchant_id) as merchant_id
                FROM users u
                JOIN roles r ON u.role_id = r.id
                JOIN organizations o ON u.organization_id = o.id
                LEFT JOIN merchants m ON m.owner_user_id = u.id
                LIMIT 1
            """)
            fallback = cursor.fetchone()
            return self.get_user_dto(fallback)

    def list_users(self) -> List[UserDTO]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT u.*, r.name as role_name, o.name as company,
                       COALESCE(m.merchant_id, o.merchant_id) as merchant_id
                FROM users u
                JOIN roles r ON u.role_id = r.id
                JOIN organizations o ON u.organization_id = o.id
                LEFT JOIN merchants m ON m.owner_user_id = u.id
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
            agent_name="Autonomous AI Commerce Agent",
            status="ACTIVE",
            transactions_processed=840,
            match_rate=99.2,
            exceptions_escalated=4,
            memory_engine_status="ACTIVE & SYNCED",
            risk_engine_status="ACTIVE (100 PROFILES SCORED)",
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

    def verify_token(self, token_str: str) -> Optional[UserDTO]:
        """Verify JWT token and retrieve corresponding user."""
        try:
            clean_token = token_str.replace("Bearer ", "").strip()
            parts = clean_token.split(".")
            if len(parts) != 3:
                return None
            header_b64, payload_b64, sig_b64 = parts
            
            # Verify HMAC SHA256 signature
            expected_sig = hmac.new(
                SECRET_KEY.encode(),
                f"{header_b64}.{payload_b64}".encode(),
                hashlib.sha256
            ).digest()
            expected_sig_b64 = base64.urlsafe_b64encode(expected_sig).decode().rstrip("=")
            if not hmac.compare_digest(sig_b64, expected_sig_b64):
                return None

            # Decode payload
            rem = len(payload_b64) % 4
            if rem > 0:
                payload_b64 += "=" * (4 - rem)
            payload = json.loads(base64.urlsafe_b64decode(payload_b64.encode()).decode())

            # Check expiration
            if payload.get("exp", 0) < time.time():
                return None

            user_id = payload.get("sub")
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT u.*, r.name as role_name, o.name as company, 
                           COALESCE(m.merchant_id, o.merchant_id) as merchant_id
                    FROM users u
                    JOIN roles r ON u.role_id = r.id
                    JOIN organizations o ON u.organization_id = o.id
                    LEFT JOIN merchants m ON m.owner_user_id = u.id
                    WHERE u.id = ?
                """, (user_id,))
                row = cursor.fetchone()
                if row:
                    return self.get_user_dto(row)
        except Exception:
            return None
        return None

    def get_user_by_id_or_email(self, identifier: str) -> Optional[UserDTO]:
        """Find user by unique ID or email."""
        clean_id = identifier.strip().lower()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT u.*, r.name as role_name, o.name as company, 
                       COALESCE(m.merchant_id, o.merchant_id) as merchant_id
                FROM users u
                JOIN roles r ON u.role_id = r.id
                JOIN organizations o ON u.organization_id = o.id
                LEFT JOIN merchants m ON m.owner_user_id = u.id
                WHERE LOWER(u.id) = ? OR LOWER(u.email) = ?
            """, (clean_id, clean_id))
            row = cursor.fetchone()
            if row:
                return self.get_user_dto(row)
        return None

auth_service = AuthService()

