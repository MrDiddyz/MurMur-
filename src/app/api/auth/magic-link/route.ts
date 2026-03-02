import { NextResponse } from 'next/server';

import { hasSupabaseEnv } from '@/lib/supabase/env';
import { sendMagicLink } from '@/lib/supabase/auth';

export async function POST(request: Request) {
  const { email: rawEmail } = (await request.json()) as { email?: string };
  const email = rawEmail?.trim();
  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  if (!email.includes('@')) {
    return NextResponse.json({ error: 'Email format is invalid.' }, { status: 400 });
  }

  if (!hasSupabaseEnv) {
    return NextResponse.json({ error: 'Supabase env vars are missing.' }, { status: 500 });
  }

  const origin = new URL(request.url).origin;

  try {
    await sendMagicLink(email, `${origin}/auth/callback`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
