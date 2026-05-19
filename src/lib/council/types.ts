export type CouncilRiskLevel = 'low' | 'medium' | 'high';

export interface CouncilSignal {
  advisor: string;
  recommendation: string;
  confidence?: number;
  impact?: number;
  urgency?: number;
  rationale?: string[];
  risks?: string[];
  nextActions?: string[];
}

export interface NormalizedCouncilSignal {
  advisor: string;
  recommendation: string;
  confidence: number;
  impact: number;
  urgency: number;
  rationale: string[];
  risks: string[];
  nextActions: string[];
  weightedScore: number;
}

export interface CouncilDecision {
  score: number;
  recommendation: string;
  rationale: string[];
  risks: string[];
  nextActions: string[];
}

export interface CouncilSummary {
  averageConfidence: number;
  averageImpact: number;
  averageUrgency: number;
  riskLevel: CouncilRiskLevel;
}

export interface CouncilEngineResult {
  normalized: NormalizedCouncilSignal[];
  decision: CouncilDecision;
  summary: CouncilSummary;
}

export interface CouncilEngineOptions {
  confidenceWeight?: number;
  impactWeight?: number;
  urgencyWeight?: number;
  maxRationale?: number;
  maxRisks?: number;
  maxNextActions?: number;
}
