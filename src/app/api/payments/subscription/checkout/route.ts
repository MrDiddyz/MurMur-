import { NextRequest, NextResponse } from 'next/server';
import { stripeServer } from '@/lib/stripe';

type CheckoutSessionResponse = {
  id: string;
  url: string | null;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { artistId?: string; email?: string };
    if (!body.artistId) {
      return NextResponse.json({ error: 'artistId is required.' }, { status: 400 });
    }

    const appUrl = env('NEXT_PUBLIC_APP_URL');
    const priceId = env('STRIPE_SUBSCRIPTION_PRICE_ID');
    const trialEnd = getTrialEndUnix();

    const session = await stripeServer.postForm<CheckoutSessionResponse>('/checkout/sessions', {
      mode: 'subscription',
      success_url: `${appUrl}/artist/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/artist/subscription/cancel`,
      customer_email: body.email,
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': 1,
      subscription_data: {
        trial_end: trialEnd,
        metadata: {
          flow: 'artist_subscription',
          artist_id: body.artistId,
        },
      },
      metadata: {
        flow: 'artist_subscription',
        artist_id: body.artistId,
      },
    });

    return NextResponse.json({ sessionId: session.id, checkoutUrl: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create subscription checkout session.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function getTrialEndUnix() {
  const now = new Date();
  const year = now.getUTCMonth() > 4 || (now.getUTCMonth() === 4 && now.getUTCDate() > 17) ? now.getUTCFullYear() + 1 : now.getUTCFullYear();
  return Math.floor(Date.UTC(year, 4, 17, 23, 59, 59) / 1000);
}

function env(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
