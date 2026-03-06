import type { BaseAgent, AgentRole } from "@murmur/agents-core";

export class AgentRegistry {
  private readonly agents = new Map<string, BaseAgent>();

  register(agent: BaseAgent): void {
    this.agents.set(agent.role, agent);
  }

  get(role: AgentRole): BaseAgent {
    const agent = this.agents.get(role);

    if (!agent) {
      throw new Error(`Agent not registered for role: ${role}`);
    }

    return agent;
  }

  list(): BaseAgent[] {
    return Array.from(this.agents.values());
  }
}
