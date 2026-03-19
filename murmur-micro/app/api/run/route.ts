import { NextResponse } from "next/server";
import { runMurmur } from "@/lib/murmur-run";
import { getSupabaseAdmin } from "@/lib/supabase";

interface RunRequest {
  prompt?: string;
}

const MAX_PROMPT_LENGTH = 6000;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RunRequest;
    const prompt = body.prompt?.trim();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json(
        { error: `Prompt is too long (max ${MAX_PROMPT_LENGTH} characters)` },
        { status: 400 }
      );
    }

    const run = await runMurmur(prompt);
    const supabaseAdmin = getSupabaseAdmin();

    const { data: episode, error: episodeError } = await supabaseAdmin
      .from("episodes")
      .insert({
        user_prompt: prompt,
        final_output: run.final,
        winner_agent: run.winner,
        rationale: run.rationale,
        score: run.score
      })
      .select("id")
      .single();

    if (episodeError || !episode) {
      throw new Error(episodeError?.message || "Failed to write episode");
    }

    const traceRows = run.trace.map((step) => ({
      episode_id: episode.id,
      agent_name: step.agent,
      input_text: step.input,
      output_text: step.output,
      score: step.score ?? null
    }));

    const { error: traceError } = await supabaseAdmin.from("agent_runs").insert(traceRows);
    if (traceError) {
      throw new Error(traceError.message);
    }

    return NextResponse.json({
      episodeId: episode.id,
      final: run.final,
      winner: run.winner,
      rationale: run.rationale,
      score: run.score,
      trace: run.trace
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    // Check if this is a client error (malformed JSON request) or server error
    const status = error instanceof SyntaxError ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
