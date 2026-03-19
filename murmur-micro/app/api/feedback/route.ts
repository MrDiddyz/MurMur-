import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { FeedbackValue } from "@/types/murmur";

interface FeedbackRequest {
  episodeId?: string;
  feedback?: FeedbackValue;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FeedbackRequest;
    const episodeId = body.episodeId?.trim();
    const feedback = body.feedback;

    if (!episodeId) {
      return NextResponse.json({ error: "episodeId is required" }, { status: 400 });
    }

    if (feedback !== 1 && feedback !== -1) {
      return NextResponse.json({ error: "feedback must be 1 or -1" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("episodes")
      .update({ feedback })
      .eq("id", episodeId)
      .select("id")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return NextResponse.json({ error: "Episode not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    // Check if this is a client error (malformed JSON request) or server error
    const status = error instanceof SyntaxError ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
