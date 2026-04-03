import { Signal } from "./murmurMediaEngine/types";
import { topN, tokenize } from "./murmurMediaEngine/utils";

const POSITIVE = ["growth", "wins", "breakthrough", "gain", "upside", "optimism"];
const NEGATIVE = ["risk", "drop", "loss", "crisis", "fraud", "decline"];

export function scanSignals(
  articles: Array<{ id: string; body: string; correlationId: string }>,
): Omit<Signal, "id" | "timestamp">[] {
  const globalWordCounts: Record<string, number> = {};

  const tokenized = articles.map((article) => {
    const tokens = tokenize(article.body);
    for (const token of tokens) {
      globalWordCounts[token] = (globalWordCounts[token] ?? 0) + 1;
    }
    return { article, tokens };
  });

  const medianFrequency = Object.values(globalWordCounts).sort((a, b) => a - b)[
    Math.floor(Object.values(globalWordCounts).length / 2)
  ] ?? 1;

  return tokenized.map(({ article, tokens }) => {
    const localCounts: Record<string, number> = {};
    tokens.forEach((token) => {
      localCounts[token] = (localCounts[token] ?? 0) + 1;
    });

    const trendKeywords = topN(localCounts, 5);
    const repetitionPatterns = Object.entries(localCounts)
      .filter(([, count]) => count >= 3)
      .map(([token, count]) => `${token}:${count}`);

    const anomalyFlags = trendKeywords.filter(
      (keyword) => (globalWordCounts[keyword] ?? 0) <= medianFrequency,
    );

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
      weight: trendKeywords.length + repetitionPatterns.length,
    };
  });
}
