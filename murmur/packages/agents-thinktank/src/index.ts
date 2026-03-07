import type { AgentResult, AgentTask, BaseAgent } from "@murmur/agents-core";
import type { AgentContext } from "@murmur/shared";
import type { ExperimentalStageOutput } from "@murmur/agents-experimental";

export interface ThinktankStageOutput {
  stage: "synthesis";
  selectedVariant: {
    id: string;
    title: string;
    angle: string;
  };
  panel: Array<{
    persona: string;
    opinion: string;
    confidence?: number;
  }>;
  consensus: string;
  openQuestions: string[];
}

export class ThinktankAgent implements BaseAgent<ThinktankStageOutput> {
  readonly name = "ThinktankAgent";
  readonly role = "thinktank" as const;
  readonly promptVersion = "thinktank.v2.0.0";
  readonly promptDescription = "Synthesizes expert panel opinions to select strongest approach.";

  async run(task: AgentTask, context: AgentContext): Promise<AgentResult<ThinktankStageOutput>> {
    const exploration = context.priorSteps.find((step) => step.agentRole === "experimental")
      ?.output as ExperimentalStageOutput | undefined;
    const recommendedId = exploration?.recommendation;
    const selected = exploration?.variants.find((variant) => variant.id === recommendedId) ?? exploration?.variants[0];

    const output: ThinktankStageOutput = {
      stage: "synthesis",
      selectedVariant: selected
        ? { id: selected.id, title: selected.title, angle: selected.angle }
        : { id: "fallback", title: "Fallback", angle: `No variants available for ${task.objective}` },
      panel: [
        { persona: "Systems Architect", opinion: "Balanced option is maintainable.", confidence: 0.82 },
        { persona: "Product Strategist", opinion: "Balanced option improves adoption.", confidence: 0.79 },
        { persona: "Operations Lead", opinion: "Operational risk remains acceptable.", confidence: 0.76 }
      ],
      consensus: "Use the balanced path with explicit checkpoints and rollback criteria.",
      openQuestions: ["Which metrics will define early success?", "What is the rollback threshold?"]
    };

    return { stage: "synthesis", output, summary: `Selected variant ${output.selectedVariant.id}.` };
  }
}
