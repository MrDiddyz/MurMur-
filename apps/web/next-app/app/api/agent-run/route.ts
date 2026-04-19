import { NextRequest, NextResponse } from "next/server";

interface AgentRunBody {
  agentId?: string;
  input?: string;
  sessionId?: string;
}

export async function POST(request: NextRequest) {
  let body: AgentRunBody;
  try {
    body = (await request.json()) as AgentRunBody;
  } catch {
    return NextResponse.json({ error: "Malformed JSON body." }, { status: 400 });
  }

  const agentId = (body.agentId ?? "").trim();
  const input = body.input?.trim();
  const sessionId = body.sessionId?.trim();

  if (!agentId) {
    return NextResponse.json({ error: "Invalid agentId." }, { status: 400 });
  }

  if (!input) {
    return NextResponse.json({ error: "input is required." }, { status: 400 });
  }

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
  }

  return NextResponse.json(
    {
      error: "Agent runtime module is not wired in next-app yet.",
      hint: "Connect route to your preferred agent backend and replace this placeholder.",
      received: { agentId, input, sessionId },
    },
    { status: 501 },
  );
}
