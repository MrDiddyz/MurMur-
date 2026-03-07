import type { AgentResult, AgentTask, BaseAgent } from "@murmur/agents-core";
import type { AgentContext } from "@murmur/shared";

export interface ExperimentalVariant {
  id: string;
  title: string;
  angle: string;
  risks?: string[];
  strengths?: string[];
}

export interface ExperimentalStageOutput {
  stage: "exploration";
  objective: string;
  variants: ExperimentalVariant[];
  recommendation: string;
}

export class ExperimentalAgent implements BaseAgent<ExperimentalStageOutput> {
  readonly name = "ExperimentalAgent";
  readonly role = "experimental" as const;
  readonly promptVersion = "experimental.v2.0.0";
  readonly promptDescription = "Generates and compares alternative approaches.";

  async run(task: AgentTask, _context: AgentContext): Promise<AgentResult<ExperimentalStageOutput>> {
    const variants: ExperimentalVariant[] = [
      {
        id: "v-conservative",
        title: "Conservative reliability",
        angle: "Minimize risk with proven architecture",
        risks: ["Lower novelty"],
        strengths: ["High predictability"]
      },
      {
        id: "v-balanced",
        title: "Balanced evolution",
        angle: "Mix stable core with guided experimentation",
        risks: ["Moderate complexity"],
        strengths: ["Strong adaptability", "Controlled risk"]
      },
      {
        id: "v-frontier",
        title: "Frontier exploration",
        angle: "Maximize upside through aggressive mutation",
        risks: ["Higher instability"],
        strengths: ["Potentially high originality"]
      }
    ];

    const output: ExperimentalStageOutput = {
      stage: "exploration",
      objective: task.objective,
      variants,
      recommendation: "v-balanced"
    };

    return { stage: "exploration", output, summary: `Generated ${variants.length} variants.` };
  }
}
