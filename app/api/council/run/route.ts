import { NextRequest, NextResponse } from "next/server";
import { runCouncil } from "@/lib/council/service";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = await runCouncil(body);
  return NextResponse.json(data);
}
