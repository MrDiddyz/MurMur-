import type { EvaluationResult, EvolutionProposal, Observation } from "./types";

export interface EvolutionStore {
  writeObservation(obs: Observation): Promise<void>;
  readRecentObservations(args: {
    userId?: string;
    metricKey: string;
    limit: number;
  }): Promise<Observation[]>;

  createProposal(p: Omit<EvolutionProposal, "id" | "status">): Promise<EvolutionProposal>;
  updateProposal(id: string, patch: Partial<EvolutionProposal>): Promise<EvolutionProposal>;
  listProposals(args: { userId?: string; limit: number }): Promise<EvolutionProposal[]>;
  getProposal(id: string): Promise<EvolutionProposal | null>;

  setActiveBaseline(args: {
    userId?: string;
    proposalId: string;
    baseline: Record<string, unknown>;
  }): Promise<void>;

  getActiveBaseline(args: { userId?: string }): Promise<Record<string, unknown> | null>;
}

type StoredBaseline = {
  userId?: string;
  proposalId: string;
  baseline: Record<string, unknown>;
  active: boolean;
  createdAt: string;
};

export class InMemoryEvolutionStore implements EvolutionStore {
  private readonly observations: Observation[] = [];
  private readonly proposals: EvolutionProposal[] = [];
  private readonly baselines: StoredBaseline[] = [];

  async writeObservation(obs: Observation): Promise<void> {
    this.observations.push({ ...obs, createdAt: obs.createdAt ?? new Date().toISOString() });
  }

  async readRecentObservations(args: { userId?: string; metricKey: string; limit: number }): Promise<Observation[]> {
    return this.observations
      .filter((obs) => obs.metricKey === args.metricKey && (args.userId ? obs.userId === args.userId : true))
      .slice(-args.limit)
      .reverse();
  }

  async createProposal(p: Omit<EvolutionProposal, "id" | "status">): Promise<EvolutionProposal> {
    const now = new Date().toISOString();
    const proposal: EvolutionProposal = {
      id: crypto.randomUUID(),
      status: "draft",
      ...p,
      createdAt: p.createdAt ?? now,
      updatedAt: p.updatedAt ?? now
    };

    this.proposals.push(proposal);
    return proposal;
  }

  async updateProposal(id: string, patch: Partial<EvolutionProposal>): Promise<EvolutionProposal> {
    const index = this.proposals.findIndex((proposal) => proposal.id === id);
    if (index === -1) {
      throw new Error(`Proposal not found: ${id}`);
    }

    const next: EvolutionProposal = {
      ...this.proposals[index],
      ...patch,
      id,
      updatedAt: new Date().toISOString()
    };

    this.proposals[index] = next;
    return next;
  }

  async listProposals(args: { userId?: string; limit: number }): Promise<EvolutionProposal[]> {
    return this.proposals
      .filter((proposal) => (args.userId ? proposal.userId === args.userId : true))
      .slice(-args.limit)
      .reverse();
  }

  async getProposal(id: string): Promise<EvolutionProposal | null> {
    return this.proposals.find((proposal) => proposal.id === id) ?? null;
  }

  async setActiveBaseline(args: {
    userId?: string;
    proposalId: string;
    baseline: Record<string, unknown>;
  }): Promise<void> {
    for (const baseline of this.baselines) {
      if ((args.userId ? baseline.userId === args.userId : baseline.userId === undefined) && baseline.active) {
        baseline.active = false;
      }
    }

    this.baselines.push({
      userId: args.userId,
      proposalId: args.proposalId,
      baseline: args.baseline,
      active: true,
      createdAt: new Date().toISOString()
    });
  }

  async getActiveBaseline(args: { userId?: string }): Promise<Record<string, unknown> | null> {
    const baseline = [...this.baselines]
      .reverse()
      .find((item) => item.active && (args.userId ? item.userId === args.userId : item.userId === undefined));

    return baseline?.baseline ?? null;
  }

  async listBaselines(args: { userId?: string; limit: number }): Promise<StoredBaseline[]> {
    return this.baselines
      .filter((item) => (args.userId ? item.userId === args.userId : true))
      .slice(-args.limit)
      .reverse();
  }

  // keep explicit reference to EvaluationResult for store-level evaluators/extensions
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _evaluationHook(_result: EvaluationResult): void {}
}

export const evolutionStore: EvolutionStore = new InMemoryEvolutionStore();
