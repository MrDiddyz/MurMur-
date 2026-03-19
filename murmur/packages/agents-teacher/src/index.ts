import type { Agent, TeacherOutput, WorkflowContext } from "@murmur/agents-core";

export interface TeacherInput {
  goal: string;
  input: Record<string, unknown>;
}

export class TeacherAgent implements Agent<TeacherInput, TeacherOutput> {
  readonly id = "teacher";

  async execute(input: TeacherInput, _context: WorkflowContext): Promise<TeacherOutput> {
    return {
      stage: "planning",
      objective: input.goal,
      constraints: [
        "Keep the answer grounded in provided input",
        "Prioritize clear, actionable decisions",
        "Surface unknowns and assumptions"
      ],
      plan: [
        "Clarify objective and expected output",
        "Generate multiple candidate strategies",
        "Critique tradeoffs with expert personas",
        "Deliver a polished final recommendation"
      ],
      successCriteria: [
        "Final direction maps directly to the user goal",
        "Reasoning path is traceable across stages",
        "Final draft includes concrete improvements"
      ]
    };
  }
}
