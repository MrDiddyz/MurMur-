import { jwtDecode } from '@/lib/supabase/jwt';
import { requireSupabaseEnv } from '@/lib/supabase/env';

export const ACCESS_TOKEN_COOKIE = 'sb-access-token';
export const REFRESH_TOKEN_COOKIE = 'sb-refresh-token';

type SupabaseAuthSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user?: {
    id: string;
    email?: string;
  };
};

type VerifyOtpResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user?: {
    id: string;
    email?: string;
  };
};

async function supabaseFetch<T>(path: string, init: RequestInit): Promise<T> {
  const { url, anonKey } = requireSupabaseEnv();
  const response = await fetch(`${url}/auth/v1${path}`, {
    ...init,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase auth error (${response.status}): ${message}`);
  }

  return response.json() as Promise<T>;
}

export async function signInWithPassword(email: string, password: string) {
  return supabaseFetch<SupabaseAuthSession>('/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function signUpWithPassword(email: string, password: string, emailRedirectTo?: string) {
  return supabaseFetch<SupabaseAuthSession>('/signup', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      ...(emailRedirectTo ? { email_redirect_to: emailRedirectTo } : {}),
    }),
  });
}

export async function sendMagicLink(email: string, emailRedirectTo: string) {
  return supabaseFetch<{ message_id: string }>('/otp', {
    method: 'POST',
    body: JSON.stringify({
      email,
      create_user: true,
      email_redirect_to: emailRedirectTo,
    }),
  });
}

export async function verifyOtpToken(tokenHash: string, type: string) {
  return supabaseFetch<VerifyOtpResponse>('/verify', {
    method: 'POST',
    body: JSON.stringify({
      token_hash: tokenHash,
      type,
    }),
  });
}

export async function refreshSession(refreshToken: string) {
  return supabaseFetch<SupabaseAuthSession>('/token?grant_type=refresh_token', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export async function signOut(accessToken: string) {
  const { url, anonKey } = requireSupabaseEnv();
  await fetch(`${url}/auth/v1/logout`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });
}

export function getGoogleAuthUrl(redirectTo: string) {
  const { url, anonKey } = requireSupabaseEnv();
  const authUrl = new URL(`${url}/auth/v1/authorize`);
  authUrl.searchParams.set('provider', 'google');
  authUrl.searchParams.set('redirect_to', redirectTo);
  authUrl.searchParams.set('flow_type', 'implicit');
  authUrl.searchParams.set('apikey', anonKey);

  return authUrl.toString();
}

export function readUserFromAccessToken(accessToken?: string | null): { userId: string; email?: string } | null {
  if (!accessToken) {
    return null;
  }

  try {
    const payload = jwtDecode(accessToken) as { sub?: string; email?: string };
    if (!payload.sub) {
      return null;
    }
    return { userId: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}
