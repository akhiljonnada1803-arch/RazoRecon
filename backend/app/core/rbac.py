from fastapi import Header, HTTPException, Depends
from typing import Optional, Callable
from app.services.auth_service import auth_service

def require_permission(permission_name: str) -> Callable:
    """FastAPI dependency to enforce RBAC permissions on protected endpoints."""
    def dependency(authorization: Optional[str] = Header(default=None)):
        # For lightweight session inspection
        user = auth_service.get_current_user_profile()
        if not user:
            raise HTTPException(status_code=401, detail="Authentication required.")

        # Platform Admin bypasses all checks
        if user.role == "Platform Admin" or "MANAGE_SYSTEM" in user.permissions:
            return user

        if permission_name not in user.permissions:
            # Record unauthorized access breach attempt in audit logs
            auth_service.log_audit_event(
                user_name=user.name,
                role=user.role,
                action=f"Attempted unauthorized access requiring '{permission_name}'",
                resource="RBAC Sentinel",
                status="DENIED_403"
            )
            raise HTTPException(
                status_code=403,
                detail=f"Access Denied: Persona '{user.role}' lacks required permission '{permission_name}'."
            )

        return user

    return dependency
