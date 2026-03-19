import type {
  Agent,
  ExperimentalOutput,
  ThinktankOutput,
  WorkflowContext
} from "@murmur/agents-core";

export interface ThinktankInput {
  experimentalOutput: ExperimentalOutput;
}

export class ThinktankAgent implements Agent<ThinktankInput, ThinktankOutput> {
  readonly id = "thinktank";

  async execute(input: ThinktankInput, _context: WorkflowContext): Promise<ThinktankOutput> {
    const selectedVariant =
      input.experimentalOutput.variants.find((variant) => variant.id === "v2") ??
      input.experimentalOutput.variants[0];

    return {
      stage: "synthesis",
      selectedVariant,
      panel: [
        {
          persona: "Systems Architect",
          opinion: "Balanced innovation offers durable implementation boundaries."
        },
        {
          persona: "Product Strategist",
          opinion: "It creates value quickly without compromising long-term flexibility."
        },
        {
          persona: "Delivery Lead",
          opinion: "Risk is manageable and timelines remain predictable."
        }
      ],
      consensus:
        "Proceed with the balanced variant and add measurable checkpoints for learning and adaptation."
    };
  }
}
