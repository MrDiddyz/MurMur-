const supabaseUrl = required('NEXT_PUBLIC_SUPABASE_URL');
const serviceRoleKey = required('SUPABASE_SERVICE_ROLE_KEY');

export type ArtworkRecord = {
  id: string;
  artist_id: string;
  price_cents: number;
};

export type ArtistRecord = {
  id: string;
  stripe_account_id: string | null;
  subscription_status: string | null;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${text}`);
  }

  return (await response.json()) as T;
}

export async function getArtworkById(artworkId: string) {
  const rows = await request<ArtworkRecord[]>(`artworks?id=eq.${encodeURIComponent(artworkId)}&select=id,artist_id,price_cents&limit=1`);
  return rows[0] ?? null;
}

export async function getArtistById(artistId: string) {
  const rows = await request<ArtistRecord[]>(`artists?id=eq.${encodeURIComponent(artistId)}&select=id,stripe_account_id,subscription_status&limit=1`);
  return rows[0] ?? null;
}

export async function updateArtistStripeAccount(artistId: string, stripeAccountId: string) {
  await request<ArtistRecord[]>(`artists?id=eq.${encodeURIComponent(artistId)}`, {
    method: 'PATCH',
    headers: {
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ stripe_account_id: stripeAccountId }),
  });
}

export async function upsertOrder(payload: Record<string, unknown>) {
  await request<Record<string, unknown>[]>(`orders?on_conflict=stripe_checkout_session_id`, {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(payload),
  });
}

export async function upsertArtistSubscription(payload: Record<string, unknown>) {
  await request<Record<string, unknown>[]>(`artist_subscriptions?on_conflict=artist_id`, {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(payload),
  });
}

export async function insertSubscriptionPayment(payload: Record<string, unknown>) {
  await request<Record<string, unknown>[]>('subscription_payments', {
    method: 'POST',
    headers: {
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  });
}

export async function updateOrderStatusBySessionId(sessionId: string, status: string) {
  await request<Record<string, unknown>[]>(`orders?stripe_checkout_session_id=eq.${encodeURIComponent(sessionId)}`, {
    method: 'PATCH',
    headers: {
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ status }),
  });
}

function required(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export async function getArtistSubscriptionByStripeSubscriptionId(stripeSubscriptionId: string) {
  const rows = await request<Record<string, unknown>[]>(`artist_subscriptions?stripe_subscription_id=eq.${encodeURIComponent(stripeSubscriptionId)}&select=*&limit=1`);
  return rows[0] ?? null;
}

export async function updateArtistSubscriptionByStripeSubscriptionId(stripeSubscriptionId: string, payload: Record<string, unknown>) {
  await request<Record<string, unknown>[]>(`artist_subscriptions?stripe_subscription_id=eq.${encodeURIComponent(stripeSubscriptionId)}`, {
    method: 'PATCH',
    headers: {
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  });
}

export async function getOrderByCheckoutSessionId(checkoutSessionId: string) {
  const rows = await request<Record<string, unknown>[]>(`orders?stripe_checkout_session_id=eq.${encodeURIComponent(checkoutSessionId)}&select=*&limit=1`);
  return rows[0] ?? null;
}

export async function updateOrderByCheckoutSessionId(checkoutSessionId: string, payload: Record<string, unknown>) {
  await request<Record<string, unknown>[]>(`orders?stripe_checkout_session_id=eq.${encodeURIComponent(checkoutSessionId)}`, {
    method: 'PATCH',
    headers: {
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  });
}
