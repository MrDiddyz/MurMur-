export type PreviousRun = {
  idea: string;
  engagement?: number;
};

export function optimize(previousRuns: PreviousRun[]) {
  return {
    run_count: previousRuns.length,
    improved_prompt_weight: 0.1,
  };
}
