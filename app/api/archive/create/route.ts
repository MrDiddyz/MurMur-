import { NextRequest, NextResponse } from "next/server";
import { createArchiveItem } from "@/lib/archive/service";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = await createArchiveItem(body);
  return NextResponse.json(data);
}
