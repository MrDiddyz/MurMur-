import type { AgentResult, AgentTask, BaseAgent } from "@murmur/agents-core";
import type { AgentContext } from "@murmur/shared";

export interface TeacherStageOutput {
  stage: "planning";
  objective: string;
  constraints: string[];
  plan: string[];
  successCriteria: string[];
}

export class TeacherAgent implements BaseAgent<TeacherStageOutput> {
  readonly name = "TeacherAgent";
  readonly role = "teacher" as const;
  readonly promptVersion = "teacher.v2.0.0";
  readonly promptDescription = "Clarifies objective, constraints, execution plan, and success criteria.";

  async run(task: AgentTask, context: AgentContext): Promise<AgentResult<TeacherStageOutput>> {
    const memoryHints = context.memory.slice(0, 2).map((entry) => `Leverage prior lesson: ${entry.key}`);
    const output: TeacherStageOutput = {
      stage: "planning",
      objective: task.objective,
      constraints: [
        "Keep recommendations traceable to provided input",
        "Prefer deterministic checks over ambiguous judgments",
        ...memoryHints
      ],
      plan: [
        "Decompose goal into evaluable objectives",
        "Generate multiple candidate solution strategies",
        "Run comparative synthesis and identify tradeoffs",
        "Produce a final response with improvement hooks"
      ],
      successCriteria: [
        "Final output explicitly addresses objective",
        "Reasoning chain remains coherent across stages",
        "Result provides actionable next steps"
      ]
    };

    return { stage: "planning", output, summary: `Planned objective: ${task.objective}` };
  }
}
