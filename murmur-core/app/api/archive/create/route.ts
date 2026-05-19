import { NextResponse } from "next/server";
import { createArchiveItem } from "@/lib/archive/service";
import { logEvent } from "@/lib/events/logger";

export async function POST(req: Request) {
  const body = await req.json();
  const item = await createArchiveItem(body);
  logEvent({ event_id: crypto.randomUUID(), type: "archive_created", source: "api/archive/create", timestamp: new Date().toISOString(), user_id: "system", payload: { id: item.id } });
  return NextResponse.json(item);
}
