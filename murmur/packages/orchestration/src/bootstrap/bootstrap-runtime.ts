import { TeacherAgent } from "@murmur/agents-teacher";
import { ExperimentalAgent } from "@murmur/agents-experimental";
import { ThinktankAgent } from "@murmur/agents-thinktank";
import { ReflectiveAgent } from "@murmur/agents-reflective";
import { workflows } from "@murmur/workflows";
import { AgentRegistry } from "../registry/agent-registry";
import { ToolRegistry } from "../registry/tool-registry";
import { WorkflowRegistry } from "../registry/workflow-registry";
import { WorkflowRunner } from "../runtime/workflow-runner";

export type MurmurRuntime = {
  agentRegistry: AgentRegistry;
  toolRegistry: ToolRegistry;
  workflowRegistry: WorkflowRegistry;
  workflowRunner: WorkflowRunner;
};

export function bootstrapRuntime(): MurmurRuntime {
  const agentRegistry = new AgentRegistry();
  const toolRegistry = new ToolRegistry();
  const workflowRegistry = new WorkflowRegistry();

  agentRegistry.register(new TeacherAgent());
  agentRegistry.register(new ExperimentalAgent());
  agentRegistry.register(new ThinktankAgent());
  agentRegistry.register(new ReflectiveAgent());

  for (const workflow of workflows) {
    workflowRegistry.register(workflow);
  }

  toolRegistry.register({
    name: "echo",
    description: "Returns the provided input as-is.",
    handler: async (input) => input,
  });

  const workflowRunner = new WorkflowRunner(workflowRegistry, agentRegistry);

  return {
    agentRegistry,
    toolRegistry,
    workflowRegistry,
    workflowRunner,
  };
}
