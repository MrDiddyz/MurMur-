import type { EvolutionStore } from "./store";
import type { Observation } from "./types";

export interface EvolutionIssue {
  readonly code: "LATENCY" | "SUCCESS_RATE" | "ERROR_RATE";
  readonly severity: number;
  readonly observation: Observation;
}

export type Trigger =
  | { kind: "degradation"; metricKey: string; currentAvg: number; baselineAvg: number }
  | { kind: "stagnation"; metricKey: string; windowAvg: number };

function avg(xs: number[]) {
  if (xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

/**
 * Stream trigger:
 * - if recent N measurements are worse than the baseline window before them.
 */
export async function detectTriggers(
  store: EvolutionStore,
  args: {
    userId?: string;
    metricKey: string;
    recentN?: number;
    baselineN?: number;
    degradationPct?: number;
  }
): Promise<Trigger[]> {
  const recentN = args.recentN ?? 20;
  const baselineN = args.baselineN ?? 40;
  const degradationPct = args.degradationPct ?? 0.1;

  const obs = await store.readRecentObservations({
    userId: args.userId,
    metricKey: args.metricKey,
    limit: recentN + baselineN
  });

  const values = obs.map((o) => o.metricValue);
  const recent = values.slice(0, recentN);
  const baseline = values.slice(recentN, recentN + baselineN);

  const recentAvg = avg(recent);
  const baselineAvg = avg(baseline);

  const triggers: Trigger[] = [];

  if (baseline.length >= 10 && recent.length >= 10) {
    const drop = baselineAvg > 0 ? (baselineAvg - recentAvg) / baselineAvg : 0;
    if (drop >= degradationPct) {
      triggers.push({
        kind: "degradation",
        metricKey: args.metricKey,
        currentAvg: recentAvg,
        baselineAvg
      });
    }
  }

  return triggers;
}

export class EvolutionDetector {
  detect(observations: Observation[]): EvolutionIssue[] {
    return observations.flatMap<EvolutionIssue>((observation) => {
      if (observation.metricKey === "latency_ms" && observation.metricValue > 180) {
        return [{ code: "LATENCY", severity: Math.min(1, observation.metricValue / 300), observation }];
      }

      if (observation.metricKey === "task_success_rate" && observation.metricValue < 0.75) {
        return [{ code: "SUCCESS_RATE", severity: Math.min(1, 1 - observation.metricValue), observation }];
      }

      if (observation.metricKey === "error_rate" && observation.metricValue > 0.12) {
        return [{ code: "ERROR_RATE", severity: Math.min(1, observation.metricValue), observation }];
      }

      return [];
    });
  }
}
