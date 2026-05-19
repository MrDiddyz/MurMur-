import { NextResponse } from "next/server";
import { runCouncil } from "@/lib/council/service";
import { logEvent } from "@/lib/events/logger";

export async function POST(req: Request) {
  const body = await req.json();
  const result = await runCouncil(body.topic ?? "current decision");
  logEvent({ event_id: crypto.randomUUID(), type: "council_completed", source: "api/council/run", timestamp: new Date().toISOString(), user_id: "system", payload: result.final });
  return NextResponse.json(result);
}
