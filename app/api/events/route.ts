import { NextResponse } from "next/server";
import { getEvents } from "@/lib/events/logger";

export async function GET() {
  return NextResponse.json(getEvents());
}
