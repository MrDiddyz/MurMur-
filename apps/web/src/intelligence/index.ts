import { classifyFragments } from "./fragmentClassifier";
import { clusterFragments } from "./fragmentClusterer";
import { detectProjectCandidates } from "./ideaDetector";
import { synthesizeProjects } from "./projectSynthesizer";
import {
  ClassifiedFragment,
  Fragment,
  IntelligenceInsight,
  IntelligenceResult,
} from "./intelligenceTypes";

function buildInsights(result: Omit<IntelligenceResult, "insights" | "suggestedActions">): IntelligenceInsight[] {
  const insights: IntelligenceInsight[] = [];

  if (result.clusters.length === 0) {
    insights.push({ type: "risk", message: "No meaningful semantic clusters were detected." });
  }

  if (result.projectCandidates.length > 0) {
    insights.push({
      type: "opportunity",
      message: `${result.projectCandidates.length} project candidates cleared the readiness threshold.`,
    });
  }

  const lowConfidenceFragments = result.classifiedFragments.filter((fragment: ClassifiedFragment) => fragment.confidence < 0.5).length;
  if (lowConfidenceFragments > 0) {
    insights.push({
      type: "signal",
      message: `${lowConfidenceFragments} fragments have low classification confidence and should be reviewed.`,
    });
  }

  return insights;
}

function buildSuggestedActions(result: Omit<IntelligenceResult, "insights" | "suggestedActions">): string[] {
  const actions: string[] = [];

  if (result.projectCandidates.length === 0) {
    actions.push("Collect 5-10 more focused fragments with explicit tags to improve signal quality.");
  } else {
    actions.push("Select the highest-ranked project candidate and convert it into a scoped build brief.");
  }

  actions.push("Review low-confidence classifications and update tagging conventions for cleaner ingestion.");
  actions.push("Schedule weekly intelligence runs to identify trend shifts in the archive.");

  return actions;
}

/**
 * Main orchestration entrypoint for the V1 Fragment Intelligence Engine.
 * Deterministic by design so it is stable in production and easy to debug.
 */
export function analyzeFragments(fragments: Fragment[]): IntelligenceResult {
  const classifiedFragments = classifyFragments(fragments);
  const clusters = clusterFragments(classifiedFragments);
  const projectCandidates = detectProjectCandidates(clusters, classifiedFragments);
  const synthesizedProjects = synthesizeProjects(projectCandidates, classifiedFragments);

  const partial = {
    classifiedFragments,
    clusters,
    projectCandidates,
    synthesizedProjects,
  };

  return {
    ...partial,
    insights: buildInsights(partial),
    suggestedActions: buildSuggestedActions(partial),
  };
}

export * from "./intelligenceTypes";
export * from "./fragmentClassifier";
export * from "./fragmentClusterer";
export * from "./ideaDetector";
export * from "./projectSynthesizer";

export * from "./seedFragments";
export * from "./example";
