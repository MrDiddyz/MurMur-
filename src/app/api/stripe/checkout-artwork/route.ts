import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";

function calculateApplicationFee(amount: number) {
  return Math.round(amount * 0.15);
}

interface CheckoutArtworkBody {
  artworkId?: string;
  artworkTitle?: string;
  amount?: number;
  currency?: string;
  buyerEmail?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckoutArtworkBody;

    const artworkId = body.artworkId;
    const artworkTitle = body.artworkTitle;
    const amount = body.amount;
    const currency = body.currency?.toLowerCase() || "nok";

    if (!artworkId || !artworkTitle || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive integer in the smallest currency unit" }, { status: 400 });
    }

    const creatorStripeAccountId = process.env.STRIPE_CREATOR_ACCOUNT_ID;
    if (!creatorStripeAccountId) {
      return NextResponse.json({ error: "Missing STRIPE_CREATOR_ACCOUNT_ID" }, { status: 500 });
    }

    const webUrl = process.env.NEXT_PUBLIC_WEB_URL;
    if (!webUrl) {
      return NextResponse.json({ error: "Missing NEXT_PUBLIC_WEB_URL" }, { status: 500 });
    }

    const applicationFeeAmount = calculateApplicationFee(amount);
    const stripe = getStripeClient();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: artworkTitle,
              metadata: { artworkId },
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      customer_email: body.buyerEmail,
      success_url: `${webUrl}/marketplace/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${webUrl}/artworks/${artworkId}`,
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        transfer_data: { destination: creatorStripeAccountId },
        metadata: { artworkId, creatorStripeAccountId },
      },
      metadata: {
        artworkId,
        creatorStripeAccountId,
        type: "artwork_purchase",
      },
    });

    return NextResponse.json({
      url: session.url,
      applicationFeeAmount,
    });
  } catch (error) {
    console.error("checkout-artwork error:", error);
    return NextResponse.json({ error: "Unable to create artwork checkout session" }, { status: 500 });
  }
}
