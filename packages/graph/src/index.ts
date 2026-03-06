import { runPlanner } from "@murmur/planner-agent";
import { runBuilder } from "@murmur/builder-agent";
import { runReviewer } from "@murmur/reviewer-agent";
import { runOptimizer } from "@murmur/optimizer-agent";
import type { WorkflowState } from "@murmur/shared";

export type { WorkflowState } from "@murmur/shared";

export async function runWorkflowGraph(input: {
  workflowId: string;
  prompt: string;
  maxIterations: number;
}) {
  let state: WorkflowState = {
    workflowId: input.workflowId,
    prompt: input.prompt,
    maxIterations: input.maxIterations,
    iteration: 0,
    plan: [],
    buildOutput: "",
    approved: false,
    feedback: "",
    optimizedOutput: "",
    events: []
  };

  state = await runPlanner(state);
  while (state.iteration < state.maxIterations) {
    state = await runBuilder(state);
    state = await runReviewer(state);
    if (state.approved) break;
    state = { ...state, iteration: state.iteration + 1, events: [...state.events, { type: "router", message: "Reviewer rejected, looping back to builder" }] };
  }

  if (state.approved) {
    state = await runOptimizer(state);
  } else {
    state = { ...state, events: [...state.events, { type: "router", message: "Max iterations reached" }] };
  }

  return {
    status: state.approved ? "succeeded" : "failed",
    checkpoints: [
      { step: "planner", summary: state.plan.join(" | ") },
      { step: "builder", summary: state.buildOutput },
      { step: "reviewer", summary: `${state.approved ? "approved" : "rejected"}: ${state.feedback}` },
      { step: "optimizer", summary: state.optimizedOutput || "skipped" }
    ],
    events: state.events,
    result: state.approved ? { output: state.optimizedOutput } : null
  } as const;
}
