import type {
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

export class WorkflowRunner {
  constructor(private readonly agentRegistry: AgentRegistry) {}

  async run(payload: WorkflowRunPayload): Promise<WorkflowRunResult> {
    const context: WorkflowContext = {
      workflowId: payload.workflowId,
      runId: payload.runId,
      goal: payload.goal,
      input: payload.input,
      history: []
    };

    const teacherOutput = await this.runStep<TeacherInput, TeacherOutput>(
      context,
      "teacher",
      { goal: payload.goal, input: payload.input }
    );

    const experimentalOutput = await this.runStep<ExperimentalInput, ExperimentalOutput>(
      context,
      "experimental",
      { teacherOutput }
    );

    const thinktankOutput = await this.runStep<ThinktankInput, ThinktankOutput>(
      context,
      "thinktank",
      { experimentalOutput }
    );

    const reflectiveOutput = await this.runStep<ReflectiveInput, ReflectiveOutput>(
      context,
      "reflective",
      { thinktankOutput }
    );

    return {
      runId: payload.runId,
      workflowId: payload.workflowId,
      status: "completed",
      steps: context.history,
      finalOutput: reflectiveOutput
    };
  }

  private async runStep<I, O>(
    context: WorkflowContext,
    agentId: string,
    input: I
  ): Promise<O> {
    const startedAt = new Date().toISOString();
    const agent = this.agentRegistry.get<I, O>(agentId);
    const output = await agent.execute(input, context);
    const completedAt = new Date().toISOString();

    const step: WorkflowRunStep = {
      agentId,
      stage: (output as { stage?: string }).stage ?? "unknown",
      output,
      startedAt,
      completedAt
    };

    context.history.push(step);
    return output;
  }
}
