import type { BaseAgent } from "@murmur/agents-core";
import type { PromptVersion } from "@murmur/shared";

export class PromptRegistry {
  private readonly prompts = new Map<string, PromptVersion>();

  registerAgent(agent: BaseAgent): this {
    this.prompts.set(agent.role, {
      agentRole: agent.role,
      version: agent.promptVersion,
      description: agent.promptDescription
    });
    return this;
  }

  list(): PromptVersion[] {
    return [...this.prompts.values()];
  }
}
