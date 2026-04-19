import { NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/server/auth';
import { getEnv } from '@/lib/server/env';
import { getCustomerByUserId, writeAuditLog } from '@/lib/server/supabase-admin';

export async function POST() {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const customer = await getCustomerByUserId(userId);
  if (!customer?.stripe_customer_id) {
    return NextResponse.json({ error: 'No Stripe customer found for user' }, { status: 404 });
  }

  const stripeSecretKey = getEnv('STRIPE_SECRET_KEY');
  const returnUrl = getEnv('BILLING_PORTAL_RETURN_URL', 'http://localhost:3000/dashboard');

  const body = new URLSearchParams({
    customer: customer.stripe_customer_id,
    return_url: returnUrl,
  });

  const stripeResponse = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!stripeResponse.ok) {
    return NextResponse.json({ error: `Stripe portal creation failed: ${await stripeResponse.text()}` }, { status: 502 });
  }

  const session = (await stripeResponse.json()) as { url: string };

  await writeAuditLog('billing.portal_session.created', userId, {
    stripeCustomerId: customer.stripe_customer_id,
  });

  return NextResponse.redirect(session.url, { status: 303 });
}
