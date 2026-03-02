import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { ACCESS_TOKEN_COOKIE, signOut } from '@/lib/supabase/auth';
import { clearAuthCookies } from '@/lib/supabase/cookies';
import { hasSupabaseEnv } from '@/lib/supabase/env';

export async function POST() {
  const accessToken = cookies().get(ACCESS_TOKEN_COOKIE)?.value;

  if (accessToken && hasSupabaseEnv) {
    try {
      await signOut(accessToken);
    } catch {
      // Always clear local cookies, even if remote revoke fails.
    }
  }

  const response = NextResponse.json({ ok: true });
  clearAuthCookies(response);
  return response;
}
