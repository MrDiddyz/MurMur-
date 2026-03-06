export interface ReviewerState {
  buildOutput?: string;
  review?: {
    approved: boolean;
    feedback: string;
  };
}

export async function runReviewer<T extends ReviewerState>(state: T): Promise<T> {
  const approved = Boolean(state.buildOutput && state.buildOutput.length > 20);
  return {
    ...state,
    review: {
      approved,
      feedback: approved
        ? "Output approved for optimization."
        : "Output too short, please expand implementation."
    }
  };
}
