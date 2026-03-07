import type { AgentResult, AgentTask, BaseAgent } from "@murmur/agents-core";
import type { AgentContext, MemoryType } from "@murmur/shared";
import type { ThinktankStageOutput } from "@murmur/agents-thinktank";

export interface ReflectiveStageOutput {
  stage: "reflection";
  finalDraft: {
    direction: object | null;
    rationale: string;
    improvements: string[];
  };
  shouldPersistMemory: boolean;
  memoryCandidates: Array<{
    type: MemoryType;
    key: string;
    value: unknown;
    relevance: number;
  }>;
}

export class ReflectiveAgent implements BaseAgent<ReflectiveStageOutput> {
  readonly name = "ReflectiveAgent";
  readonly role = "reflective" as const;
  readonly promptVersion = "reflective.v2.0.0";
  readonly promptDescription = "Finalizes response and extracts reusable memory lessons.";

  async run(task: AgentTask, context: AgentContext): Promise<AgentResult<ReflectiveStageOutput>> {
    const synthesis = context.priorSteps.find((step) => step.agentRole === "thinktank")
      ?.output as ThinktankStageOutput | undefined;

    const output: ReflectiveStageOutput = {
      stage: "reflection",
      finalDraft: {
        direction: synthesis?.selectedVariant ?? null,
        rationale: synthesis
          ? `${synthesis.consensus} This aligns to objective: ${task.objective}.`
          : `Produced fallback response for objective: ${task.objective}.`,
        improvements: [
          "Add measurable checkpoints after each stage",
          "Track why selected variant beat alternatives",
          "Reinforce memory tags to improve retrieval"
        ]
      },
      shouldPersistMemory: true,
      memoryCandidates: [
        {
          type: "reflection",
          key: `objective:${task.objective.slice(0, 48)}`,
          value: { selectedVariantId: synthesis?.selectedVariant.id ?? null },
          relevance: 0.84
        },
        {
          type: "workflow-note",
          key: "balanced-routing-checkpoint",
          value: "Prefer balanced variant when confidence across personas is >= 0.75",
          relevance: 0.75
        }
      ]
    };

    return { stage: "reflection", output, summary: "Generated final draft and memory candidates." };
  }
}
