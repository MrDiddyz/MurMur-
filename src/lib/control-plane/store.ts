import crypto from 'node:crypto';
import {
  ApiKeyRecord,
  AuditLog,
  Subscription,
  Tenant,
  TenantPlan,
  TenantQuota,
  TenantRole,
  TenantStatus,
  TenantUser,
  UsageMetric,
  UsageRecord,
} from '@/lib/control-plane/types';

const planQuotas: Record<TenantPlan, TenantQuota> = {
  starter: {
    maxAgents: 2,
    maxRunsPerDay: 10,
    maxTokens: 50_000,
    maxStorageMb: 512,
  },
  growth: {
    maxAgents: 10,
    maxRunsPerDay: 100,
    maxTokens: 500_000,
    maxStorageMb: 5_120,
  },
  scale: {
    maxAgents: null,
    maxRunsPerDay: null,
    maxTokens: null,
    maxStorageMb: null,
  },
};

const rolePermissions: Record<TenantRole, Set<string>> = {
  owner: new Set(['manage_billing', 'manage_users', 'change_plan', 'view_audit', 'run_agents', 'manage_api_keys', 'view_usage']),
  admin: new Set(['run_agents', 'manage_api_keys', 'view_usage']),
  member: new Set(['run_agents']),
};

const metricToQuotaField: Partial<Record<UsageMetric, keyof TenantQuota>> = {
  agent_runs: 'maxRunsPerDay',
  tokens_generated: 'maxTokens',
  storage_used: 'maxStorageMb',
};

interface TenantContext {
  tenant: Tenant;
  apiKey: ApiKeyRecord;
}

class QuotaExceededError extends Error {
  constructor(metric: UsageMetric) {
    super(`Quota exceeded for ${metric}.`);
  }
}

class AuthorizationError extends Error {}
class AuthenticationError extends Error {}
class NotFoundError extends Error {}

class ControlPlaneStore {
  private tenants = new Map<string, Tenant>();
  private users = new Map<string, TenantUser>();
  private apiKeys = new Map<string, ApiKeyRecord>();
  private subscriptions = new Map<string, Subscription>();
  private usageRecords: UsageRecord[] = [];
  private auditLogs: AuditLog[] = [];

  createTenant(name: string, ownerEmail: string, plan: TenantPlan = 'starter'): Tenant {
    const tenantId = crypto.randomUUID();
    const now = new Date().toISOString();

    const tenant: Tenant = {
      id: tenantId,
      name,
      plan,
      status: 'trialing',
      createdAt: now,
    };

    this.tenants.set(tenantId, tenant);

    const owner: TenantUser = {
      id: crypto.randomUUID(),
      tenantId,
      email: ownerEmail,
      role: 'owner',
      createdAt: now,
    };

    this.users.set(owner.id, owner);

    const subscription: Subscription = {
      id: crypto.randomUUID(),
      tenantId,
      stripeCustomerId: `cus_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
      plan,
      status: 'trialing',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    this.subscriptions.set(subscription.id, subscription);

    this.addAuditLog(tenantId, ownerEmail, 'tenant_created', `tenant:${tenantId}`);

    return tenant;
  }

  inviteUser(tenantId: string, email: string, role: TenantRole, actor: string): TenantUser {
    this.requireTenant(tenantId);

    const user: TenantUser = {
      id: crypto.randomUUID(),
      tenantId,
      email,
      role,
      createdAt: new Date().toISOString(),
    };

    this.users.set(user.id, user);
    this.addAuditLog(tenantId, actor, 'user_added', `user:${user.id}`);

    return user;
  }

  createApiKey(tenantId: string, actor: string): { keyId: string; rawKey: string } {
    this.requireTenant(tenantId);

    const rawKey = `mrmr_${crypto.randomBytes(24).toString('hex')}`;

    const apiKeyRecord: ApiKeyRecord = {
      id: crypto.randomUUID(),
      tenantId,
      keyHash: this.hashApiKey(rawKey),
      createdAt: new Date().toISOString(),
      revoked: false,
    };

    this.apiKeys.set(apiKeyRecord.id, apiKeyRecord);
    this.addAuditLog(tenantId, actor, 'api_key_created', `api_key:${apiKeyRecord.id}`);

    return { keyId: apiKeyRecord.id, rawKey };
  }

  resolveTenant(rawApiKey: string): TenantContext {
    const keyHash = this.hashApiKey(rawApiKey);
    const apiKey = Array.from(this.apiKeys.values()).find((record) => record.keyHash === keyHash && !record.revoked);

    if (!apiKey) {
      throw new AuthenticationError('Invalid API key.');
    }

    const tenant = this.requireTenant(apiKey.tenantId);
    return { tenant, apiKey };
  }

  authorize(tenantId: string, role: TenantRole, permission: string): void {
    this.requireTenant(tenantId);

    if (!rolePermissions[role].has(permission)) {
      throw new AuthorizationError(`Role ${role} cannot ${permission}.`);
    }
  }

  enforceQuota(tenantId: string, metric: UsageMetric, amount: number): void {
    const tenant = this.requireTenant(tenantId);
    const quota = planQuotas[tenant.plan];
    const quotaField = metricToQuotaField[metric];

    if (!quotaField) {
      return;
    }

    const limit = quota[quotaField];
    if (limit == null) {
      return;
    }

    const usage = this.getUsageSummary(tenantId);
    const current = usage[metric] ?? 0;

    if (current + amount > limit) {
      this.addAuditLog(tenantId, 'quota_engine', 'quota_exceeded', `${metric}:${current + amount}/${limit}`);
      throw new QuotaExceededError(metric);
    }
  }

  recordUsage(tenantId: string, metric: UsageMetric, quantity: number): UsageRecord {
    this.requireTenant(tenantId);
    const usageRecord: UsageRecord = {
      id: crypto.randomUUID(),
      tenantId,
      metric,
      quantity,
      timestamp: new Date().toISOString(),
    };

    this.usageRecords.push(usageRecord);
    return usageRecord;
  }

  getUsageSummary(tenantId: string): Record<UsageMetric, number> {
    this.requireTenant(tenantId);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const summary: Record<UsageMetric, number> = {
      agent_runs: 0,
      compute_seconds: 0,
      tokens_generated: 0,
      storage_used: 0,
      api_requests: 0,
    };

    this.usageRecords
      .filter((record) => record.tenantId === tenantId && new Date(record.timestamp) >= startOfDay)
      .forEach((record) => {
        summary[record.metric] += record.quantity;
      });

    return summary;
  }

  getAuditLogs(tenantId: string): AuditLog[] {
    this.requireTenant(tenantId);
    return this.auditLogs.filter((entry) => entry.tenantId === tenantId);
  }

  handleStripeWebhook(payload: { tenantId: string; plan: TenantPlan; status: TenantStatus; currentPeriodEnd: string }): Tenant {
    const tenant = this.requireTenant(payload.tenantId);

    tenant.plan = payload.plan;
    tenant.status = payload.status;
    this.tenants.set(tenant.id, tenant);

    const subscription = Array.from(this.subscriptions.values()).find((entry) => entry.tenantId === payload.tenantId);
    if (subscription) {
      subscription.plan = payload.plan;
      subscription.status = payload.status;
      subscription.currentPeriodEnd = payload.currentPeriodEnd;
      this.subscriptions.set(subscription.id, subscription);
    }

    this.addAuditLog(tenant.id, 'stripe_webhook', 'plan_changed', `plan:${payload.plan}`);

    return tenant;
  }

  enqueueTenantJob(tenantId: string, queueName: string): string {
    this.requireTenant(tenantId);
    return `${queueName}:${tenantId}`;
  }

  addAuditLog(tenantId: string, actor: string, action: string, resource: string): void {
    this.auditLogs.push({
      id: crypto.randomUUID(),
      tenantId,
      actor,
      action,
      resource,
      timestamp: new Date().toISOString(),
    });
  }

  getTenant(tenantId: string): Tenant {
    return this.requireTenant(tenantId);
  }

  getTenantQuota(tenantId: string): TenantQuota {
    const tenant = this.requireTenant(tenantId);
    return planQuotas[tenant.plan];
  }

  private hashApiKey(rawKey: string): string {
    return crypto.createHash('sha256').update(rawKey).digest('hex');
  }

  private requireTenant(tenantId: string): Tenant {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new NotFoundError(`Tenant ${tenantId} not found.`);
    }

    return tenant;
  }
}

export const controlPlaneStore = new ControlPlaneStore();
export { AuthenticationError, AuthorizationError, NotFoundError, QuotaExceededError };
