import {
  BaseAgent,
  AgentTask,
  AgentContext,
  AgentResult,
  createTextSummary,
} from "@murmur/agents-core";

export class ThinktankAgent implements BaseAgent {
  readonly name = "ThinktankAgent";
  readonly role = "thinktank" as const;

  async run(task: AgentTask, context: AgentContext): Promise<AgentResult> {
    const experimentalOutput = task.input.experimentalOutput as
      | {
          variants?: Array<{
            id: string;
            title: string;
            angle: string;
          }>;
          recommendation?: string;
        }
      | undefined;

    const variants = experimentalOutput?.variants ?? [];
    const selected =
      variants.find((variant) => variant.id === experimentalOutput?.recommendation) ??
      variants[0] ?? {
        id: "fallback",
        title: "Fallback",
        angle: task.goal,
      };

    const panel = [
      { persona: "Strategist", opinion: "High clarity and good trajectory." },
      { persona: "Critic", opinion: "Needs tighter constraints before execution." },
      { persona: "Builder", opinion: "Feasible with current runtime." },
    ];

    return {
      summary: createTextSummary(this.name, task.goal, {
        selected: selected.id,
        panelists: panel.length,
        runId: context.runId,
      }),
      output: {
        stage: "synthesis",
        selectedVariant: selected,
        panel,
        consensus: `Proceed with ${selected.id} after minor refinement.`,
      },
      nextStep: "reflective",
      score: 0.87,
    };
  }
}
