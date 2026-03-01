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

function verifyStripeSignature(payload: string, signatureHeader: string, secret: string): boolean {
  const pairs = signatureHeader.split(',').map((entry) => entry.trim());
  const timestamp = pairs.find((entry) => entry.startsWith('t='))?.slice(2);
  const signature = pairs.find((entry) => entry.startsWith('v1='))?.slice(3);

  if (!timestamp || !signature) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expected = createHmac('sha256', secret).update(signedPayload, 'utf8').digest('hex');

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signature);

  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

function mapPriceToPlanCode(priceId: string | undefined): 'starter' | 'growth' | 'vipps_startpakke' {
  if (priceId === process.env.STRIPE_PRICE_GROWTH) {
    return 'growth';
  }
  if (priceId === process.env.VIPPS_STARTPAKKE_PRICE_ID) {
    return 'vipps_startpakke';
  }
  return 'starter';
}

async function handleCheckoutSession(event: StripeEvent) {
  const object = event.data.object as Record<string, any>;
  const email = String(object.customer_email ?? object.customer_details?.email ?? 'unknown@example.com');
  const userId = String(object.client_reference_id ?? object.metadata?.supabase_user_id ?? 'anonymous');
  const stripeCustomerId = typeof object.customer === 'string' ? object.customer : null;
  const subscriptionId = typeof object.subscription === 'string' ? object.subscription : null;
  const planCode = mapPriceToPlanCode(String(object.metadata?.plan_price_id ?? ''));

  const customer = await upsertCustomer({ userId, email, stripeCustomerId });

  if (subscriptionId) {
    await upsertSubscription({
      customerId: customer.id,
      provider: 'stripe',
      providerSubscriptionId: subscriptionId,
      planCode,
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
  const object = event.data.object as Record<string, any>;
  const stripeCustomerId = String(object.customer ?? '');
  const subscriptionId = String(object.id ?? '');

  if (!stripeCustomerId || !subscriptionId) {
    return;
  }

  const userId = String(object.metadata?.supabase_user_id ?? 'anonymous');
  const email = String(object.metadata?.customer_email ?? 'unknown@example.com');
  const priceId = String(object.items?.data?.[0]?.price?.id ?? '');

  const customer = await upsertCustomer({
    userId,
    email,
    stripeCustomerId,
  });

  const currentPeriodEndUnix = Number(object.current_period_end ?? 0);

  await upsertSubscription({
    customerId: customer.id,
    provider: 'stripe',
    providerSubscriptionId: subscriptionId,
    planCode: mapPriceToPlanCode(priceId),
    status: String(object.status ?? 'incomplete'),
    currentPeriodEnd: currentPeriodEndUnix ? new Date(currentPeriodEndUnix * 1000).toISOString() : null,
    cancelAtPeriodEnd: Boolean(object.cancel_at_period_end),
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
