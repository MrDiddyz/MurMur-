import {
  CouncilEngineOptions,
  CouncilEngineResult,
  CouncilRiskLevel,
  CouncilSignal,
  NormalizedCouncilSignal,
} from './types';

const DEFAULT_OPTIONS: Required<CouncilEngineOptions> = {
  confidenceWeight: 0.45,
  impactWeight: 0.35,
  urgencyWeight: 0.2,
  maxRationale: 6,
  maxRisks: 6,
  maxNextActions: 6,
};

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

function sanitizeList(items: string[] | undefined): string[] {
  if (!items?.length) {
    return [];
  }

  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

function normalizeSignal(signal: CouncilSignal, options: Required<CouncilEngineOptions>): NormalizedCouncilSignal {
  const confidence = clamp(signal.confidence ?? 0.5);
  const impact = clamp(signal.impact ?? 0.5);
  const urgency = clamp(signal.urgency ?? 0.5);

  const weightedScore = clamp(
    confidence * options.confidenceWeight +
      impact * options.impactWeight +
      urgency * options.urgencyWeight,
  );

  return {
    advisor: signal.advisor,
    recommendation: signal.recommendation,
    confidence,
    impact,
    urgency,
    rationale: sanitizeList(signal.rationale),
    risks: sanitizeList(signal.risks),
    nextActions: sanitizeList(signal.nextActions),
    weightedScore,
  };
}

function pickPrimaryRecommendation(signals: NormalizedCouncilSignal[]): string {
  const counts = new Map<string, { count: number; score: number }>();

  for (const signal of signals) {
    const current = counts.get(signal.recommendation) ?? { count: 0, score: 0 };
    counts.set(signal.recommendation, {
      count: current.count + 1,
      score: current.score + signal.weightedScore,
    });
  }

  return Array.from(counts.entries())
    .sort(([, left], [, right]) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return right.score - left.score;
    })
    .map(([recommendation]) => recommendation)[0];
}

function average(values: number[]): number {
  if (!values.length) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function deriveRiskLevel(riskCount: number): CouncilRiskLevel {
  if (riskCount >= 6) {
    return 'high';
  }

  if (riskCount >= 3) {
    return 'medium';
  }

  return 'low';
}

function rankedUnique(items: string[], max: number): string[] {
  return Array.from(new Set(items)).slice(0, max);
}

export function runCouncilEngine(
  signals: CouncilSignal[],
  options: CouncilEngineOptions = {},
): CouncilEngineResult {
  const config = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const normalized = signals.map((signal) => normalizeSignal(signal, config));

  if (!normalized.length) {
    return {
      normalized,
      decision: {
        score: 0,
        recommendation: 'insufficient-signals',
        rationale: [],
        risks: [],
        nextActions: [],
      },
      summary: {
        averageConfidence: 0,
        averageImpact: 0,
        averageUrgency: 0,
        riskLevel: 'low',
      },
    };
  }

  const recommendation = pickPrimaryRecommendation(normalized);
  const score = average(normalized.map((signal) => signal.weightedScore));

  const rationale = rankedUnique(
    normalized
      .sort((left, right) => right.weightedScore - left.weightedScore)
      .flatMap((signal) => signal.rationale),
    config.maxRationale,
  );

  const risks = rankedUnique(
    normalized
      .sort((left, right) => right.urgency - left.urgency)
      .flatMap((signal) => signal.risks),
    config.maxRisks,
  );

  const nextActions = rankedUnique(
    normalized
      .sort((left, right) => right.impact - left.impact)
      .flatMap((signal) => signal.nextActions),
    config.maxNextActions,
  );

  return {
    normalized,
    decision: {
      score,
      recommendation,
      rationale,
      risks,
      nextActions,
    },
    summary: {
      averageConfidence: average(normalized.map((signal) => signal.confidence)),
      averageImpact: average(normalized.map((signal) => signal.impact)),
      averageUrgency: average(normalized.map((signal) => signal.urgency)),
      riskLevel: deriveRiskLevel(risks.length),
    },
  };
}
