export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  role_id: string;
  company: string;
  merchant_id: string;
  created_at?: string;
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface AdminMerchant {
  id: string;
  name: string;
  legal_name: string;
  gstin: string;
  pan: string;
  industry: string;
  tier: string;
  currency: string;
  razorpay_account_id: string;
  status: string;
  webhook_status: string;
  auto_reconciliation: boolean;
}

export interface AdminIntegration {
  id: string;
  name: string;
  type: string;
  environment: string;
  status: string;
  key_id?: string;
  webhook_url?: string;
  events_subscribed?: string[];
  sync_frequency?: string;
  last_ping: string;
}
