declare module '@core/agents' {
  export type AgentId = 'pilot' | 'weaver' | 'mirror';

  export type AgentRunRequest = {
    input: string;
    sessionId: string;
  };

  export type AgentRunResult = {
    output: string;
    events: unknown[];
  };

  export function normalizeAgentId(agentId: string): AgentId | null;
  export function runAgent(agentId: AgentId, request: AgentRunRequest): Promise<AgentRunResult>;
}
