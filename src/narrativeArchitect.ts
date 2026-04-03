import { Narrative, Signal } from "./murmurMediaEngine/types";
import { clamp } from "./murmurMediaEngine/utils";

type SignalCluster = { theme: string; signals: Signal[] };

export type ThemeFeedbackStats = {
  avgScore: number;
  total: number;
};

function clusterSignals(signals: Signal[]): SignalCluster[] {
  const map = new Map<string, Signal[]>();

  for (const signal of signals) {
    const theme = signal.trendKeywords[0] ?? "general";
    const bucket = map.get(theme) ?? [];
    bucket.push(signal);
    map.set(theme, bucket);
  }

  return Array.from(map.entries())
    .map(([theme, cluster]) => ({ theme, signals: cluster }))
    .sort((a, b) => b.signals.length - a.signals.length || a.theme.localeCompare(b.theme));
}

export function buildNarratives(
  signals: Signal[],
  feedbackStatsByTheme: Record<string, ThemeFeedbackStats> = {},
): Omit<Narrative, "id" | "timestamp">[] {
  return clusterSignals(signals).map(({ theme, signals: cluster }, index) => {
    const avgWeight = cluster.reduce((sum, signal) => sum + signal.weight, 0) / Math.max(cluster.length, 1);
    const negativeRate =
      cluster.filter((signal) => signal.emotionalTone === "negative").length / Math.max(cluster.length, 1);

    const historical = feedbackStatsByTheme[theme];
    const historicalLift = historical ? (historical.avgScore - 0.5) * 0.25 : 0;
    const stabilityBoost = historical ? Math.min(historical.total, 20) * 0.005 : 0;

    const confidence = clamp(0.35 + avgWeight * 0.05 - negativeRate * 0.15 + historicalLift + stabilityBoost, 0.1, 0.99);

    return {
      correlationId: cluster[0]?.correlationId ?? "unknown",
      title: `Theme ${index + 1}: ${theme}`,
      theme,
      signalIds: cluster.map((signal) => signal.id),
      confidence,
      score: historical?.avgScore ?? 0.5,
      feedback: "",
    };
  });
}
