import type { WorkflowState } from "@murmur/shared";

export async function runReviewer(state: WorkflowState): Promise<WorkflowState> {
  const approved = state.iteration >= 1 || state.prompt.length < 20;
  const feedback = approved ? "Looks good" : "Needs one more improvement pass";
  return { ...state, approved, feedback, events: [...state.events, { type: "reviewer", message: feedback }] };
}
