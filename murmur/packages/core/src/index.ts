import { AgentRegistry } from "@murmur/agents-core";
import { ExperimentalAgent } from "@murmur/agents-experimental";
import { ReflectiveAgent } from "@murmur/agents-reflective";
import { TeacherAgent } from "@murmur/agents-teacher";
import { ThinktankAgent } from "@murmur/agents-thinktank";
import { WorkflowRunner } from "@murmur/orchestration";
import { murmurWorkflow, WorkflowRegistry } from "@murmur/workflows";

export interface Runtime {
  workflowRunner: WorkflowRunner;
  agentRegistry: AgentRegistry;
  workflowRegistry: WorkflowRegistry;
}

export function bootstrapRuntime(): Runtime {
  const agentRegistry = new AgentRegistry()
    .register(new TeacherAgent())
    .register(new ExperimentalAgent())
    .register(new ThinktankAgent())
    .register(new ReflectiveAgent());

  const workflowRegistry = new WorkflowRegistry().register(murmurWorkflow);

  const workflowRunner = new WorkflowRunner(agentRegistry);

  return {
    workflowRunner,
    agentRegistry,
    workflowRegistry
  };
}
