import type { AgentEvent, EventBus } from "../events/bus";

export type AgentId = "pilot" | "weaver" | "mirror";

export interface AgentRunRequest {
  input: string;
  sessionId: string;
}

export interface AgentStructuredOutput {
  plan: string;
  code: string;
  test: string;
  nextStep: string;
}

export interface AgentRunContext {
  agentId: AgentId;
  input: string;
  sessionId: string;
  eventBus: EventBus;
}

export interface AgentRunResult {
  output: AgentStructuredOutput;
  events: AgentEvent[];
}

export interface Agent {
  id: AgentId;
  run(context: AgentRunContext): Promise<AgentStructuredOutput>;
}
