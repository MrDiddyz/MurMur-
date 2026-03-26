import {
  ClassifiedFragment,
  FragmentCluster,
  FragmentCategory,
} from "./intelligenceTypes";
import {
  average,
  clusterLabel,
  dominantCategoriesForCluster,
  keywordOverlap,
  summarizeCluster,
} from "./intelligenceUtils";

function fragmentSimilarity(a: ClassifiedFragment, b: ClassifiedFragment): number {
  const keywordScore = keywordOverlap(a.metadata?.keywords ?? [], b.metadata?.keywords ?? []);
  const tagScore = keywordOverlap(a.tags, b.tags);
  const phraseScore = keywordOverlap(a.metadata?.signals ?? [], b.metadata?.signals ?? []);
  const categoryBonus = a.category === b.category ? 0.2 : 0;

  return Math.min(1, keywordScore * 0.5 + phraseScore * 0.2 + tagScore * 0.1 + categoryBonus);
}

function connectedComponents(nodes: ClassifiedFragment[], threshold: number): ClassifiedFragment[][] {
  const adjacency = new Map<string, Set<string>>();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  for (const node of nodes) {
    adjacency.set(node.id, new Set<string>());
  }

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const left = nodes[i];
      const right = nodes[j];
      const similarity = fragmentSimilarity(left, right);
      if (similarity >= threshold) {
        adjacency.get(left.id)?.add(right.id);
        adjacency.get(right.id)?.add(left.id);
      }
    }
  }

  const visited = new Set<string>();
  const components: ClassifiedFragment[][] = [];

  for (const node of nodes) {
    if (visited.has(node.id)) {
      continue;
    }

    const queue = [node.id];
    visited.add(node.id);
    const component: ClassifiedFragment[] = [];

    while (queue.length > 0) {
      const currentId = queue.shift();
      if (!currentId) {
        continue;
      }

      const current = byId.get(currentId);
      if (current) {
        component.push(current);
      }

      for (const neighbor of adjacency.get(currentId) ?? []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    components.push(component);
  }

  return components;
}

export function clusterFragments(
  classifiedFragments: ClassifiedFragment[],
  threshold = 0.15,
): FragmentCluster[] {
  const sorted = [...classifiedFragments].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const clusters = connectedComponents(sorted, threshold);

  return clusters.map((cluster, index) => {
    const fragmentIds = cluster.map((fragment) => fragment.id);
    const dominantCategories = dominantCategoriesForCluster(cluster);
    const internalSimilarities: number[] = [];

    for (let i = 0; i < cluster.length; i += 1) {
      for (let j = i + 1; j < cluster.length; j += 1) {
        internalSimilarities.push(fragmentSimilarity(cluster[i], cluster[j]));
      }
    }

    const confidenceScore = cluster.length === 1 ? 0.35 : Math.min(0.95, average(internalSimilarities) + 0.4);

    const scaffold: FragmentCluster = {
      id: `cluster-${index + 1}`,
      label: "",
      fragmentIds,
      summary: summarizeCluster(cluster, dominantCategories),
      dominantCategories,
      confidenceScore,
    };

    return {
      ...scaffold,
      label: clusterLabel(scaffold, sorted),
    };
  });
}

export function fragmentsByCluster(
  clusters: FragmentCluster[],
  fragments: ClassifiedFragment[],
): Record<string, ClassifiedFragment[]> {
  return clusters.reduce<Record<string, ClassifiedFragment[]>>((acc, cluster) => {
    acc[cluster.id] = fragments.filter((fragment) => cluster.fragmentIds.includes(fragment.id));
    return acc;
  }, {});
}

export function clusterCategoryCoverage(cluster: FragmentCluster): number {
  const maxCategories = Object.values(FragmentCategory).length - 1;
  return cluster.dominantCategories.length / maxCategories;
}
