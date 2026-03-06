import type { WorkflowState } from "@murmur/shared";

export async function runOptimizer(state: WorkflowState): Promise<WorkflowState> {
  const optimizedOutput = `${state.buildOutput}\n\n[Optimized for clarity and brevity]`;
  return { ...state, optimizedOutput, events: [...state.events, { type: "optimizer", message: "Output optimized" }] };
}
