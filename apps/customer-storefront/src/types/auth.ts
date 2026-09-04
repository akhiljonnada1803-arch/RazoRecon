export interface PermissionDTO {
  id: string;
  name: string;
  description: string;
}

export interface RoleDTO {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface UserDTO {
  id?: string;
  name: string;
  user_name?: string;
  email: string;
  company: string;
  role: string;
  role_id?: string;
  merchant_id: string;
  permissions?: string[];
  avatar_url?: string | null;
  created_at?: string;
}

export interface LoginResponseDTO {
  access_token: string;
  token_type: string;
  user: UserDTO;
}

export interface OrganizationDTO {
  id: string;
  name: string;
  merchant_id: string;
  plan?: string;
  industry?: string;
  currency?: string;
  is_active: boolean;
  description?: string;
}

export interface AuditLogEntryDTO {
  id: string;
  user_name: string;
  role: string;
  action: string;
  resource: string;
  status: string;
  timestamp: string;
}

export interface AIAgentTelemetryDTO {
  agent_name: string;
  status: string;
  transactions_processed: number;
  match_rate: number;
  exceptions_escalated: number;
  memory_engine_status: string;
  risk_engine_status: string;
  last_reconciliation: string;
}
