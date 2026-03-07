import { randomUUID } from "node:crypto";
import type { AgentResult, AgentTask, BaseAgent, EvaluationResult, EvolutionProposal } from "@murmur/agents-core";
import type { AgentContext } from "@murmur/shared";

export interface EvolutionStageOutput {
  stage: "evolution";
  proposals: Array<{
    id: string;
    type: "prompt-change" | "routing-change" | "tooling-change" | "memory-rule" | "workflow-change";
    title: string;
    rationale: string;
    expectedBenefit: string;
    riskLevel: "low" | "medium" | "high";
    patchHint?: string;
    applyMode: "manual-review";
  }>;
}

export class EvolutionAgent implements BaseAgent<EvolutionStageOutput> {
  readonly name = "EvolutionAgent";
  readonly role = "evolution" as const;
  readonly promptVersion = "evolution.v2.0.0";
  readonly promptDescription = "Proposes safe, reviewable improvements based on run diagnostics.";

  async run(task: AgentTask, context: AgentContext): Promise<AgentResult<EvolutionStageOutput>> {
    const evaluation = context.priorSteps.find((step) => step.agentRole === "evaluator")?.output as EvaluationResult | undefined;
    const proposals: EvolutionProposal[] = [];

    if (evaluation && evaluation.scores.coherence < 75) {
      proposals.push(this.makeProposal(context, "prompt-change", "Tighten Teacher success-criteria prompt", "Low coherence indicates planning constraints are too broad.", "Improves traceability between stages.", "low", "Refine teacher success criteria template with explicit measurable fields."));
    }
    if (evaluation && evaluation.scores.actionability < 75) {
      proposals.push(this.makeProposal(context, "workflow-change", "Insert CriticAgent before Reflective", "Actionability is repeatedly weak in final drafts.", "Stronger downstream response quality.", "medium", "Add critic stage that checks concrete next steps before reflection."));
    }
    proposals.push(this.makeProposal(context, "routing-change", "Route simple goals to murmur-fast", `Objective '${task.objective}' can often be solved by short flow.`, "Reduced latency and compute cost for low-complexity runs.", "low"));

    return {
      stage: "evolution",
      output: { stage: "evolution", proposals: proposals.map(({ runId: _runId, workflowId: _wf, createdAt: _t, ...rest }) => rest) },
      summary: `Generated ${proposals.length} evolution proposal(s).`
    };
  }

  private makeProposal(
    context: AgentContext,
    type: EvolutionProposal["type"],
    title: string,
    rationale: string,
    expectedBenefit: string,
    riskLevel: EvolutionProposal["riskLevel"],
    patchHint?: string
  ): EvolutionProposal {
    return {
      id: randomUUID(),
      runId: context.runId,
      workflowId: context.workflowId,
      type,
      title,
      rationale,
      expectedBenefit,
      riskLevel,
      patchHint,
      applyMode: "manual-review",
      createdAt: new Date().toISOString()
    };
  }
}
