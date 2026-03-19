// Runtime wiring for agents, memory, and websocket broadcast.
import { styleAgent, rhythmAgent, physicsAgent } from "@murmur/agents";
import { SessionMemoryCore, fuseAgentOutputs } from "@murmur/cognitive-core";
import { planMotionFrame } from "@murmur/motion-planner";
import type { AgentInput, AgentResult, StudioMode } from "@murmur/shared";
import type { Server as WSServer } from "ws";

export const memoryCore = new SessionMemoryCore();
export const agents = [styleAgent, rhythmAgent, physicsAgent];

export async function evaluateAgents(input: AgentInput): Promise<AgentResult[]> {
  const memory = memoryCore.get(input.sessionId);
  const active = agents.filter((agent) => agent.canRun(input));
  return Promise.all(active.map((agent) => agent.evaluate(input, { memory, now: Date.now })));
}

export async function fuseAndPlan(sessionId: string, mode: StudioMode, outputs: AgentResult[]) {
  const fused = fuseAgentOutputs(mode, outputs);
  const frame = planMotionFrame(sessionId, fused);
  return { fused, frame };
}

export function broadcast(ws: WSServer, payload: unknown) {
  ws.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(payload));
    }
  });
}
