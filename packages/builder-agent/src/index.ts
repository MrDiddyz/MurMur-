import type { WorkflowState } from "@murmur/shared";

export async function runBuilder(state: WorkflowState): Promise<WorkflowState> {
  const buildOutput = `Build v${state.iteration + 1}: ${state.prompt} using plan step ${Math.min(state.iteration + 1, state.plan.length)}`;
  return { ...state, buildOutput, events: [...state.events, { type: "builder", message: "Build output generated" }] };
}
