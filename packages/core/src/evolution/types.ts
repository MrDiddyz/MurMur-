export type EvolutionChangeType =
  | "policy"
  | "config"
  | "role"
  | "prompt"
  | "feature_flag";

export type Observation = {
  userId?: string;
  source: string;
  metricKey: string;
  metricValue: number;
  meta?: Record<string, unknown>;
  createdAt?: string;
};

export type EvolutionProposalStatus =
  | "draft"
  | "evaluated"
  | "approved"
  | "applied"
  | "rejected"
  | "rolled_back";

export type EvolutionProposal = {
  id: string;
  userId?: string;
  status: EvolutionProposalStatus;
  title: string;
  hypothesis: string;
  changeType: EvolutionChangeType;
  patch: Record<string, unknown>;
  score?: number;
  risk?: number;
  evidence?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

export type EvaluationResult = {
  score: number;
  risk: number;
  reasons: string[];
  predictedLift?: Record<string, number>;
};

export type GovernorDecision =
  | { allow: true; constraints?: string[] }
  | { allow: false; reasons: string[] };

export type EvolutionBaseline = {
  id: string;
  userId?: string;
  proposalId: string;
  baseline: Record<string, unknown>;
  active: boolean;
  createdAt: string;
};

export type EvolutionState = {
  cycle: number;
  observations: Observation[];
  proposals: EvolutionProposal[];
  baselines: EvolutionBaseline[];
  lastUpdatedAt: string;
};

export type TickResult = {
  state: EvolutionState;
  observations: Observation[];
  evaluatedProposals: EvolutionProposal[];
  appliedBaselines: EvolutionBaseline[];
};
