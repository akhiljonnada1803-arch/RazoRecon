import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, r"c:\PROJECTS\RazoPay\financial-reconciliation-agent-main\backend")

from app.services.auth_service import auth_service, ROLE_PERMISSIONS_MAP

print("=== Testing 7 Roles & Permissions ===")

# Force re-seed
auth_service._seed_default_data()

roles = auth_service.list_roles()
print(f"Roles Count: {len(roles)}")
for r in roles:
    print(f" - [{r.id}] {r.name}: {len(r.permissions)} permissions ({', '.join(r.permissions[:3])}...)")

users = auth_service.list_users()
print(f"\nUsers Count: {len(users)}")
for u in users:
    print(f" - [{u.role}] {u.name} ({u.email}) - {len(u.permissions)} perms")

# Test authentication for all 7 users
print("\n=== Testing Login for All 7 Demo Personas ===")
test_emails = [
    "admin@razorcommerce.ai",
    "owner@acme.com",
    "ops@acme.com",
    "growth@acme.com",
    "controller@acme.com",
    "cfo@acme.com",
    "auditor@acme.com",
]

for email in test_emails:
    res = auth_service.authenticate_user(email, "demo123")
    assert res is not None, f"Failed login for {email}"
    print(f" Login OK: {res.user.role} ({res.user.email}) | Token: {res.access_token[:25]}...")

print("\n>>> ALL 7 RBAC ROLES & LOGINS WORKING FLAWLESSLY! <<<")
