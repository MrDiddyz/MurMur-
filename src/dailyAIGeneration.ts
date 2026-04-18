import { Narrative, Report } from "./murmurMediaEngine/types";

export function generateDailyReport(
  narratives: Narrative[],
  correlationId: string,
): Omit<Report, "id" | "timestamp"> {
  const top = [...narratives].sort((a, b) => b.confidence - a.confidence).slice(0, 3);

  const summary =
    top.length === 0
      ? "No strong narratives detected in this run."
      : `Detected ${narratives.length} active narratives. Top themes: ${top.map((n) => n.theme).join(", ")}.`;

  const shortInsights = top.map(
    (narrative) => `${narrative.theme}: confidence ${(narrative.confidence * 100).toFixed(1)}%`,
  );

  const whatMattersNow =
    top[0] !== undefined
      ? `Monitor "${top[0].theme}" now. It has the highest confidence and signal density.`
      : "Increase source volume to improve detection quality.";

  return {
    correlationId,
    narrativeIds: narratives.map((n) => n.id),
    summary,
    shortInsights,
    whatMattersNow,
  };
}
