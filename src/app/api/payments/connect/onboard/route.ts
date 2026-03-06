import { NextRequest, NextResponse } from 'next/server';
import { stripeServer } from '@/lib/stripe';
import { getArtistById, updateArtistStripeAccount } from '@/lib/supabase-admin';

type ConnectAccountResponse = {
  id: string;
};

type AccountLinkResponse = {
  url: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { artistId?: string; email?: string };
    if (!body.artistId) {
      return NextResponse.json({ error: 'artistId is required.' }, { status: 400 });
    }

    const artist = await getArtistById(body.artistId);
    if (!artist) {
      return NextResponse.json({ error: 'Artist not found.' }, { status: 404 });
    }

    const accountId = artist.stripe_account_id ?? (await createExpressAccount(body.artistId, body.email));
    if (!artist.stripe_account_id) {
      await updateArtistStripeAccount(body.artistId, accountId);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      throw new Error('Missing NEXT_PUBLIC_APP_URL');
    }

    const accountLink = await stripeServer.postForm<AccountLinkResponse>('/account_links', {
      account: accountId,
      type: 'account_onboarding',
      refresh_url: `${appUrl}/artist/payouts/refresh`,
      return_url: `${appUrl}/artist/payouts/complete`,
    });

    return NextResponse.json({ accountId, onboardingUrl: accountLink.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to start Stripe Connect onboarding.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function createExpressAccount(artistId: string, email?: string) {
  const account = await stripeServer.postForm<ConnectAccountResponse>('/accounts', {
    type: 'express',
    country: 'US',
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: {
      artist_id: artistId,
    },
  });

  return account.id;
}
