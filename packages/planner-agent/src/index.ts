import type { WorkflowState } from "@murmur/shared";

export async function runPlanner(state: WorkflowState): Promise<WorkflowState> {
  const plan = [
    `Analyze prompt: ${state.prompt}`,
    "Draft implementation",
    "Review against requirements"
  ];
  return { ...state, plan, events: [...state.events, { type: "planner", message: "Plan created" }] };
}
