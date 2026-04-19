import { createHmac, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/server/env';
import { upsertCustomer, upsertStripeEvent, upsertSubscription, writeAuditLog } from '@/lib/server/supabase-admin';

type StripeEvent = {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
};

const WEBHOOK_TOLERANCE_SECONDS = 300;

function getObjectValue(object: Record<string, unknown>, key: string): unknown {
  return object[key];
}

function getString(object: Record<string, unknown>, key: string): string | null {
  const value = getObjectValue(object, key);
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function getNestedString(object: Record<string, unknown>, path: string[]): string | null {
  let cursor: unknown = object;
  for (const key of path) {
    if (!cursor || typeof cursor !== 'object') {
      return null;
    }
    cursor = (cursor as Record<string, unknown>)[key];
  }
  return typeof cursor === 'string' && cursor.length > 0 ? cursor : null;
}

function verifyStripeSignature(payload: string, signatureHeader: string, secret: string): boolean {
  const pairs = signatureHeader.split(',').map((entry) => entry.trim());
  const timestamp = pairs.find((entry) => entry.startsWith('t='))?.slice(2);
  const signatures = pairs.filter((entry) => entry.startsWith('v1=')).map((entry) => entry.slice(3));

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  const timestampUnix = Number(timestamp);
  if (!Number.isFinite(timestampUnix)) {
    return false;
  }

  if (Math.abs(Date.now() / 1000 - timestampUnix) > WEBHOOK_TOLERANCE_SECONDS) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expected = createHmac('sha256', secret).update(signedPayload, 'utf8').digest('hex');

  return signatures.some((signature) => {
    const expectedBuffer = Buffer.from(expected, 'utf8');
    const receivedBuffer = Buffer.from(signature, 'utf8');

    return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
  });
}

function mapPriceToPlanCode(priceId: string | null): 'starter' | 'growth' | 'vipps_startpakke' {
  if (priceId === process.env.STRIPE_PRICE_GROWTH) {
    return 'growth';
  }
  if (priceId === process.env.VIPPS_STARTPAKKE_PRICE_ID) {
    return 'vipps_startpakke';
  }
  return 'starter';
}

async function handleCheckoutSession(event: StripeEvent) {
  const object = event.data.object;
  const userId = getString(object, 'client_reference_id') ?? getNestedString(object, ['metadata', 'supabase_user_id']);
  const email = getString(object, 'customer_email') ?? getNestedString(object, ['customer_details', 'email']);

  if (!userId || !email) {
    await writeAuditLog('stripe.checkout.skipped_missing_identity', 'stripe_webhook', {
      eventId: event.id,
    });
    return;
  }

  const stripeCustomerId = getString(object, 'customer');
  const subscriptionId = getString(object, 'subscription');
  const planPriceId = getNestedString(object, ['metadata', 'plan_price_id']);

  const customer = await upsertCustomer({ userId, email, stripeCustomerId });

  if (subscriptionId) {
    await upsertSubscription({
      customerId: customer.id,
      provider: 'stripe',
      providerSubscriptionId: subscriptionId,
      planCode: mapPriceToPlanCode(planPriceId),
      status: 'active',
    });
  }

  await writeAuditLog('stripe.checkout.completed', 'stripe_webhook', {
    eventId: event.id,
    userId,
    customerId: customer.id,
  });
}

async function handleSubscriptionEvent(event: StripeEvent) {
  const object = event.data.object;
  const stripeCustomerId = getString(object, 'customer');
  const subscriptionId = getString(object, 'id');

  if (!stripeCustomerId || !subscriptionId) {
    return;
  }

  const userId = getNestedString(object, ['metadata', 'supabase_user_id']);
  const email = getNestedString(object, ['metadata', 'customer_email']);

  if (!userId || !email) {
    await writeAuditLog('stripe.subscription.skipped_missing_identity', 'stripe_webhook', {
      eventId: event.id,
      subscriptionId,
      stripeCustomerId,
    });
    return;
  }

  const priceId = getNestedString(object, ['items', 'data', '0', 'price', 'id']);
  const currentPeriodEndUnix = Number(getObjectValue(object, 'current_period_end'));
  const status = getString(object, 'status') ?? 'incomplete';
  const cancelAtPeriodEnd = Boolean(getObjectValue(object, 'cancel_at_period_end'));

  const customer = await upsertCustomer({
    userId,
    email,
    stripeCustomerId,
  });

  await upsertSubscription({
    customerId: customer.id,
    provider: 'stripe',
    providerSubscriptionId: subscriptionId,
    planCode: mapPriceToPlanCode(priceId),
    status,
    currentPeriodEnd: Number.isFinite(currentPeriodEndUnix) && currentPeriodEndUnix > 0
      ? new Date(currentPeriodEndUnix * 1000).toISOString()
      : null,
    cancelAtPeriodEnd,
  });

  await writeAuditLog('stripe.subscription.updated', 'stripe_webhook', {
    eventId: event.id,
    subscriptionId,
    stripeCustomerId,
  });
}

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = getEnv('STRIPE_WEBHOOK_SECRET');

  if (!signature || !verifyStripeSignature(payload, signature, webhookSecret)) {
    return NextResponse.json({ error: 'Invalid Stripe signature' }, { status: 400 });
  }

  const event = JSON.parse(payload) as StripeEvent;

  const isNewEvent = await upsertStripeEvent(event.id, event.type, event);
  if (!isNewEvent) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  if (event.type === 'checkout.session.completed') {
    await handleCheckoutSession(event);
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    await handleSubscriptionEvent(event);
  }

  return NextResponse.json({ received: true });
}
