import { clampScore } from "@murmur/agents-core";
import type { AgentResult, AgentTask, BaseAgent, EvaluationResult } from "@murmur/agents-core";
import type { AgentContext } from "@murmur/shared";

export class EvaluatorAgent implements BaseAgent<EvaluationResult> {
  readonly name = "EvaluatorAgent";
  readonly role = "evaluator" as const;
  readonly promptVersion = "evaluator.v2.0.0";
  readonly promptDescription = "Applies deterministic heuristics to score run quality.";

  async run(task: AgentTask, context: AgentContext): Promise<AgentResult<EvaluationResult>> {
    const reflective = context.priorSteps.find((step) => step.agentRole === "reflective")?.output as
      | { finalDraft?: { rationale?: string; improvements?: string[]; direction?: { id?: string } } }
      | undefined;
    const thinktank = context.priorSteps.find((step) => step.agentRole === "thinktank")?.output as
      | { selectedVariant?: { id?: string } }
      | undefined;

    const rationaleLength = reflective?.finalDraft?.rationale?.length ?? 0;
    const improvementCount = reflective?.finalDraft?.improvements?.length ?? 0;
    const alignmentBoost =
      reflective?.finalDraft?.direction &&
      thinktank?.selectedVariant?.id &&
      reflective.finalDraft.direction.id === thinktank.selectedVariant.id
        ? 20
        : 0;

    const usefulness = clampScore(50 + improvementCount * 10);
    const coherence = clampScore(45 + Math.min(30, Math.floor(rationaleLength / 12)));
    const actionability = clampScore(40 + improvementCount * 15);
    const originality = clampScore(48 + (context.priorSteps.some((s) => s.agentRole === "experimental") ? 18 : 0));
    const alignment = clampScore(55 + alignmentBoost);
    const overall = clampScore((usefulness + coherence + actionability + originality + alignment) / 5);

    const output: EvaluationResult = {
      stage: "evaluation",
      scores: { usefulness, coherence, actionability, originality, alignment, overall },
      strengths: [
        usefulness >= 70 ? "Output includes reusable improvements." : "Output needs stronger practical guidance.",
        coherence >= 70 ? "Reasoning remained coherent." : "Reasoning coherence could be improved."
      ],
      weaknesses: [
        actionability < 70 ? "Actionability is below target." : "Actionability is acceptable.",
        originality < 70 ? "Exploration diversity could be expanded." : "Exploration had reasonable diversity."
      ],
      failureModes: [alignment < 65 ? "Final output may diverge from selected variant." : "No major failure mode detected."],
      recommendations: [
        "Require minimum of 3 concrete next actions in reflective output.",
        "Add confidence thresholds for variant selection.",
        `Tie scoring rubric to objective: ${task.objective}`
      ]
    };

    return { stage: "evaluation", output, summary: `Overall run score: ${overall}.` };
  }
}
