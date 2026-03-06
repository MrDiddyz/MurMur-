export interface PlannerState {
  prompt: string;
  plan?: string[];
}

export async function runPlanner<T extends PlannerState>(state: T): Promise<T> {
  return {
    ...state,
    plan: [
      `Analyze prompt: ${state.prompt}`,
      "Draft implementation approach",
      "Prepare validation checklist"
    ]
  };
}
