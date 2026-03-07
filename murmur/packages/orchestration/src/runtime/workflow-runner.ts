import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { BaseAgent, EvaluationResult, EvolutionProposal, WorkflowRunInput, WorkflowRunResult, WorkflowRunStep } from "@murmur/agents-core";
import type { MemoryStore } from "@murmur/memory";
import type { AgentContext, ReflectionMemory, ToolCallRecord } from "@murmur/shared";
import { WorkflowRegistry } from "@murmur/workflows";
import { AgentRegistry } from "../registry/agent-registry.js";
import { PromptRegistry } from "../registry/prompt-registry.js";
import { ToolRegistry } from "../registry/tool-registry.js";

interface RunStoreShape {
  runs: WorkflowRunResult[];
}

export class WorkflowRunner {
  constructor(
    private readonly agentRegistry: AgentRegistry,
    private readonly workflowRegistry: WorkflowRegistry,
    private readonly promptRegistry: PromptRegistry,
    private readonly toolRegistry: ToolRegistry,
    private readonly memoryStore: MemoryStore,
    private readonly runsFilePath: string
  ) {}

  async run(input: WorkflowRunInput): Promise<WorkflowRunResult> {
    const routingDecisions: Array<{ reason: string; action: string }> = [];
    const effectiveWorkflowId = this.chooseWorkflow(input, routingDecisions);
    const workflow = this.workflowRegistry.get(effectiveWorkflowId);
    const memory = await this.memoryStore.search({ objective: input.objective, workflowId: effectiveWorkflowId, limit: 6 });

    const context: AgentContext = {
      runId: input.runId,
      workflowId: effectiveWorkflowId,
      projectId: input.projectId,
      messages: [input.objective],
      memory,
      availableTools: this.toolRegistry.list().map((tool) => tool.name),
      priorSteps: [],
      promptVersions: this.promptRegistry.list(),
      metadata: { originalWorkflowId: input.workflowId },
      toolCalls: []
    };

    let evaluation: EvaluationResult | undefined;
    let evolution: EvolutionProposal[] | undefined;
    const memoryWrites: Awaited<ReturnType<MemoryStore["write"]>>[] = [];

    try {
      for (const role of workflow.agentSequence) {
        const result = await this.executeAgent(this.agentRegistry.get(role), input, context);
        const step: WorkflowRunStep = {
          agentRole: role,
          stage: result.stage,
          output: result.output,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          summary: result.summary,
          toolCalls: context.toolCalls.slice(-3)
        };
        context.priorSteps.push(step);

        if (role === "experimental" && this.experimentalWeak(result.output as { variants?: unknown[] })) {
          routingDecisions.push({ reason: "Experimental variants too weak", action: "rerun-experimental" });
          const rerun = await this.executeAgent(this.agentRegistry.get("experimental"), input, context);
          context.priorSteps.push({ ...step, output: rerun.output, summary: `${rerun.summary} (rerun)` });
        }

        if (role === "thinktank") {
          const synth = result.output as { panel?: Array<{ confidence?: number }> };
          const confidence = (synth.panel ?? []).reduce((acc, p) => acc + (p.confidence ?? 0), 0) / Math.max(1, synth.panel?.length ?? 0);
          if (confidence < 0.7) {
            routingDecisions.push({ reason: "Thinktank confidence weak", action: "rerun-thinktank" });
            const rerun = await this.executeAgent(this.agentRegistry.get("thinktank"), input, context);
            context.priorSteps.push({ ...step, output: rerun.output, summary: `${rerun.summary} (rerun)` });
          }
        }

        if (role === "reflective") {
          const reflection = result.output as { shouldPersistMemory?: boolean; memoryCandidates?: ReflectionMemory[] };
          if (reflection.shouldPersistMemory) {
            for (const candidate of reflection.memoryCandidates ?? []) {
              memoryWrites.push(
                await this.memoryStore.write({
                  ...candidate,
                  runId: input.runId,
                  workflowId: effectiveWorkflowId,
                  sourceAgent: "reflective"
                })
              );
            }
          }
        }

        if (role === "evaluator") {
          evaluation = result.output as EvaluationResult;
        }

        if (role === "evolution") {
          const evo = result.output as { proposals: EvolutionProposal[] };
          evolution = evo.proposals.map((proposal) => ({
            ...proposal,
            runId: input.runId,
            workflowId: effectiveWorkflowId,
            createdAt: new Date().toISOString()
          }));
        }
      }

      if (!evaluation && context.priorSteps.some((step) => step.agentRole === "reflective")) {
        const evalResult = await this.executeAgent(this.agentRegistry.get("evaluator"), input, context);
        evaluation = evalResult.output as EvaluationResult;
        context.priorSteps.push({
          agentRole: "evaluator",
          stage: evalResult.stage,
          output: evalResult.output,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          summary: evalResult.summary,
          toolCalls: context.toolCalls.slice(-3)
        });
      }

      if (evaluation && !evolution && evaluation.scores.overall >= 55 && this.agentExists("evolution")) {
        const evoResult = await this.executeAgent(this.agentRegistry.get("evolution"), input, context);
        const evo = evoResult.output as { proposals: EvolutionProposal[] };
        evolution = evo.proposals.map((proposal) => ({
          ...proposal,
          runId: input.runId,
          workflowId: effectiveWorkflowId,
          createdAt: new Date().toISOString()
        }));
        context.priorSteps.push({
          agentRole: "evolution",
          stage: evoResult.stage,
          output: evoResult.output,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          summary: evoResult.summary,
          toolCalls: context.toolCalls.slice(-3)
        });
      } else if (evaluation && evaluation.scores.overall < 55) {
        routingDecisions.push({ reason: "Low-value run", action: "skip-evolution" });
      }

      const finalOutput = context.priorSteps.findLast((step) => step.agentRole === "reflective")?.output ?? context.priorSteps.at(-1)?.output ?? null;
      const result: WorkflowRunResult = {
        runId: input.runId,
        workflowId: effectiveWorkflowId,
        status: "completed",
        steps: context.priorSteps,
        finalOutput,
        evaluation,
        memoryWrites,
        evolution,
        routingDecisions,
        promptVersions: context.promptVersions,
        toolCalls: context.toolCalls
      };
      await this.persistRun(result);
      await this.memoryStore.prune();
      return result;
    } catch (error) {
      const failed: WorkflowRunResult = {
        runId: input.runId,
        workflowId: effectiveWorkflowId,
        status: "failed",
        steps: context.priorSteps,
        finalOutput: null,
        routingDecisions,
        promptVersions: context.promptVersions,
        toolCalls: context.toolCalls,
        error: error instanceof Error ? error.message : String(error)
      };
      await this.persistRun(failed);
      return failed;
    }
  }

  async getRun(runId: string): Promise<WorkflowRunResult | undefined> {
    const data = await this.loadRuns();
    return data.runs.find((run) => run.runId === runId);
  }

  async listRuns(limit = 20): Promise<WorkflowRunResult[]> {
    const data = await this.loadRuns();
    return [...data.runs].sort((a, b) => b.runId.localeCompare(a.runId)).slice(0, limit);
  }

  private chooseWorkflow(input: WorkflowRunInput, routing: Array<{ reason: string; action: string }>): string {
    if (input.workflowId !== "auto") return input.workflowId;
    if (input.objective.length < 80) {
      routing.push({ reason: "Input complexity low", action: "use-murmur-fast" });
      return "murmur-fast";
    }
    return "murmur-core-v2";
  }

  private async executeAgent(agent: BaseAgent, input: WorkflowRunInput, context: AgentContext) {
    const toolName = context.availableTools.includes("summarizeObject") ? "summarizeObject" : "echo";
    const tool = this.toolRegistry.get(toolName);
    const toolInput = { objective: input.objective, steps: context.priorSteps.length };
    let toolOutput: unknown;
    let success = true;
    let error: string | undefined;

    try {
      toolOutput = await tool.handler(toolInput);
    } catch (toolError) {
      success = false;
      error = toolError instanceof Error ? toolError.message : String(toolError);
      toolOutput = null;
    }

    const toolRecord: ToolCallRecord = {
      toolName,
      input: toolInput,
      output: toolOutput,
      success,
      timestamp: new Date().toISOString(),
      error
    };
    context.toolCalls.push(toolRecord);

    return agent.run({ objective: input.objective, input: input.input }, context);
  }

  private experimentalWeak(output: { variants?: unknown[] }): boolean {
    return (output.variants?.length ?? 0) < 2;
  }

  private agentExists(role: "evolution"): boolean {
    try {
      this.agentRegistry.get(role);
      return true;
    } catch {
      return false;
    }
  }

  private async persistRun(run: WorkflowRunResult): Promise<void> {
    const data = await this.loadRuns();
    data.runs.push(run);
    await this.saveRuns(data);
  }

  private async loadRuns(): Promise<RunStoreShape> {
    await mkdir(dirname(this.runsFilePath), { recursive: true });
    try {
      const content = await readFile(this.runsFilePath, "utf8");
      const parsed = JSON.parse(content) as RunStoreShape;
      return { runs: parsed.runs ?? [] };
    } catch {
      return { runs: [] };
    }
  }

  private async saveRuns(data: RunStoreShape): Promise<void> {
    await mkdir(dirname(this.runsFilePath), { recursive: true });
    await writeFile(this.runsFilePath, JSON.stringify(data, null, 2), "utf8");
  }
}
