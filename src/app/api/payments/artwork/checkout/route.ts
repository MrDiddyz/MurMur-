import { NextRequest, NextResponse } from 'next/server';
import { getArtistById, getArtworkById } from '@/lib/supabase-admin';
import { stripeServer } from '@/lib/stripe';

type CheckoutSessionResponse = {
  id: string;
  url: string | null;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { artworkId?: string; buyerEmail?: string };
    if (!body.artworkId || !body.buyerEmail) {
      return NextResponse.json({ error: 'artworkId and buyerEmail are required.' }, { status: 400 });
    }

    const artwork = await getArtworkById(body.artworkId);
    if (!artwork) {
      return NextResponse.json({ error: 'Artwork not found.' }, { status: 404 });
    }

    const artist = await getArtistById(artwork.artist_id);
    if (!artist?.stripe_account_id) {
      return NextResponse.json({ error: 'Artist is not onboarded for payouts.' }, { status: 400 });
    }

    const grossAmount = artwork.price_cents;
    const commissionRate = Number.parseFloat(process.env.MURMURLAB_PLATFORM_FEE_RATE ?? '0.1');
    const platformFee = Math.round(grossAmount * commissionRate);
    const artistPayout = grossAmount - platformFee;

    const appUrl = required('NEXT_PUBLIC_APP_URL');
    const session = await stripeServer.postForm<CheckoutSessionResponse>('/checkout/sessions', {
      mode: 'payment',
      success_url: `${appUrl}/artwork/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/artwork/checkout/cancel`,
      customer_email: body.buyerEmail,
      submit_type: 'pay',
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][product_data][name]': `Artwork ${artwork.id}`,
      'line_items[0][price_data][unit_amount]': grossAmount,
      'line_items[0][quantity]': 1,
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: artist.stripe_account_id,
        },
      },
      metadata: {
        flow: 'artwork_purchase',
        artwork_id: artwork.id,
        artist_id: artwork.artist_id,
        platform_fee: String(platformFee),
        artist_payout: String(artistPayout),
      },
    });

    return NextResponse.json({ sessionId: session.id, checkoutUrl: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create artwork checkout session.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function required(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
