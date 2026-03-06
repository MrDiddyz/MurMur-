export interface BuilderState {
  plan?: string[];
  buildOutput?: string;
}

export async function runBuilder<T extends BuilderState>(state: T): Promise<T> {
  return {
    ...state,
    buildOutput: `Built draft from plan with ${(state.plan ?? []).length} steps.`
  };
}
