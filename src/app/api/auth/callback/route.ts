import { NextResponse } from 'next/server';

import { setAuthCookies } from '@/lib/supabase/cookies';
import { readUserFromAccessToken, verifyOtpToken } from '@/lib/supabase/auth';
import { hasSupabaseEnv } from '@/lib/supabase/env';

function toSettingsRedirect(request: Request, error?: string) {
  const url = new URL('/settings', request.url);
  if (error) {
    url.searchParams.set('authError', error);
  }
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const accessToken = url.searchParams.get('access_token');
  const refreshToken = url.searchParams.get('refresh_token');
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');
  const expiresInRaw = Number(url.searchParams.get('expires_in') ?? '3600');
  const expiresIn = Number.isFinite(expiresInRaw) && expiresInRaw > 0 ? expiresInRaw : 3600;

  if (accessToken && refreshToken) {
    const response = toSettingsRedirect(request);
    setAuthCookies(response, accessToken, refreshToken, expiresIn);
    return response;
  }

  if (tokenHash && type) {
    if (!hasSupabaseEnv) {
      return toSettingsRedirect(request, 'missing_supabase_env');
    }

    try {
      const session = await verifyOtpToken(tokenHash, type);
      const response = toSettingsRedirect(request);
      setAuthCookies(response, session.access_token, session.refresh_token, session.expires_in);
      return response;
    } catch {
      return toSettingsRedirect(request, 'otp_verification_failed');
    }
  }

  return toSettingsRedirect(request, 'missing_callback_tokens');
}

export async function POST(request: Request) {
  const {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: expiresIn,
    token_hash: tokenHash,
    type,
  } =
    (await request.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
      token_hash?: string;
      type?: string;
    };

  if (tokenHash && type) {
    if (!hasSupabaseEnv) {
      return NextResponse.json({ error: 'Supabase env vars are missing.' }, { status: 500 });
    }

    try {
      const session = await verifyOtpToken(tokenHash, type);
      const user = readUserFromAccessToken(session.access_token);
      const response = NextResponse.json({ ok: true, user });
      setAuthCookies(response, session.access_token, session.refresh_token, session.expires_in);
      return response;
    } catch {
      return NextResponse.json({ error: 'OTP verification failed.' }, { status: 400 });
    }
  }

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: 'Missing session tokens from callback.' }, { status: 400 });
  }

  const user = readUserFromAccessToken(accessToken);
  const response = NextResponse.json({ ok: true, user });
  setAuthCookies(response, accessToken, refreshToken, expiresIn ?? 3600);
  return response;
}
