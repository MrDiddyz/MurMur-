import { eventBus } from "../events/bus";
import { MirrorAgent, PilotAgent, WeaverAgent } from "./agents";
import type { Agent, AgentId, AgentRunRequest, AgentRunResult } from "./types";

const agents: Record<AgentId, Agent> = {
  pilot: new PilotAgent(),
  weaver: new WeaverAgent(),
  mirror: new MirrorAgent()
};

export function normalizeAgentId(agentId: string): AgentId | null {
  const normalized = agentId.trim().toLowerCase();

  if (normalized === "pilot" || normalized === "weaver" || normalized === "mirror") {
    return normalized;
  }

  return null;
}

export async function runAgent(agentId: AgentId, request: AgentRunRequest): Promise<AgentRunResult> {
  const agent = agents[agentId];

  eventBus.publish({
    sessionId: request.sessionId,
    agentId,
    type: "agent.run.started",
    payload: { input: request.input }
  });

  const output = await agent.run({
    agentId,
    input: request.input,
    sessionId: request.sessionId,
    eventBus
  });

  eventBus.publish({
    sessionId: request.sessionId,
    agentId,
    type: "agent.run.completed",
    payload: { output }
  });

  return {
    output,
    events: eventBus.list(request.sessionId)
  };
}

export type { AgentId, AgentRunRequest, AgentRunResult, AgentStructuredOutput } from "./types";
