export type TenantPlan = 'starter' | 'growth' | 'scale';
export type TenantStatus = 'active' | 'past_due' | 'canceled' | 'trialing';
export type TenantRole = 'owner' | 'admin' | 'member';

export type UsageMetric =
  | 'agent_runs'
  | 'compute_seconds'
  | 'tokens_generated'
  | 'storage_used'
  | 'api_requests';

export interface TenantQuota {
  maxAgents: number | null;
  maxRunsPerDay: number | null;
  maxTokens: number | null;
  maxStorageMb: number | null;
}

export interface Tenant {
  id: string;
  name: string;
  plan: TenantPlan;
  status: TenantStatus;
  createdAt: string;
}

export interface TenantUser {
  id: string;
  tenantId: string;
  email: string;
  role: TenantRole;
  createdAt: string;
}

export interface ApiKeyRecord {
  id: string;
  tenantId: string;
  keyHash: string;
  createdAt: string;
  revoked: boolean;
}

export interface Subscription {
  id: string;
  tenantId: string;
  stripeCustomerId: string;
  plan: TenantPlan;
  status: TenantStatus;
  currentPeriodEnd: string;
}

export interface UsageRecord {
  id: string;
  tenantId: string;
  metric: UsageMetric;
  quantity: number;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  actor: string;
  action: string;
  resource: string;
  timestamp: string;
}
