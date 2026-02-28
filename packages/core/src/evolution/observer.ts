import type { Observation } from "./types";

const clamp = (value: number): number => Math.max(0, Math.min(1, value));

const makeObservation = (
  metricKey: string,
  metricValue: number,
  source: string,
  meta: Record<string, unknown>
): Observation => ({
  source,
  metricKey,
  metricValue,
  meta,
  createdAt: new Date().toISOString()
});

export class EvolutionObserver {
  observe(seed?: number): Observation[] {
    const n = seed ?? Date.now();
    const phase = n / 1000;

    return [
      makeObservation("latency_ms", Number((80 + clamp(0.5 + Math.sin(phase) * 0.3) * 200).toFixed(2)), "system", {
        unit: "ms"
      }),
      makeObservation(
        "task_success_rate",
        Number(clamp(0.55 + Math.cos(phase / 2) * 0.25).toFixed(4)),
        "agent:pilot",
        { unit: "ratio" }
      ),
      makeObservation("error_rate", Number(clamp(0.1 + Math.sin(phase / 3) * 0.12).toFixed(4)), "ui", {
        unit: "ratio"
      })
    ];
  }
}
