import { applyProposal } from "./applier";
import { detectTriggers, EvolutionDetector } from "./detector";
import { evaluateProposal, EvolutionEvaluator } from "./evaluator";
import { governor, EvolutionGovernor } from "./governor";
import { EvolutionObserver } from "./observer";
import { proposeFromTriggers, EvolutionProposer } from "./proposer";
import { evolutionStore, type EvolutionStore } from "./store";
import type { EvolutionBaseline, EvolutionProposal, EvolutionState, Observation, TickResult } from "./types";

const observationMetricKeys = ["latency_ms", "task_success_rate", "error_rate"] as const;

export async function evolutionTick(
  store: EvolutionStore,
  args: {
    userId?: string;
    metricKey: string;
  }
): Promise<{ createdProposalIds: string[] }> {
  const triggers = await detectTriggers(store, {
    userId: args.userId,
    metricKey: args.metricKey
  });

  if (triggers.length === 0) return { createdProposalIds: [] };

  const proposals = await proposeFromTriggers(store, {
    userId: args.userId,
    triggers
  });

  const created: string[] = [];

  for (const proposal of proposals) {
    const evaluation = evaluateProposal(proposal);
    const updated = await store.updateProposal(proposal.id, {
      status: "evaluated",
      score: evaluation.score,
      risk: evaluation.risk,
      evidence: { ...(proposal.evidence ?? {}), evaluation },
      updatedAt: new Date().toISOString()
    });

    const decision = governor(updated);
    if (decision.allow) {
      await store.updateProposal(updated.id, {
        status: "approved",
        evidence: { ...(updated.evidence ?? {}), governor: decision },
        updatedAt: new Date().toISOString()
      });
    } else {
      await store.updateProposal(updated.id, {
        status: "rejected",
        evidence: { ...(updated.evidence ?? {}), governor: decision },
        updatedAt: new Date().toISOString()
      });
    }

    created.push(proposal.id);
  }

  return { createdProposalIds: created };
}

export class EvolutionEngine {
  private cycle = 0;
  private baselines: EvolutionBaseline[] = [];

  constructor(
    private readonly store: EvolutionStore,
    private readonly observer = new EvolutionObserver(),
    private readonly detector = new EvolutionDetector(),
    private readonly proposer = new EvolutionProposer(),
    private readonly evaluator = new EvolutionEvaluator(),
    private readonly governorService = new EvolutionGovernor()
  ) {}

  async tick(): Promise<TickResult> {
    this.cycle += 1;

    const observations = this.observer.observe();
    for (const obs of observations) {
      await this.store.writeObservation(obs);
    }

    const issues = this.detector.detect(observations);
    const drafted = this.proposer.propose(issues);

    const created: EvolutionProposal[] = [];
    for (const proposal of drafted) {
      const { id: _id, status: _status, ...input } = proposal;
      created.push(await this.store.createProposal(input));
    }

    const evaluated = this.evaluator.evaluate(created);
    const governed = this.governorService.govern(evaluated);

    const appliedBaselines: EvolutionBaseline[] = [];

    for (const proposal of governed) {
      const updated = await this.store.updateProposal(proposal.id, proposal);

      if (updated.status === "approved") {
        const { newBaseline } = await applyProposal(this.store, {
          userId: updated.userId,
          proposal: updated
        });

        appliedBaselines.push({
          id: crypto.randomUUID(),
          userId: updated.userId,
          proposalId: updated.id,
          baseline: newBaseline,
          active: true,
          createdAt: new Date().toISOString()
        });
      }
    }

    this.baselines = [...this.baselines, ...appliedBaselines];

    return {
      state: await this.getState(),
      observations,
      evaluatedProposals: await this.store.listProposals({ limit: 100 }),
      appliedBaselines
    };
  }

  async getState(): Promise<EvolutionState> {
    const observations = await this.readAllObservedMetrics(200);
    const proposals = await this.store.listProposals({ limit: 200 });

    return {
      cycle: this.cycle,
      observations,
      proposals,
      baselines: this.baselines,
      lastUpdatedAt: new Date().toISOString()
    };
  }

  async applyProposal(proposalId: string): Promise<EvolutionProposal | null> {
    const proposal = await this.store.getProposal(proposalId);
    if (!proposal || proposal.status !== "approved") {
      return null;
    }

    const { newBaseline } = await applyProposal(this.store, {
      userId: proposal.userId,
      proposal
    });
    const updated = (await this.store.getProposal(proposal.id)) ?? proposal;

    this.baselines.push({
      id: crypto.randomUUID(),
      userId: updated.userId,
      proposalId: updated.id,
      baseline: newBaseline,
      active: true,
      createdAt: new Date().toISOString()
    });

    return updated;
  }

  private async readAllObservedMetrics(limit: number): Promise<Observation[]> {
    const batches = await Promise.all(
      observationMetricKeys.map((metricKey) => this.store.readRecentObservations({ metricKey, limit }))
    );

    return batches.flat().sort((a, b) => {
      const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
      return aTime - bTime;
    });
  }
}

export const evolutionEngine = new EvolutionEngine(evolutionStore);

export * from "./types";
