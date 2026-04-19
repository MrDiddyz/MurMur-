import { NextResponse } from "next/server";
import { anonSupabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (!token_hash || !type) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const { data, error } = await anonSupabase.auth.verifyOtp({
    token_hash,
    type: type as "email"
  });

  if (error || !data.session) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const response = NextResponse.redirect(`${origin}/dashboard`);
  response.cookies.set("murmur-access-token", data.session.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });

  return response;
}
