export type WorkflowDefinition = {
  id: string;
  name: string;
  description: string;
  initialStep: "teacher";
};

export class WorkflowRegistry {
  private readonly workflows = new Map<string, WorkflowDefinition>();

  register(workflow: WorkflowDefinition): void {
    this.workflows.set(workflow.id, workflow);
  }

  get(workflowId: string): WorkflowDefinition {
    const workflow = this.workflows.get(workflowId);

    if (!workflow) {
      throw new Error(`Workflow not registered: ${workflowId}`);
    }

    return workflow;
  }

  list(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }
}
