from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class PermissionDTO(BaseModel):
    id: str
    name: str
    description: str

class RoleDTO(BaseModel):
    id: str
    name: str
    description: str
    permissions: List[str]

class UserDTO(BaseModel):
    id: str
    name: str
    email: str
    role: str
    role_id: Optional[str] = None
    organization_id: str
    company: str
    merchant_id: str
    created_at: str
    permissions: List[str] = Field(default_factory=list)

class LoginRequestDTO(BaseModel):
    email: str = Field(..., example="controller@acme.com")
    password: str = Field(..., example="demo123")
    remember_me: Optional[bool] = False

class LoginResponseDTO(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserDTO

class RegisterRequestDTO(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "Finance Controller"
    organization_name: Optional[str] = "Acme Direct Corp"

class OrganizationDTO(BaseModel):
    id: str
    name: str
    industry: str
    merchant_id: str
    is_active: bool = False
    created_at: str

class SwitchOrgRequestDTO(BaseModel):
    organization_name: str

class QuickSwitchUserRequestDTO(BaseModel):
    email: str

class AuditLogEntryDTO(BaseModel):
    id: str
    user_name: str
    role: str
    action: str
    resource: str
    status: str = "SUCCESS"
    timestamp: str

class AIAgentTelemetryDTO(BaseModel):
    agent_name: str = "Autonomous AI Finance Agent"
    status: str = "ACTIVE"
    transactions_processed: int = 500
    match_rate: float = 94.0
    exceptions_escalated: int = 30
    memory_engine_status: str = "ACTIVE & SYNCED"
    risk_engine_status: str = "ACTIVE (22 PROFILES SCORED)"
    last_reconciliation: str
