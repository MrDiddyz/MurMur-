interface StartSubscriptionOptions {
  customerEmail?: string;
  userId?: string;
}

interface BuyArtworkOptions {
  artworkId: string;
  artworkTitle: string;
  amount: number;
  currency?: string;
  buyerEmail?: string;
}

export async function startSubscription(plan: "pro" | "studio", options: StartSubscriptionOptions = {}) {
  const res = await fetch("/api/stripe/checkout-subscription", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      plan,
      customerEmail: options.customerEmail,
      userId: options.userId,
    }),
  });

  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? "Failed to start subscription checkout");
  }

  if (data.url) {
    window.location.href = data.url;
  }
}

export async function buyArtwork(options: BuyArtworkOptions) {
  const res = await fetch("/api/stripe/checkout-artwork", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      artworkId: options.artworkId,
      artworkTitle: options.artworkTitle,
      amount: options.amount,
      currency: options.currency ?? "nok",
      buyerEmail: options.buyerEmail,
    }),
  });

  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? "Failed to start artwork checkout");
  }

  if (data.url) {
    window.location.href = data.url;
  }
}
