import {
  BaseAgent,
  AgentTask,
  AgentContext,
  AgentResult,
  createTextSummary,
} from "@murmur/agents-core";

export class ReflectiveAgent implements BaseAgent {
  readonly name = "ReflectiveAgent";
  readonly role = "reflective" as const;

  async run(task: AgentTask, context: AgentContext): Promise<AgentResult> {
    const thinktankOutput = task.input.thinktankOutput as
      | {
          selectedVariant?: { id: string; title: string; angle: string };
          consensus?: string;
        }
      | undefined;

    const finalDraft = {
      direction: thinktankOutput?.selectedVariant ?? null,
      rationale: thinktankOutput?.consensus ?? "No consensus available.",
      improvements: [
        "Tighten user-facing framing",
        "Preserve strongest signal",
        "Write reflection memory for future runs",
      ],
    };

    return {
      summary: createTextSummary(this.name, task.goal, {
        finalized: Boolean(finalDraft.direction),
        runId: context.runId,
      }),
      output: {
        stage: "reflection",
        finalDraft,
        shouldPersistMemory: true,
      },
      nextStep: "done",
      score: 0.9,
    };
  }
}
