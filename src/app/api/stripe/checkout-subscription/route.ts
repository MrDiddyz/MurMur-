import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";

const PRICE_MAP = {
  pro: process.env.STRIPE_CREATOR_PRO_PRICE_ID,
  studio: process.env.STRIPE_CREATOR_STUDIO_PRICE_ID,
} as const;

type Plan = keyof typeof PRICE_MAP;

interface CheckoutSubscriptionBody {
  plan?: Plan;
  customerEmail?: string;
  userId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckoutSubscriptionBody;
    const plan = body.plan;

    if (!plan || !PRICE_MAP[plan]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const webUrl = process.env.NEXT_PUBLIC_WEB_URL;
    if (!webUrl) {
      return NextResponse.json({ error: "Missing NEXT_PUBLIC_WEB_URL" }, { status: 500 });
    }

    const stripe = getStripeClient();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: PRICE_MAP[plan], quantity: 1 }],
      success_url: `${webUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${webUrl}/pricing`,
      customer_email: body.customerEmail,
      metadata: {
        plan,
        userId: body.userId ?? "",
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("checkout-subscription error:", error);
    return NextResponse.json({ error: "Unable to create subscription checkout session" }, { status: 500 });
  }
}
