import { NextResponse } from "next/server";
import { anonSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string };

  if (!body.email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL;
  const { error } = await anonSupabase.auth.signInWithOtp({
    email: body.email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`
    }
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
