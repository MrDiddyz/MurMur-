import { NextRequest, NextResponse } from "next/server";
import { normalizeAgentId, runAgent } from "@core/agents";

interface AgentRunBody {
  agentId?: string;
  input?: string;
  sessionId?: string;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as AgentRunBody;

  const agentId = normalizeAgentId(body.agentId ?? "");
  const input = body.input?.trim();
  const sessionId = body.sessionId?.trim();

  if (!agentId) {
    return NextResponse.json({ error: "Invalid agentId. Use Pilot, Weaver, or Mirror." }, { status: 400 });
  }

  if (!input) {
    return NextResponse.json({ error: "input is required." }, { status: 400 });
  }

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
  }

  const result = await runAgent(agentId, { input, sessionId });
  return NextResponse.json({ output: result.output, events: result.events });
}
