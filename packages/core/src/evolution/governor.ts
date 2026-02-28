import type { GovernorDecision, EvolutionProposal } from "./types";

export function governor(proposal: EvolutionProposal): GovernorDecision {
  const score = proposal.score ?? 0;
  const risk = proposal.risk ?? 1;

  if (score >= 0.2 && risk <= 0.8) {
    return { allow: true, constraints: risk > 0.6 ? ["rollout<=25%", "monitor:latency_ms"] : [] };
  }

  return { allow: false, reasons: ["Score below threshold or risk too high"] };
}

export class EvolutionGovernor {
  govern(proposals: EvolutionProposal[]): EvolutionProposal[] {
    return proposals.map((proposal) => {
      const decision = governor(proposal);

      return {
        ...proposal,
        status: decision.allow ? "approved" : "rejected",
        evidence: {
          ...(proposal.evidence ?? {}),
          governor: decision
        },
        updatedAt: new Date().toISOString()
      };
    });
  }
}
