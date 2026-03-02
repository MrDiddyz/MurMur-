import { NextResponse } from 'next/server';

import { getGoogleAuthUrl } from '@/lib/supabase/auth';
import { hasSupabaseEnv } from '@/lib/supabase/env';

export async function GET(request: Request) {
  if (!hasSupabaseEnv) {
    return NextResponse.json({ error: 'Supabase env vars are missing.' }, { status: 500 });
  }

  const origin = new URL(request.url).origin;
  const authUrl = getGoogleAuthUrl(`${origin}/auth/callback`);
  return NextResponse.redirect(authUrl);
}
