import type { AgentContext, AgentResult, AgentRole, AgentTask } from "@murmur/shared";

export interface BaseAgent<TOutput = unknown> {
  readonly name: string;
  readonly role: AgentRole;
  readonly promptVersion: string;
  readonly promptDescription: string;
  run(task: AgentTask, context: AgentContext): Promise<AgentResult<TOutput>>;
}
