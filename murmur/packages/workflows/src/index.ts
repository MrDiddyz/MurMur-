import type { AgentId } from "@murmur/agents-core";

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  agentSequence: [AgentId, AgentId, AgentId, AgentId];
}

export class WorkflowRegistry {
  private readonly workflows = new Map<string, WorkflowDefinition>();

  register(workflow: WorkflowDefinition): this {
    this.workflows.set(workflow.id, workflow);
    return this;
  }

  get(workflowId: string): WorkflowDefinition {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }
    return workflow;
  }
}

export const murmurWorkflow: WorkflowDefinition = {
  id: "murmur",
  name: "Murmur multi-agent reasoning workflow",
  description:
    "Teacher → Experimental → Thinktank → Reflective pipeline for structured reasoning and synthesis.",
  agentSequence: ["teacher", "experimental", "thinktank", "reflective"]
};
