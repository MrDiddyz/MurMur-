import {
  ClassifiedFragment,
  FragmentCategory,
  FragmentCluster,
  ProjectCandidate,
} from "./intelligenceTypes";
import { average } from "./intelligenceUtils";

function uniqueKeywordCount(fragments: ClassifiedFragment[]): number {
  return new Set(fragments.flatMap((fragment) => fragment.metadata?.keywords ?? [])).size;
}

function categoryDiversity(fragments: ClassifiedFragment[]): number {
  const categories = new Set(fragments.map((fragment) => fragment.category));
  return categories.size / (Object.values(FragmentCategory).length - 1);
}

function scoreCluster(cluster: FragmentCluster, fragments: ClassifiedFragment[]) {
  const sizeScore = Math.min(1, fragments.length / 4);
  const coherenceScore = cluster.confidenceScore;
  const usefulnessScore = Math.min(1, 0.2 + sizeScore * 0.55 + categoryDiversity(fragments) * 0.25);
  const buildabilityScore = average(
    fragments.map((fragment) => (fragment.category === FragmentCategory.Architecture ? 0.9 : 0.62)),
  );
  const distinctivenessScore = Math.min(1, 0.25 + uniqueKeywordCount(fragments) / 16);

  return {
    coherenceScore,
    usefulnessScore,
    buildabilityScore,
    distinctivenessScore,
  };
}

function candidateTitle(cluster: FragmentCluster, fragments: ClassifiedFragment[]): string {
  const dominantKeyword = fragments
    .flatMap((fragment) => fragment.metadata?.keywords ?? [])
    .filter((keyword) => keyword.length > 3)
    .slice(0, 1)[0];

  return dominantKeyword
    ? `${dominantKeyword[0].toUpperCase()}${dominantKeyword.slice(1)} Project System`
    : `${cluster.label} Project System`;
}

export function detectProjectCandidates(
  clusters: FragmentCluster[],
  classifiedFragments: ClassifiedFragment[],
  threshold = 0.58,
): ProjectCandidate[] {
  const candidates: ProjectCandidate[] = [];

  for (const cluster of clusters) {
    const fragments = classifiedFragments.filter((fragment) => cluster.fragmentIds.includes(fragment.id));
    if (fragments.length < 2) {
      continue;
    }

    const scoring = scoreCluster(cluster, fragments);

    const opportunityScore = average([
      scoring.coherenceScore,
      scoring.usefulnessScore,
      scoring.distinctivenessScore,
    ]);
    const executionScore = average([scoring.buildabilityScore, scoring.coherenceScore]);

    if (opportunityScore < threshold) {
      continue;
    }

    candidates.push({
      id: `candidate-${cluster.id}`,
      title: candidateTitle(cluster, fragments),
      summary: `Emergent project from ${fragments.length} aligned fragments in ${cluster.label}.`,
      fragmentIds: fragments.map((fragment) => fragment.id),
      opportunityScore,
      noveltyScore: scoring.distinctivenessScore,
      executionScore,
      recommendedNextStep:
        executionScore > 0.7
          ? "Draft technical spec + build a thin vertical prototype in the next sprint."
          : "Run a one-week validation sprint to de-risk feasibility assumptions.",
      scoring,
    });
  }

  return candidates.sort((a, b) => b.opportunityScore - a.opportunityScore);
}
