import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/server/env';
import { upsertCustomer, upsertSubscription, writeAuditLog } from '@/lib/server/supabase-admin';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const expected = `Bearer ${getEnv('CRON_SECRET')}`;

  if (authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stripeSecretKey = getEnv('STRIPE_SECRET_KEY');
  const response = await fetch('https://api.stripe.com/v1/subscriptions?status=all&limit=100', {
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
    },
  });

  if (!response.ok) {
    return NextResponse.json({ error: `Stripe sync failed: ${await response.text()}` }, { status: 502 });
  }

  const payload = (await response.json()) as {
    data: Array<{
      id: string;
      customer: string;
      status: string;
      current_period_end: number;
      cancel_at_period_end: boolean;
      metadata?: Record<string, string>;
      items?: { data?: Array<{ price?: { id?: string } }> };
    }>;
  };

  let syncedCount = 0;

  for (const subscription of payload.data) {
    const userId = subscription.metadata?.supabase_user_id;
    const email = subscription.metadata?.customer_email;

    if (!userId || !email) {
      continue;
    }

    const customer = await upsertCustomer({
      userId,
      email,
      stripeCustomerId: subscription.customer,
    });

    const priceId = subscription.items?.data?.[0]?.price?.id;

    await upsertSubscription({
      customerId: customer.id,
      provider: 'stripe',
      providerSubscriptionId: subscription.id,
      planCode: priceId === process.env.STRIPE_PRICE_GROWTH ? 'growth' : 'starter',
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });

    syncedCount += 1;
  }

  await writeAuditLog('jobs.subscription_sync.completed', 'cron', { syncedCount });

  return NextResponse.json({ ok: true, syncedCount });
}
