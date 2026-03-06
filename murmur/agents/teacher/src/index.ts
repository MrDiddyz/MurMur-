import type { AgentRequest, AgentResponse } from "@murmur/agent-contracts";

export function runTeacherAgent(input: AgentRequest): AgentResponse {
  return {
    content: `Teaching response: ${input.prompt}`,
    confidence: 0.75
  };
}
