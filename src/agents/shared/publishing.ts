export interface Vote {
  agent: string
  score: number
}

const WEIGHTS: Record<string, number> = {
  brand: 0.35,
  performance: 0.3,
  ethics: 0.2,
  strategy: 0.15
}

export function calculateFinalScore(votes: Vote[]): number {
  let total = 0

  votes.forEach((v) => {
    total += v.score * (WEIGHTS[v.agent] || 0)
  })

  return total
}

export function shouldPublish(
  finalScore: number,
  brandRisk: "low" | "medium" | "high"
): boolean {
  if (brandRisk === "high") return false
  return finalScore >= 87
}
