import { Signal } from "./murmurMediaEngine/types";
import { topN, tokenize } from "./murmurMediaEngine/utils";

const POSITIVE = ["growth", "wins", "breakthrough", "gain", "upside", "optimism"];
const NEGATIVE = ["risk", "drop", "loss", "crisis", "fraud", "decline"];
const STOPWORDS = new Set(["with", "from", "that", "this", "have", "into", "while", "were", "their"]);

function zScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

export function scanSignals(
  articles: Array<{ id: string; body: string; correlationId: string }>,
): Omit<Signal, "id" | "timestamp">[] {
  const globalWordCounts: Record<string, number> = {};

  const tokenized = articles.map((article) => {
    const tokens = tokenize(article.body).filter((token) => !STOPWORDS.has(token));
    for (const token of tokens) {
      globalWordCounts[token] = (globalWordCounts[token] ?? 0) + 1;
    }
    return { article, tokens };
  });

  const frequencies = Object.values(globalWordCounts);
  const mean = frequencies.reduce((sum, value) => sum + value, 0) / Math.max(frequencies.length, 1);
  const variance =
    frequencies.reduce((sum, value) => sum + (value - mean) ** 2, 0) / Math.max(frequencies.length, 1);
  const stdDev = Math.sqrt(variance);

  return tokenized.map(({ article, tokens }) => {
    const localCounts: Record<string, number> = {};
    tokens.forEach((token) => {
      localCounts[token] = (localCounts[token] ?? 0) + 1;
    });

    const trendKeywords = topN(localCounts, 6);
    const repetitionPatterns = Object.entries(localCounts)
      .filter(([, count]) => count >= 3)
      .map(([token, count]) => `${token}:${count}`);

    const anomalyFlags = trendKeywords.filter((keyword) => {
      const globalFrequency = globalWordCounts[keyword] ?? 0;
      return zScore(globalFrequency, mean, stdDev) <= -0.6;
    });

    const positiveHits = tokens.filter((token) => POSITIVE.includes(token)).length;
    const negativeHits = tokens.filter((token) => NEGATIVE.includes(token)).length;
    const emotionalTone =
      positiveHits > negativeHits ? "positive" : negativeHits > positiveHits ? "negative" : "neutral";

    return {
      correlationId: article.correlationId,
      rawArticleId: article.id,
      trendKeywords,
      anomalyFlags,
      emotionalTone,
      repetitionPatterns,
      weight: trendKeywords.length + repetitionPatterns.length + Math.abs(positiveHits - negativeHits) * 0.5,
    };
  });
}
