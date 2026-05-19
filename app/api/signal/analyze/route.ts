import { NextRequest, NextResponse } from "next/server";
import { analyzeSignal } from "@/lib/signal/service";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = await analyzeSignal(body);
  return NextResponse.json(data);
}
