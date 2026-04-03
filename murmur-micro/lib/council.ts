import type { AgentResult } from "@/lib/agents";
import type { AgentStat } from "@/lib/memory";

export type ScoreBreakdown = {
  length: number;
  keywords: number;
  weightBonus: number;
  total: number;
};

const KEYWORDS = ["strategy", "experiment", "measure", "next step", "risk", "impact"];

export function scoreAgents(results: AgentResult[], stats: AgentStat[]) {
  const weightMap = new Map(stats.map((s) => [s.agent, s.weight]));

  const scores = results.map((result) => {
    const length = Math.min(result.output.length / 120, 10);
    const output = result.output.toLowerCase();
    const keywords = KEYWORDS.filter((k) => output.includes(k)).length;
    const weightBonus = weightMap.get(result.agent) ?? 1;
    const total = Number((length + keywords * 1.5 + weightBonus).toFixed(2));

    return {
      agent: result.agent,
      breakdown: { length, keywords, weightBonus, total }
    };
  });

  const winner = scores.reduce((best, current) =>
    current.breakdown.total > best.breakdown.total ? current : best
  ).agent;

  return { scores, winner };
}
