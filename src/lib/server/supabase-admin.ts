import { getEnv } from '@/lib/server/env';

function getSupabaseConfig() {
  return {
    supabaseUrl: getEnv('SUPABASE_URL'),
    supabaseServiceRoleKey: getEnv('SUPABASE_SERVICE_ROLE_KEY'),
  };
}

async function supabaseRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { supabaseUrl, supabaseServiceRoleKey } = getSupabaseConfig();
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${errorBody}`);
  }

  if (response.status === 204) {
    return [] as T;
  }

  return (await response.json()) as T;
}

export type CustomerRecord = {
  id: string;
  user_id: string;
  email: string;
  stripe_customer_id: string | null;
};

export type SubscriptionRecord = {
  id: string;
  customer_id: string;
  provider: 'stripe' | 'vipps';
  provider_subscription_id: string | null;
  plan_code: 'starter' | 'growth' | 'vipps_startpakke';
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

export async function getCustomerByUserId(userId: string): Promise<CustomerRecord | null> {
  const rows = await supabaseRequest<CustomerRecord[]>(`customers?user_id=eq.${encodeURIComponent(userId)}&select=*`);
  return rows[0] ?? null;
}

export async function getActiveSubscriptionsByCustomerId(customerId: string): Promise<SubscriptionRecord[]> {
  return supabaseRequest<SubscriptionRecord[]>(
    `subscriptions?customer_id=eq.${encodeURIComponent(customerId)}&status=in.(active,trialing,past_due)&order=created_at.desc&select=*`,
  );
}

export async function upsertStripeEvent(eventId: string, eventType: string, payload: unknown): Promise<boolean> {
  const { supabaseUrl, supabaseServiceRoleKey } = getSupabaseConfig();
  const response = await fetch(`${supabaseUrl}/rest/v1/events`, {
    method: 'POST',
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=ignore-duplicates,return=representation',
    },
    body: JSON.stringify([
      {
        provider: 'stripe',
        provider_event_id: eventId,
        type: eventType,
        payload,
      },
    ]),
  });

  if (!response.ok) {
    throw new Error(`Failed to store event: ${response.status} ${await response.text()}`);
  }

  const rows = (await response.json()) as Array<{ id: string }>;
  return rows.length > 0;
}

export async function upsertCustomer(input: {
  userId: string;
  email: string;
  stripeCustomerId?: string | null;
}): Promise<CustomerRecord> {
  const rows = await supabaseRequest<CustomerRecord[]>('customers?on_conflict=user_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify([
      {
        user_id: input.userId,
        email: input.email,
        stripe_customer_id: input.stripeCustomerId ?? null,
      },
    ]),
  });

  return rows[0];
}

export async function upsertSubscription(input: {
  customerId: string;
  provider: 'stripe' | 'vipps';
  providerSubscriptionId?: string | null;
  planCode: 'starter' | 'growth' | 'vipps_startpakke';
  status: string;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
}) {
  await supabaseRequest<SubscriptionRecord[]>('subscriptions?on_conflict=provider,provider_subscription_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify([
      {
        customer_id: input.customerId,
        provider: input.provider,
        provider_subscription_id: input.providerSubscriptionId ?? null,
        plan_code: input.planCode,
        status: input.status,
        current_period_end: input.currentPeriodEnd ?? null,
        cancel_at_period_end: input.cancelAtPeriodEnd ?? false,
      },
    ]),
  });
}

export async function writeAuditLog(action: string, actor: string, metadata: unknown) {
  await supabaseRequest('audit_log', {
    method: 'POST',
    body: JSON.stringify([
      {
        action,
        actor,
        metadata,
      },
    ]),
  });
}

export async function pingSupabase(): Promise<boolean> {
  const rows = await supabaseRequest<Array<{ count: number }>>('customers?select=count', {
    headers: { Prefer: 'count=exact,head=false' },
  });
  return Array.isArray(rows);
}
