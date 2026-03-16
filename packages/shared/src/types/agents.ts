// Agent contracts for modular AI evaluators.
import type { StudioEvent } from "./events.js";
import type { SessionMemorySnapshot, StudioMode } from "./sessions.js";

export interface AgentInput {
  sessionId: string;
  mode: StudioMode;
  events: StudioEvent[];
}

export interface AgentContext {
  memory: SessionMemorySnapshot;
  now: () => number;
}

export interface AgentResult {
  agentId: string;
  confidence: number;
  directives: Record<string, number>;
  reasoning?: string;
}

export interface AgentContract {
  id: string;
  canRun(input: AgentInput): boolean;
  evaluate(input: AgentInput, context: AgentContext): Promise<AgentResult>;
}
