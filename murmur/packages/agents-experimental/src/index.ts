import type {
  Agent,
  ExperimentalOutput,
  TeacherOutput,
  Variant,
  WorkflowContext
} from "@murmur/agents-core";

export interface ExperimentalInput {
  teacherOutput: TeacherOutput;
}

export class ExperimentalAgent implements Agent<ExperimentalInput, ExperimentalOutput> {
  readonly id = "experimental";

  async execute(input: ExperimentalInput, _context: WorkflowContext): Promise<ExperimentalOutput> {
    const variants: Variant[] = [
      {
        id: "v1",
        title: "Conservative execution",
        angle: "Lean on proven patterns to minimize delivery risk"
      },
      {
        id: "v2",
        title: "Balanced innovation",
        angle: "Combine reliable architecture with selective experimentation"
      },
      {
        id: "v3",
        title: "Aggressive experimentation",
        angle: "Optimize for novelty and upside with higher uncertainty"
      }
    ];

    return {
      stage: "exploration",
      variants,
      recommendation: `Recommend ${variants[1].id} because it aligns with the objective \"${input.teacherOutput.objective}\" while balancing speed and quality.`
    };
  }
}
