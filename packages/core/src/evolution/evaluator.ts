import type { EvaluationResult, EvolutionProposal } from "./types";

export function evaluateProposal(proposal: EvolutionProposal): EvaluationResult {
  const severity = Number(proposal.evidence?.severity ?? 0.5);
  const risk = Number(Math.max(0.05, 1 - severity * 0.9).toFixed(3));
  const score = Number((severity * 0.85 - risk * 0.35).toFixed(3));

  return {
    score,
    risk,
    reasons: [`Severity signal: ${severity.toFixed(3)}`, `Risk-adjusted score: ${score.toFixed(3)}`],
    predictedLift: {
      task_success_rate: Number((severity * 0.12).toFixed(3)),
      error_rate: Number((-risk * 0.08).toFixed(3))
    }
  };
}

export class EvolutionEvaluator {
  evaluate(proposals: EvolutionProposal[]): EvolutionProposal[] {
    return proposals.map((proposal) => {
      const result = evaluateProposal(proposal);

      return {
        ...proposal,
        status: "evaluated",
        risk: result.risk,
        score: result.score,
        evidence: {
          ...(proposal.evidence ?? {}),
          evaluator: {
            reasons: result.reasons,
            predictedLift: result.predictedLift
          }
        },
        updatedAt: new Date().toISOString()
      };
    });
  }
}
