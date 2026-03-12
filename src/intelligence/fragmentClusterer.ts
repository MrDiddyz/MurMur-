import { toFixedNumber, uniqueSorted } from './intelligenceUtils';
import type { ClassifiedFragment, FragmentCategory, FragmentCluster } from './intelligenceTypes';

export function clusterClassifiedFragments(fragments: ClassifiedFragment[]): FragmentCluster[] {
  const byCategory = new Map<FragmentCategory, ClassifiedFragment[]>();

  for (const fragment of fragments) {
    const current = byCategory.get(fragment.category) ?? [];
    current.push(fragment);
    byCategory.set(fragment.category, current);
  }

  const clusters: FragmentCluster[] = Array.from(byCategory.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, group]) => {
      const keywordCounts = new Map<string, number>();
      for (const fragment of group) {
        for (const keyword of fragment.matchedKeywords) {
          keywordCounts.set(keyword, (keywordCounts.get(keyword) ?? 0) + 1);
        }
      }

      const representativeKeywords = Array.from(keywordCounts.entries())
        .sort((a, b) => {
          if (b[1] !== a[1]) {
            return b[1] - a[1];
          }
          return a[0].localeCompare(b[0]);
        })
        .slice(0, 5)
        .map(([keyword]) => keyword);

      const cohesion = toFixedNumber(
        group.reduce((acc, fragment) => acc + fragment.confidence, 0) / Math.max(1, group.length),
      );

      return {
        id: `cluster-${category}`,
        category,
        fragmentIds: uniqueSorted(group.map((fragment) => fragment.id)),
        representativeKeywords,
        cohesion,
      };
    });

  return clusters;
}
