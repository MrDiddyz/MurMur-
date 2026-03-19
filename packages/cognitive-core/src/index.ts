// Cognitive core that fuses agent outputs with mode-aware weighting policy.
import type { AgentResult, StudioMode } from "@murmur/shared";

const modePolicy: Record<StudioMode, { style: number; rhythm: number; physics: number }> = {
  ID: { style: 0.5, rhythm: 0.25, physics: 0.25 },
  MIRROR: { style: 0.25, rhythm: 0.25, physics: 0.5 },
  FREE: { style: 0.33, rhythm: 0.34, physics: 0.33 },
  PERFORMANCE_SYNC: { style: 0.2, rhythm: 0.6, physics: 0.2 }
};

export interface FusedOutput {
  directives: Record<string, number>;
  confidence: number;
}

export function fuseAgentOutputs(mode: StudioMode, outputs: AgentResult[]): FusedOutput {
  const weights = modePolicy[mode];
  const directives: Record<string, number> = {};

  for (const output of outputs) {
    const key = output.agentId.includes("style")
      ? "style"
      : output.agentId.includes("rhythm")
        ? "rhythm"
        : "physics";
    const agentWeight = weights[key as keyof typeof weights] * output.confidence;

    for (const [directive, value] of Object.entries(output.directives)) {
      directives[directive] = (directives[directive] ?? 0) + value * agentWeight;
    }
  }

  return {
    directives,
    confidence: outputs.length ? outputs.reduce((acc, item) => acc + item.confidence, 0) / outputs.length : 0
  };
}

export * from "./memory-core.js";
