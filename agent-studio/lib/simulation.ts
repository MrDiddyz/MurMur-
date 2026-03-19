export type SimInput = {
  title: string;
  complexity: number;
  risk: number;
};

export type AgentSettings = {
  temperature: number;
  reward_weight: number;
  risk_weight: number;
};

export function runSimulation(scenario: SimInput, settings: AgentSettings) {
  const score =
    scenario.complexity * settings.reward_weight -
    scenario.risk * settings.risk_weight +
    settings.temperature * 5;

  const proposals = [0, 1, 2].map((i) => {
    const impact = Number((score + (i + 1) * 1.25).toFixed(2));
    return {
      title: `${scenario.title} Proposal ${i + 1}`,
      rationale: `Based on score ${score.toFixed(2)} with deterministic offset ${(i + 1) * 1.25}.`,
      impact,
    };
  });

  return { score: Number(score.toFixed(2)), proposals };
}
