import { getAuthenticatedUserId } from '@/lib/server/auth';
import { getActiveSubscriptionsByCustomerId, getCustomerByUserId } from '@/lib/server/supabase-admin';
import type { SubscriptionRecord } from '@/lib/server/supabase-admin';

const ACTIVE_STATUSES = new Set(['active', 'trialing', 'past_due']);

export async function getDashboardAccess() {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return { allowed: false as const, reason: 'missing_user' };
  }

  const customer = await getCustomerByUserId(userId);
  if (!customer) {
    return { allowed: false as const, reason: 'missing_customer' };
  }

  const subscriptions = await getActiveSubscriptionsByCustomerId(customer.id);
  const now = Date.now();
  const active = subscriptions.find((subscription: SubscriptionRecord) => {
    if (!ACTIVE_STATUSES.has(subscription.status)) {
      return false;
    }

    if (!subscription.current_period_end) {
      return true;
    }

    return new Date(subscription.current_period_end).getTime() > now;
  });

  if (!active) {
    return { allowed: false as const, reason: 'inactive_subscription' };
  }

  return {
    allowed: true as const,
    userId,
    customer,
    subscription: active,
  };
}
