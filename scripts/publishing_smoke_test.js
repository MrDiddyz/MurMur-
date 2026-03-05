const WEIGHTS = {
  brand: 0.35,
  performance: 0.3,
  ethics: 0.2,
  strategy: 0.15
}

function calculateFinalScore(votes) {
  let total = 0
  votes.forEach((v) => {
    total += v.score * (WEIGHTS[v.agent] || 0)
  })
  return total
}

function shouldPublish(finalScore, brandRisk) {
  if (brandRisk === "high") return false
  return finalScore >= 87
}

const strongVotes = [
  { agent: "brand", score: 92 },
  { agent: "performance", score: 90 },
  { agent: "ethics", score: 95 },
  { agent: "strategy", score: 88 }
]

const finalScore = calculateFinalScore(strongVotes)
if (!shouldPublish(finalScore, "low")) {
  console.error("Expected publish=true for low risk and high weighted score", { finalScore })
  process.exit(1)
}

if (shouldPublish(99, "high")) {
  console.error("Expected publish=false for high brand risk regardless of score")
  process.exit(1)
}

if (shouldPublish(86.99, "medium")) {
  console.error("Expected publish=false below threshold", { score: 86.99 })
  process.exit(1)
}

console.log("Publishing smoke test passed", { finalScore: Number(finalScore.toFixed(2)) })
