import { analyzeFragments } from "./index";
import { sampleSeedFragments } from "./seedFragments";

/**
 * Runnable demo helper for local verification and integration tests.
 * Execute from a TS runtime / test harness to inspect end-to-end output.
 */
export function runFragmentIntelligenceDemo() {
  const result = analyzeFragments(sampleSeedFragments);

  return {
    inputCount: sampleSeedFragments.length,
    classifiedCount: result.classifiedFragments.length,
    clusterCount: result.clusters.length,
    candidateCount: result.projectCandidates.length,
    projects: result.synthesizedProjects,
    insights: result.insights,
    suggestedActions: result.suggestedActions,
  };
}
