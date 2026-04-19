import { NextResponse } from "next/server";
import { runAgents } from "@/lib/agents";
import { scoreAgents } from "@/lib/council";
import { applyWin, getAgentStats } from "@/lib/memory";
import { serverSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = (await request.json()) as { input?: string };
  const input = body.input?.trim();

  if (!input) {
    return NextResponse.json({ error: "input is required" }, { status: 400 });
  }

  const results = runAgents(input);
  const stats = await getAgentStats();
  const { scores, winner } = scoreAgents(results, stats);

  const outputs = Object.fromEntries(results.map((r) => [r.agent, r.output]));
  const scoreMap = Object.fromEntries(scores.map((s) => [s.agent, s.breakdown]));

  await serverSupabase.from("runs").insert({
    input,
    outputs,
    scores: scoreMap,
    winner
  });

  await applyWin(winner);

  return NextResponse.json({ input, outputs, scores: scoreMap, winner });
}
