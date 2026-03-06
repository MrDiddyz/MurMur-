import { runPlanner } from "@murmur/planner-agent";
import { runBuilder } from "@murmur/builder-agent";
import { runReviewer } from "@murmur/reviewer-agent";
import { runOptimizer } from "@murmur/optimizer-agent";

export interface WorkflowState {
  workflowId: string;
  prompt: string;
  plan?: string[];
  buildOutput?: string;
  review?: {
    approved: boolean;
    feedback: string;
  };
  optimizedOutput?: string;
}

export type CheckpointHandler = (node: string, state: WorkflowState) => Promise<void>;

export async function runWorkflowGraph(
  initialState: WorkflowState,
  saveCheckpoint?: CheckpointHandler
): Promise<WorkflowState> {
  let state = await runPlanner(initialState);
  await saveCheckpoint?.("planner", state);

  let attempts = 0;
  while (attempts < 3) {
    state = await runBuilder(state);
    await saveCheckpoint?.("builder", state);

    state = await runReviewer(state);
    await saveCheckpoint?.("reviewer", state);

    if (state.review?.approved) {
      break;
    }
    attempts += 1;
    state = {
      ...state,
      buildOutput: `${state.buildOutput ?? ""} ${state.review?.feedback ?? ""}`.trim()
    };
  }

  state = await runOptimizer(state);
  await saveCheckpoint?.("optimizer", state);

  return state;
}
