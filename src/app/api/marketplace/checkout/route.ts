import { NextResponse } from 'next/server';

import { getAuthenticatedUserId } from '@/lib/server/auth';
import {
  MAX_PRICE_NOK,
  calculateCheckoutTotalNok,
  calculatePlatformFeeNok,
  getListingById,
} from '@/lib/marketplace/listings';

type CheckoutPayload = {
  listingId?: string;
};

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = (await request.json()) as CheckoutPayload;

  if (!payload.listingId) {
    return NextResponse.json({ error: 'Missing listingId.' }, { status: 400 });
  }

  const listing = getListingById(payload.listingId);
  if (!listing) {
    return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
  }

  if (listing.priceNok > MAX_PRICE_NOK) {
    return NextResponse.json({ error: 'Listing exceeds maximum allowed price.' }, { status: 400 });
  }

  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_MARKETPLACE_PAYMENT_LINK;
  if (!paymentLink) {
    return NextResponse.json({ error: 'Stripe payment link is not configured.' }, { status: 503 });
  }

  const checkoutUrl = new URL(paymentLink);
  checkoutUrl.searchParams.set('client_reference_id', userId);
  checkoutUrl.searchParams.set('prefilled_promo_code', 'MURMUR10');
  checkoutUrl.searchParams.set('locale', 'nb');
  checkoutUrl.searchParams.set('metadata_listing_id', listing.id);
  checkoutUrl.searchParams.set('metadata_listing_price_nok', String(listing.priceNok));
  checkoutUrl.searchParams.set('metadata_platform_fee_nok', String(calculatePlatformFeeNok(listing.priceNok)));
  checkoutUrl.searchParams.set('metadata_checkout_total_nok', String(calculateCheckoutTotalNok(listing.priceNok)));

  return NextResponse.json({ url: checkoutUrl.toString() });
}
