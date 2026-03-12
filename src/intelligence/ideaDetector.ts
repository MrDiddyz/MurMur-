import { toFixedNumber } from './intelligenceUtils';
import type { DetectedIdea, FragmentCluster, IdeaStrength } from './intelligenceTypes';

function resolveStrength(fragmentCount: number, cohesion: number): IdeaStrength {
  if (fragmentCount >= 3 && cohesion >= 0.7) {
    return 'strong';
  }

  if (fragmentCount >= 2 && cohesion >= 0.5) {
    return 'medium';
  }

  return 'weak';
}

export function detectIdeas(clusters: FragmentCluster[]): DetectedIdea[] {
  return clusters
    .filter((cluster) => cluster.category !== 'uncertain')
    .map((cluster) => {
      const fragmentCount = cluster.fragmentIds.length;
      const strength = resolveStrength(fragmentCount, cluster.cohesion);
      const title = `${cluster.category[0].toUpperCase()}${cluster.category.slice(1)} opportunity`;
      const keywordText = cluster.representativeKeywords.join(', ') || 'cross-cutting signals';

      return {
        id: `idea-${cluster.category}`,
        title,
        summary: `Detected ${cluster.category} thread from ${fragmentCount} fragment(s): ${keywordText}.`,
        strength,
        category: cluster.category,
        fragmentIds: cluster.fragmentIds,
        rationale: [
          `Cluster cohesion: ${toFixedNumber(cluster.cohesion)}.`,
          `Fragment count: ${fragmentCount}.`,
          `Representative keywords: ${keywordText}.`,
        ],
      };
    });
}
