from fastapi import APIRouter, HTTPException, Depends, Header
from typing import List, Optional
from app.schemas.auth import (
    LoginRequestDTO, 
    LoginResponseDTO, 
    UserDTO, 
    OrganizationDTO, 
    SwitchOrgRequestDTO,
    RegisterRequestDTO,
    QuickSwitchUserRequestDTO,
    RoleDTO,
    PermissionDTO,
    AuditLogEntryDTO,
    AIAgentTelemetryDTO
)
from app.services.auth_service import auth_service
from app.core.rbac import require_permission

router = APIRouter()

@router.post("/login", response_model=LoginResponseDTO)
def login(payload: LoginRequestDTO):
    """Authenticate user with email and password from SQLite database."""
    auth_resp = auth_service.authenticate_user(payload.email, payload.password, remember_me=payload.remember_me or False)
    if not auth_resp:
        raise HTTPException(
            status_code=401, 
            detail="Invalid email or password. Use demo accounts (controller@acme.com, cfo@acme.com, auditor@acme.com, admin@razorrecon.ai / demo123)"
        )
    auth_service.log_audit_event(
        user_name=auth_resp.user.name,
        role=auth_resp.user.role,
        action="Signed into financial operations workspace",
        resource="Authentication Engine"
    )
    return auth_resp

@router.post("/quick-switch", response_model=LoginResponseDTO)
def quick_switch_user(payload: QuickSwitchUserRequestDTO):
    """Demo quick-switch between roles (Controller, CFO, Auditor, Admin) without full logout."""
    auth_resp = auth_service.quick_switch_user(payload.email)
    if not auth_resp:
        raise HTTPException(status_code=404, detail=f"User with email '{payload.email}' not found.")
    
    auth_service.log_audit_event(
        user_name=auth_resp.user.name,
        role=auth_resp.user.role,
        action=f"Switched active demo persona to '{auth_resp.user.role}'",
        resource="RBAC Switcher"
    )
    return auth_resp

@router.post("/logout")
def logout():
    """Terminate authenticated session."""
    return {"status": "logged_out", "message": "Session terminated successfully."}

@router.get("/me", response_model=UserDTO)
def get_current_user():
    """Retrieve active authenticated user profile & RBAC permissions from SQLite database."""
    return auth_service.get_current_user_profile()

@router.get("/roles", response_model=List[RoleDTO])
def get_roles():
    """Retrieve list of enterprise RBAC roles and their granted permissions."""
    return auth_service.list_roles()

@router.get("/permissions", response_model=List[PermissionDTO])
def get_permissions():
    """Retrieve list of all granular system permissions."""
    return auth_service.list_permissions()

@router.get("/audit-logs", response_model=List[AuditLogEntryDTO])
def get_audit_logs():
    """Retrieve chronological audit trails showing human operators and the autonomous AI Finance Agent."""
    return auth_service.list_audit_logs(limit=50)

@router.get("/ai-agent-status", response_model=AIAgentTelemetryDTO)
def get_ai_agent_status():
    """Retrieve status and telemetry for the autonomous non-human AI Finance Agent."""
    return auth_service.get_ai_agent_status()

@router.post("/register", response_model=UserDTO)
def register(payload: RegisterRequestDTO):
    """Register a new enterprise operator in SQLite database."""
    return auth_service.register_user(
        name=payload.name,
        email=payload.email,
        password=payload.password,
        role=payload.role or "Finance Controller",
        org_name=payload.organization_name or "Acme Direct Corp"
    )

@router.get("/organizations", response_model=List[OrganizationDTO])
def get_organizations():
    """Retrieve available merchant organizations."""
    return auth_service.list_organizations()

@router.post("/switch-org", response_model=UserDTO)
def switch_organization(payload: SwitchOrgRequestDTO):
    """Switch active merchant organization context."""
    return auth_service.switch_organization("controller@acme.com", payload.organization_name)
