import type { AgentContext, AgentRole, AgentTask, AgentResult } from "@murmur/agents-core";
import type { AgentRegistry } from "../registry/agent-registry";
import type { WorkflowRegistry } from "../registry/workflow-registry";

export type WorkflowRunInput = {
  workflowId: string;
  runId: string;
  projectId?: string;
  goal: string;
  input: Record<string, unknown>;
};

export type WorkflowStep = "teacher" | "experimental" | "thinktank" | "reflective";

export type WorkflowRunStep = {
  step: WorkflowStep;
  summary: string;
  output: Record<string, unknown>;
  score?: number;
};

export type WorkflowRunResult = {
  runId: string;
  workflowId: string;
  status: "completed";
  steps: WorkflowRunStep[];
  finalOutput: Record<string, unknown>;
};

type StepDefinition = {
  step: WorkflowStep;
  type: AgentTask["type"];
  buildInput: (state: {
    baseInput: Record<string, unknown>;
    outputs: Partial<Record<WorkflowStep, Record<string, unknown>>>;
  }) => Record<string, unknown>;
};

const workflowSteps: StepDefinition[] = [
  {
    step: "teacher",
    type: "plan",
    buildInput: ({ baseInput }) => baseInput,
  },
  {
    step: "experimental",
    type: "explore",
    buildInput: ({ baseInput, outputs }) => ({
      ...baseInput,
      teacherOutput: outputs.teacher,
    }),
  },
  {
    step: "thinktank",
    type: "synthesize",
    buildInput: ({ baseInput, outputs }) => ({
      ...baseInput,
      teacherOutput: outputs.teacher,
      experimentalOutput: outputs.experimental,
    }),
  },
  {
    step: "reflective",
    type: "reflect",
    buildInput: ({ baseInput, outputs }) => ({
      ...baseInput,
      teacherOutput: outputs.teacher,
      experimentalOutput: outputs.experimental,
      thinktankOutput: outputs.thinktank,
    }),
  },
];

export class WorkflowRunner {
  constructor(
    private readonly workflowRegistry: WorkflowRegistry,
    private readonly agentRegistry: AgentRegistry,
  ) {}

  async run(input: WorkflowRunInput): Promise<WorkflowRunResult> {
    const workflow = this.workflowRegistry.get(input.workflowId);

    const context: AgentContext = {
      runId: input.runId,
      workflowId: workflow.id,
      projectId: input.projectId,
      messages: [{ role: "user", content: input.goal }],
      memory: {},
      tools: [],
    };

    const steps: WorkflowRunStep[] = [];
    const outputs: Partial<Record<WorkflowStep, Record<string, unknown>>> = {};

    for (let index = 0; index < workflowSteps.length; index += 1) {
      const current = workflowSteps[index];
      const expectedNextStep = workflowSteps[index + 1]?.step ?? "done";

      const task: AgentTask = {
        id: `${input.runId}:${current.step}`,
        type: current.type,
        goal: input.goal,
        input: current.buildInput({
          baseInput: input.input,
          outputs,
        }),
      };

      const result = await this.agentRegistry.get(current.step as AgentRole).run(task, context);

      if (result.nextStep && result.nextStep !== expectedNextStep) {
        throw new Error(
          `Unexpected nextStep from ${current.step}: expected ${expectedNextStep}, got ${result.nextStep}`,
        );
      }

      outputs[current.step] = result.output;
      steps.push(this.toRunStep(current.step, result));
    }

    return {
      runId: input.runId,
      workflowId: workflow.id,
      status: "completed",
      steps,
      finalOutput: outputs.reflective ?? {},
    };
  }

  private toRunStep(step: WorkflowStep, result: AgentResult): WorkflowRunStep {
    return {
      step,
      summary: result.summary,
      output: result.output,
      score: result.score,
    };
  }
}
