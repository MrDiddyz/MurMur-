import type { BaseAgent } from "@murmur/agents-core";
import type { AgentRole } from "@murmur/shared";

export class AgentRegistry {
  private readonly agents = new Map<AgentRole, BaseAgent>();

  register<T extends BaseAgent>(agent: T): this {
    this.agents.set(agent.role, agent);
    return this;
  }

  get(role: AgentRole): BaseAgent {
    const agent = this.agents.get(role);
    if (!agent) throw new Error(`Agent not registered: ${role}`);
    return agent;
  }

  list(): BaseAgent[] {
    return [...this.agents.values()];
  }
}
