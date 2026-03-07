import type {
  AgentId,
  AgentRegistry,
  ExperimentalOutput,
  ReflectiveOutput,
  TeacherOutput,
  ThinktankOutput,
  WorkflowContext,
  WorkflowRunPayload,
  WorkflowRunResult,
  WorkflowRunStep
} from "@murmur/agents-core";
import type { WorkflowRegistry } from "@murmur/workflows";

interface TeacherInput {
  goal: string;
  input: Record<string, unknown>;
}

interface ExperimentalInput {
  teacherOutput: TeacherOutput;
}

interface ThinktankInput {
  experimentalOutput: ExperimentalOutput;
}

interface ReflectiveInput {
  thinktankOutput: ThinktankOutput;
}

interface WorkflowIntermediates {
  teacherOutput?: TeacherOutput;
  experimentalOutput?: ExperimentalOutput;
  thinktankOutput?: ThinktankOutput;
  reflectiveOutput?: ReflectiveOutput;
}

export class WorkflowRunner {
  constructor(
    private readonly agentRegistry: AgentRegistry,
    private readonly workflowRegistry: WorkflowRegistry
  ) {}

  async run(payload: WorkflowRunPayload): Promise<WorkflowRunResult> {
    const workflow = this.workflowRegistry.get(payload.workflowId);

    const context: WorkflowContext = {
      workflowId: payload.workflowId,
      runId: payload.runId,
      goal: payload.goal,
      input: payload.input,
      history: []
    };

    const outputs: WorkflowIntermediates = {};

    for (const agentId of workflow.agentSequence) {
      switch (agentId) {
        case "teacher":
          outputs.teacherOutput = await this.runStep<TeacherInput, TeacherOutput>(
            context,
            "teacher",
            { goal: payload.goal, input: payload.input }
          );
          break;
        case "experimental":
          if (!outputs.teacherOutput) {
            throw new Error("Teacher output missing before experimental stage");
          }
          outputs.experimentalOutput = await this.runStep<ExperimentalInput, ExperimentalOutput>(
            context,
            "experimental",
            { teacherOutput: outputs.teacherOutput }
          );
          break;
        case "thinktank":
          if (!outputs.experimentalOutput) {
            throw new Error("Experimental output missing before thinktank stage");
          }
          outputs.thinktankOutput = await this.runStep<ThinktankInput, ThinktankOutput>(
            context,
            "thinktank",
            { experimentalOutput: outputs.experimentalOutput }
          );
          break;
        case "reflective":
          if (!outputs.thinktankOutput) {
            throw new Error("Thinktank output missing before reflective stage");
          }
          outputs.reflectiveOutput = await this.runStep<ReflectiveInput, ReflectiveOutput>(
            context,
            "reflective",
            { thinktankOutput: outputs.thinktankOutput }
          );
          break;
        default:
          this.assertNever(agentId);
      }
    }

    if (!outputs.reflectiveOutput) {
      throw new Error("Workflow completed without reflective output");
    }

    return {
      runId: payload.runId,
      workflowId: payload.workflowId,
      status: "completed",
      steps: context.history,
      finalOutput: outputs.reflectiveOutput
    };
  }

  private async runStep<I, O extends { stage: WorkflowRunStep["stage"] }>(
    context: WorkflowContext,
    agentId: AgentId,
    input: I
  ): Promise<O> {
    const startedAt = new Date().toISOString();
    const agent = this.agentRegistry.get<I, O>(agentId);
    const output = await agent.execute(input, context);
    const completedAt = new Date().toISOString();

    context.history.push({
      agentId,
      stage: output.stage,
      output,
      startedAt,
      completedAt
    });

    return output;
  }

  private assertNever(value: never): never {
    throw new Error(`Unsupported agent in sequence: ${String(value)}`);
  }
}
