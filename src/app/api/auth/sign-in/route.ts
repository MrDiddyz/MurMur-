import { NextResponse } from 'next/server';

import { setAuthCookies } from '@/lib/supabase/cookies';
import { hasSupabaseEnv } from '@/lib/supabase/env';
import { signInWithPassword } from '@/lib/supabase/auth';

export async function POST(request: Request) {
  const { email: rawEmail, password } = (await request.json()) as { email?: string; password?: string };
  const email = rawEmail?.trim();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  if (!email.includes('@')) {
    return NextResponse.json({ error: 'Email format is invalid.' }, { status: 400 });
  }

  if (!hasSupabaseEnv) {
    return NextResponse.json({ error: 'Supabase env vars are missing.' }, { status: 500 });
  }

  try {
    const session = await signInWithPassword(email, password);
    const response = NextResponse.json({ ok: true, user: session.user ?? null });
    setAuthCookies(response, session.access_token, session.refresh_token, session.expires_in);
    return response;
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 401 });
  }
}
