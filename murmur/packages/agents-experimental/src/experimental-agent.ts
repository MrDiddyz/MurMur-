import {
  BaseAgent,
  AgentTask,
  AgentContext,
  AgentResult,
  createTextSummary,
} from "@murmur/agents-core";

export class ExperimentalAgent implements BaseAgent {
  readonly name = "ExperimentalAgent";
  readonly role = "experimental" as const;

  async run(task: AgentTask, context: AgentContext): Promise<AgentResult> {
    const teacherOutput = task.input.teacherOutput as
      | Record<string, unknown>
      | undefined;

    const objective =
      typeof teacherOutput?.objective === "string"
        ? teacherOutput.objective
        : task.goal;

    const variants = [
      {
        id: "variant-a",
        title: "Safe / Structured",
        angle: `A stable interpretation of: ${objective}`,
      },
      {
        id: "variant-b",
        title: "Bold / Expressive",
        angle: `A more adventurous interpretation of: ${objective}`,
      },
      {
        id: "variant-c",
        title: "Minimal / Focused",
        angle: `A stripped-down high-signal interpretation of: ${objective}`,
      },
    ];

    return {
      summary: createTextSummary(this.name, task.goal, {
        variants: variants.length,
        runId: context.runId,
      }),
      output: {
        stage: "exploration",
        objective,
        variants,
        recommendation: "variant-b",
      },
      nextStep: "thinktank",
      score: 0.84,
    };
  }
}
