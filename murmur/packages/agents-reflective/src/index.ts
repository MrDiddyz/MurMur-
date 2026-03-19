import type {
  Agent,
  ReflectiveOutput,
  ThinktankOutput,
  WorkflowContext
} from "@murmur/agents-core";

export interface ReflectiveInput {
  thinktankOutput: ThinktankOutput;
}

export class ReflectiveAgent implements Agent<ReflectiveInput, ReflectiveOutput> {
  readonly id = "reflective";

  async execute(input: ReflectiveInput, _context: WorkflowContext): Promise<ReflectiveOutput> {
    return {
      stage: "reflection",
      finalDraft: {
        direction: input.thinktankOutput.selectedVariant,
        rationale: `${input.thinktankOutput.consensus} The selected direction best balances feasibility, value, and iterative learning.`,
        improvements: [
          "Define explicit success metrics for each delivery milestone",
          "Run a short pilot before full rollout",
          "Capture retrospectives to improve future workflow runs"
        ]
      },
      shouldPersistMemory: true
    };
  }
}
