import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!baseUrl) {
    return NextResponse.json({ error: "NEXT_PUBLIC_APP_URL missing" }, { status: 500 });
  }

  const response = await fetch(`${baseUrl}/api/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: "Auto-run strategic checkpoint" })
  });

  const payload = await response.json();
  return NextResponse.json({ ok: true, payload });
}
