export function simulateAudience(script: string) {
  const normalized = Math.min(1, Math.max(0, script.length / 500));

  return {
    engagement_score: Number(normalized.toFixed(2)),
    retention_curve: [1, 0.9, 0.7, 0.5],
  };
}
