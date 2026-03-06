import { NextRequest, NextResponse } from 'next/server';
import {
  getArtistSubscriptionByStripeSubscriptionId,
  insertSubscriptionPayment,
  upsertArtistSubscription,
  upsertOrder,
  updateArtistSubscriptionByStripeSubscriptionId,
} from '@/lib/supabase-admin';
import { stripeServer } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 401 });
    }

    const rawBody = await request.text();
    const event = stripeServer.constructWebhookEvent(rawBody, signature, required('STRIPE_WEBHOOK_SECRET'));

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Record<string, any>);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Record<string, any>);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Record<string, any>);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Record<string, any>);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Record<string, any>);
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Stripe webhook processing failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

async function handleCheckoutSessionCompleted(session: Record<string, any>) {
  const metadata = (session.metadata ?? {}) as Record<string, string>;

  if (metadata.flow === 'artwork_purchase') {
    await upsertOrder({
      artwork_id: metadata.artwork_id,
      artist_id: metadata.artist_id,
      buyer_email: session.customer_details?.email ?? session.customer_email ?? null,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent: session.payment_intent,
      gross_amount: session.amount_total,
      platform_fee: Number(metadata.platform_fee ?? '0'),
      artist_payout: Number(metadata.artist_payout ?? '0'),
      status: 'paid',
    });
    return;
  }

  if (metadata.flow === 'artist_subscription') {
    await upsertArtistSubscription({
      artist_id: metadata.artist_id,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      status: session.status === 'complete' && session.payment_status === 'paid' ? 'active' : 'trialing',
      cancel_at_period_end: false,
    });
  }
}

async function handleInvoicePaid(invoice: Record<string, any>) {
  const stripeSubscriptionId = String(invoice.subscription ?? '');
  if (!stripeSubscriptionId) {
    return;
  }

  await updateArtistSubscriptionByStripeSubscriptionId(stripeSubscriptionId, {
    status: 'active',
    current_period_end: toIsoDate(invoice.lines?.data?.[0]?.period?.end),
  });

  const existing = await getArtistSubscriptionByStripeSubscriptionId(stripeSubscriptionId);

  await insertSubscriptionPayment({
    artist_id: existing?.artist_id,
    stripe_subscription_id: stripeSubscriptionId,
    stripe_invoice_id: invoice.id,
    amount: invoice.amount_paid ?? 0,
    status: 'paid',
  });
}

async function handleInvoicePaymentFailed(invoice: Record<string, any>) {
  const stripeSubscriptionId = String(invoice.subscription ?? '');
  if (!stripeSubscriptionId) {
    return;
  }

  await updateArtistSubscriptionByStripeSubscriptionId(stripeSubscriptionId, {
    status: 'past_due',
  });

  const existing = await getArtistSubscriptionByStripeSubscriptionId(stripeSubscriptionId);

  await insertSubscriptionPayment({
    artist_id: existing?.artist_id,
    stripe_subscription_id: stripeSubscriptionId,
    stripe_invoice_id: invoice.id,
    amount: invoice.amount_due ?? 0,
    status: 'failed',
  });
}

async function handleSubscriptionUpdated(subscription: Record<string, any>) {
  const cancelAtPeriodEnd = Boolean(subscription.cancel_at_period_end);
  await updateArtistSubscriptionByStripeSubscriptionId(String(subscription.id), {
    status: cancelAtPeriodEnd ? 'canceling' : String(subscription.status),
    cancel_at_period_end: cancelAtPeriodEnd,
    current_period_end: toIsoDate(subscription.current_period_end),
  });
}

async function handleSubscriptionDeleted(subscription: Record<string, any>) {
  await updateArtistSubscriptionByStripeSubscriptionId(String(subscription.id), {
    status: 'canceled',
    cancel_at_period_end: false,
  });
}

function required(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function toIsoDate(timestamp?: number) {
  if (!timestamp || Number.isNaN(timestamp)) {
    return null;
  }

  return new Date(timestamp * 1000).toISOString();
}
