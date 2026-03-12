import { classifyFragments } from './fragmentClassifier';
import { clusterClassifiedFragments } from './fragmentClusterer';
import { detectIdeas } from './ideaDetector';
import { synthesizeProjects } from './projectSynthesizer';
import { toFixedNumber } from './intelligenceUtils';
import type { FragmentCategory, FragmentInput, IntelligenceResult } from './intelligenceTypes';

function findTopCategory(categories: FragmentCategory[]): FragmentCategory {
  const counts = new Map<FragmentCategory, number>();
  for (const category of categories) {
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }

  const entries = Array.from(counts.entries()).sort((a, b) => {
    if (b[1] !== a[1]) {
      return b[1] - a[1];
    }

    return a[0].localeCompare(b[0]);
  });

  return entries[0]?.[0] ?? 'uncertain';
}

export function analyzeFragments(fragments: FragmentInput[]): IntelligenceResult {
  const classifiedFragments = classifyFragments(fragments);
  const clusters = clusterClassifiedFragments(classifiedFragments);
  const ideas = detectIdeas(clusters);
  const projects = synthesizeProjects(ideas);

  const averageClassificationConfidence = toFixedNumber(
    classifiedFragments.reduce((sum, fragment) => sum + fragment.confidence, 0) / Math.max(1, classifiedFragments.length),
  );

  return {
    inputCount: fragments.length,
    classifiedFragments,
    clusters,
    ideas,
    projects,
    summary: {
      topCategory: findTopCategory(classifiedFragments.map((fragment) => fragment.category)),
      averageClassificationConfidence,
      generatedAt: new Date('2024-01-01T00:00:00.000Z').toISOString(),
    },
  };
}
