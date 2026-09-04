export interface ApiKeyItem {
  id: string;
  name: string;
  key_prefix: string;
  key_secret_masked: string;
  environment: 'LIVE' | 'TEST';
  role: string;
  permissions: string[];
  created_at: string;
  last_used: string;
  status: 'ACTIVE' | 'REVOKED';
  requests_count: number;
}

export interface WebhookItem {
  id: string;
  url: string;
  secret: string;
  events: string[];
  status: 'ACTIVE' | 'PAUSED' | 'FAILED';
  health_rate: string;
  last_delivery_status: number;
  created_at: string;
}

export interface AiBuyerLogItem {
  id: string;
  timestamp: string;
  agent_id: string;
  agent_name: string;
  query: string;
  method: string;
  endpoint: string;
  status: string;
  latency_ms: number;
  tokens_used: number;
  ip_address: string;
}

export interface EndpointStatus {
  path?: string;
  endpoint?: string;
  method?: string;
  status: string;
  latency_ms: number;
  sla?: string;
  p99_ms?: number;
}

export interface CarrierWebhookStatus {
  carrier: string;
  status: string;
  delivery_rate: string;
}

export interface ProtocolMonitoringData {
  protocol_version: string;
  uptime_pct?: number;
  uptime_percentage?: string;
  avg_latency_ms: number;
  total_requests_24h?: number;
  successful_orders_24h?: number;
  active_ai_buyers?: number;
  active_ai_buyers_count?: number;
  rate_limit_health?: string;
  endpoints_status?: EndpointStatus[];
  endpoints?: EndpointStatus[];
  carrier_dispatch_webhooks?: CarrierWebhookStatus[];
}

export interface AdminIntegration {
  id: string;
  name: string;
  type: string;
  status: string;
  environment: string;
  key_id?: string;
  webhook_url?: string;
  last_ping: string;
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  organization?: string;
  company?: string;
}
