import { NextResponse } from "next/server";
import { getAgentStats } from "@/lib/memory";

export async function GET() {
  const stats = await getAgentStats();
  return NextResponse.json({ stats });
}
