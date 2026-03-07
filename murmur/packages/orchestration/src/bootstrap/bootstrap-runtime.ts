import { join } from "node:path";
import { ExperimentalAgent } from "@murmur/agents-experimental";
import { EvaluatorAgent } from "@murmur/agents-evaluator";
import { EvolutionAgent } from "@murmur/agents-evolution";
import { ReflectiveAgent } from "@murmur/agents-reflective";
import { TeacherAgent } from "@murmur/agents-teacher";
import { ThinktankAgent } from "@murmur/agents-thinktank";
import { FileMemoryStore } from "@murmur/memory";
import { murmurCoreV2Workflow, murmurFastWorkflow, murmurReviewWorkflow, WorkflowRegistry } from "@murmur/workflows";
import { AgentRegistry } from "../registry/agent-registry.js";
import { PromptRegistry } from "../registry/prompt-registry.js";
import { ToolRegistry } from "../registry/tool-registry.js";
import { WorkflowRunner } from "../runtime/workflow-runner.js";

export interface Runtime {
  agentRegistry: AgentRegistry;
  workflowRegistry: WorkflowRegistry;
  toolRegistry: ToolRegistry;
  promptRegistry: PromptRegistry;
  memoryStore: FileMemoryStore;
  workflowRunner: WorkflowRunner;
}

export function bootstrapRuntime(baseDir = process.cwd()): Runtime {
  const agentRegistry = new AgentRegistry();
  [
    new TeacherAgent(),
    new ExperimentalAgent(),
    new ThinktankAgent(),
    new ReflectiveAgent(),
    new EvaluatorAgent(),
    new EvolutionAgent()
  ].forEach((agent) => agentRegistry.register(agent));

  const workflowRegistry = new WorkflowRegistry()
    .register(murmurCoreV2Workflow)
    .register(murmurFastWorkflow)
    .register(murmurReviewWorkflow);

  const toolRegistry = new ToolRegistry()
    .register({ name: "echo", description: "Returns the same payload.", inputDescription: "any", handler: async (input) => input })
    .register({
      name: "scoreText",
      description: "Simple deterministic text scoring tool.",
      inputDescription: "{ text: string }",
      handler: async (input: { text?: string }) => ({ score: Math.min(100, Math.max(0, (input.text?.length ?? 0) * 2)) })
    })
    .register({
      name: "summarizeObject",
      description: "Summarizes object keys.",
      inputDescription: "object",
      handler: async (input: unknown) => {
        if (!input || typeof input !== "object") return "non-object";
        const keys = Object.keys(input as Record<string, unknown>);
        return `Object with keys: ${keys.join(", ") || "none"}`;
      }
    });

  const promptRegistry = new PromptRegistry();
  agentRegistry.list().forEach((agent) => promptRegistry.registerAgent(agent));

  const memoryStore = new FileMemoryStore(join(baseDir, ".murmur", "memory.json"));
  const workflowRunner = new WorkflowRunner(
    agentRegistry,
    workflowRegistry,
    promptRegistry,
    toolRegistry,
    memoryStore,
    join(baseDir, ".murmur", "runs.json")
  );

  return { agentRegistry, workflowRegistry, toolRegistry, promptRegistry, memoryStore, workflowRunner };
}
