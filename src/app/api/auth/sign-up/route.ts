import { NextResponse } from 'next/server';

import { hasSupabaseEnv } from '@/lib/supabase/env';
import { setAuthCookies } from '@/lib/supabase/cookies';
import { signUpWithPassword } from '@/lib/supabase/auth';

export async function POST(request: Request) {
  const { email: rawEmail, password } = (await request.json()) as { email?: string; password?: string };
  const email = rawEmail?.trim();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  if (!email.includes('@')) {
    return NextResponse.json({ error: 'Email format is invalid.' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }

  if (!hasSupabaseEnv) {
    return NextResponse.json({ error: 'Supabase env vars are missing.' }, { status: 500 });
  }

  const origin = new URL(request.url).origin;

  try {
    const session = await signUpWithPassword(email, password, `${origin}/auth/callback`);
    const response = NextResponse.json({ ok: true, user: session.user ?? null });

    if (session.access_token && session.refresh_token) {
      setAuthCookies(response, session.access_token, session.refresh_token, session.expires_in);
    }

    return response;
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
