export interface OptimizerState {
  buildOutput?: string;
  optimizedOutput?: string;
}

export async function runOptimizer<T extends OptimizerState>(state: T): Promise<T> {
  return {
    ...state,
    optimizedOutput: `${state.buildOutput ?? ""} (optimized)`
  };
}
