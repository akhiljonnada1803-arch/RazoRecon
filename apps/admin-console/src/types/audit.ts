export interface CommerceAuditEvent {
  id: string;
  event_type: string;
  actor: string;
  actor_role: string;
  entity_type: string;
  entity_id?: string;
  summary: string;
  metadata: Record<string, any>;
  status: 'SUCCESS' | 'WARNING' | 'ALERT';
  ip_address?: string;
  timestamp: string;
}

export interface ComplianceRegulation {
  framework: string;
  status: string;
  last_verified: string;
}

export interface ComplianceStatus {
  gst_compliance_rate_pct: number;
  reconciliation_sla_compliance_pct: number;
  audit_trail_integrity: string;
  open_compliance_flags: number;
  regulations: ComplianceRegulation[];
}
