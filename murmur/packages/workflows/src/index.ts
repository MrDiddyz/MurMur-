import type { WorkflowDefinition } from "@murmur/shared";

export class WorkflowRegistry {
  private readonly workflows = new Map<string, WorkflowDefinition>();

  register(workflow: WorkflowDefinition): this {
    this.workflows.set(workflow.id, workflow);
    return this;
  }

  get(workflowId: string): WorkflowDefinition {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error(`Workflow not found: ${workflowId}`);
    return workflow;
  }

  list(): WorkflowDefinition[] {
    return [...this.workflows.values()];
  }
}

export const murmurCoreV2Workflow: WorkflowDefinition = {
  id: "murmur-core-v2",
  name: "Murmur Core v2",
  description: "Teacher → Experimental → Thinktank → Reflective → Evaluator → Evolution",
  agentSequence: ["teacher", "experimental", "thinktank", "reflective", "evaluator", "evolution"]
};

export const murmurFastWorkflow: WorkflowDefinition = {
  id: "murmur-fast",
  name: "Murmur Fast",
  description: "Teacher → Experimental → Reflective → Evaluator",
  agentSequence: ["teacher", "experimental", "reflective", "evaluator"]
};

export const murmurReviewWorkflow: WorkflowDefinition = {
  id: "murmur-review",
  name: "Murmur Review",
  description: "Reflective → Evaluator → Evolution",
  agentSequence: ["reflective", "evaluator", "evolution"]
};
