import { NextResponse } from "next/server";
import { analyzeSignal } from "@/lib/signal/service";
import { logEvent } from "@/lib/events/logger";

export async function POST(req: Request) {
  const body = await req.json();
  const result = await analyzeSignal(body);
  logEvent({ event_id: crypto.randomUUID(), type: "signal_generated", source: "api/signal/analyze", timestamp: new Date().toISOString(), user_id: "system", payload: result });
  return NextResponse.json(result);
}
