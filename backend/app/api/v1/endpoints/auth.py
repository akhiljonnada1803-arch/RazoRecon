from fastapi import APIRouter, HTTPException, Depends, Header
from typing import List, Optional
from app.schemas.auth import (
    LoginRequestDTO, 
    LoginResponseDTO, 
    UserDTO, 
    OrganizationDTO, 
    SwitchOrgRequestDTO,
    RegisterRequestDTO,
    RegisterResponseDTO,
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
            detail="Invalid email or password."
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
def get_current_user(authorization: Optional[str] = Header(None)):
    """Retrieve active authenticated user profile & RBAC permissions from SQLite database."""
    if authorization:
        user = auth_service.verify_token(authorization)
        if user:
            return user
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

@router.post("/register", response_model=RegisterResponseDTO, status_code=201)
def register(payload: RegisterRequestDTO):
    """Register a new merchant or customer account with genuine database persistence."""
    try:
        if payload.role and payload.role.strip().lower() in ("customer", "role_customer"):
            return auth_service.register_customer(
                name=payload.name or payload.business_name or "Valued Customer",
                email=payload.email,
                password=payload.password,
                company=payload.organization_name or payload.business_name
            )
        business_name = payload.business_name or payload.organization_name or payload.name or ""
        return auth_service.register_merchant(
            business_name=business_name,
            email=payload.email,
            password=payload.password,
            gstin=payload.gstin
        )
    except ValueError as e:
        err_msg = str(e)
        status_code = 409 if err_msg == "EMAIL_ALREADY_EXISTS" else 400
        raise HTTPException(status_code=status_code, detail=err_msg)

@router.post("/register-customer", response_model=RegisterResponseDTO, status_code=201)
def register_customer(payload: RegisterRequestDTO):
    """Register a new customer account with genuine database persistence."""
    try:
        return auth_service.register_customer(
            name=payload.name or payload.business_name or "Valued Customer",
            email=payload.email,
            password=payload.password,
            company=payload.organization_name or payload.business_name
        )
    except ValueError as e:
        err_msg = str(e)
        status_code = 409 if err_msg == "EMAIL_ALREADY_EXISTS" else 400
        raise HTTPException(status_code=status_code, detail=err_msg)

@router.get("/organizations", response_model=List[OrganizationDTO])
def get_organizations():
    """Retrieve available merchant organizations."""
    return auth_service.list_organizations()

@router.post("/switch-org", response_model=UserDTO)
def switch_organization(payload: SwitchOrgRequestDTO):
    """Switch active merchant organization context."""
    return auth_service.switch_organization("controller@acme.com", payload.organization_name)
