import { NextRequest, NextResponse } from "next/server";
import { applyAdaptiveFeedback } from "@/lib/scheduler/feedback";
import { markPostPublished } from "@/lib/scheduler/repository";

export async function POST(request: NextRequest) {
  const { post_id } = (await request.json()) as { post_id?: string };
  if (!post_id) {
    return NextResponse.json({ error: "post_id is required" }, { status: 400 });
  }

  await markPostPublished(post_id);
  await applyAdaptiveFeedback(post_id);

  return NextResponse.json({ ok: true });
}
