import {
  BaseAgent,
  AgentTask,
  AgentContext,
  AgentResult,
  createTextSummary,
} from "@murmur/agents-core";

export class TeacherAgent implements BaseAgent {
  readonly name = "TeacherAgent";
  readonly role = "teacher" as const;

  async run(task: AgentTask, context: AgentContext): Promise<AgentResult> {
    const input = task.input ?? {};
    const objective =
      typeof input.objective === "string" ? input.objective : task.goal;

    const plan = [
      "Clarify intent",
      "Generate candidate directions",
      "Debate strongest options",
      "Reflect and refine output",
    ];

    return {
      summary: createTextSummary(this.name, task.goal, {
        objective,
        runId: context.runId,
      }),
      output: {
        stage: "planning",
        objective,
        constraints: input.constraints ?? [],
        plan,
        successCriteria: [
          "useful",
          "coherent",
          "actionable",
          "aligned with MurMur identity",
        ],
      },
      nextStep: "experimental",
      score: 0.82,
    };
  }
}
