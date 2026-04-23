export type AgentMetrics = {
  runtimeMs: number;
  inputTokens: number;
  outputTokens: number;
  retries: number;
  executions: number;
  errors: number;
};

export type AgentNodeData = {
  label: string;
  status: string;
  summary?: string;
  metrics: AgentMetrics;
};

export type LLMUsage = {
  model: string;
  promptTokens: number;
  completionTokens: number;
  cachedTokens?: number;
  requests: number;
};

export type ModelPricing = {
  inputPer1k: number;
  outputPer1k: number;
  cachedInputPer1k?: number;
};

export const MODEL_PRICING: Record<string, ModelPricing> = {
  "gpt-4.1": {
    inputPer1k: 0.01,
    outputPer1k: 0.03,
    cachedInputPer1k: 0.0025,
  },
  "gpt-4.1-mini": {
    inputPer1k: 0.001,
    outputPer1k: 0.003,
    cachedInputPer1k: 0.00025,
  },
};

export function getHeatScore(metrics: AgentMetrics): number {
  const runtimeWeight = Math.min(metrics.runtimeMs / 10000, 1);
  const tokenWeight = Math.min(
    (metrics.inputTokens + metrics.outputTokens) / 20000,
    1,
  );
  const retryWeight = Math.min(metrics.retries / 5, 1);
  const errorWeight = Math.min(metrics.errors / 3, 1);

  return (
    runtimeWeight * 0.4 +
    tokenWeight * 0.3 +
    retryWeight * 0.15 +
    errorWeight * 0.15
  );
}

export function getHeatColor(score: number): string {
  if (score >= 0.85) return "bg-red-500 border-red-600 text-white";
  if (score >= 0.65) return "bg-orange-500 border-orange-600 text-white";
  if (score >= 0.45) return "bg-yellow-400 border-yellow-500 text-black";
  if (score >= 0.2) return "bg-lime-300 border-lime-400 text-black";
  return "bg-emerald-200 border-emerald-300 text-black";
}

export function getEdgeHeatColor(calls: number): string {
  if (calls > 50) return "#ef4444";
  if (calls > 20) return "#f97316";
  if (calls > 10) return "#eab308";
  return "#22c55e";
}

export type RawEdge = {
  calls: number;
  [key: string]: unknown;
};

export function mapEdgesWithHeat<T extends RawEdge>(rawEdges: T[]) {
  return rawEdges.map((edge) => ({
    ...edge,
    animated: edge.calls > 0,
    style: {
      stroke: getEdgeHeatColor(edge.calls),
      strokeWidth: Math.min(2 + edge.calls / 10, 8),
    },
  }));
}
