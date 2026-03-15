import {
  ClassifiedFragment,
  Fragment,
  FragmentCategory,
  FragmentCluster,
} from "./intelligenceTypes";

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "to",
  "for",
  "of",
  "in",
  "on",
  "at",
  "by",
  "with",
  "from",
  "is",
  "are",
  "be",
  "this",
  "that",
  "it",
  "as",
  "into",
  "than",
  "we",
  "our",
]);

export const CATEGORY_KEYWORDS: Record<FragmentCategory, string[]> = {
  [FragmentCategory.Vision]: ["vision", "future", "north star", "impact", "mission"],
  [FragmentCategory.Feature]: ["feature", "ui", "flow", "prototype", "experience"],
  [FragmentCategory.Architecture]: ["architecture", "backend", "infra", "database", "api", "pipeline"],
  [FragmentCategory.Workflow]: ["workflow", "process", "automation", "routine", "ops"],
  [FragmentCategory.Monetization]: ["pricing", "revenue", "subscription", "monetization", "sales"],
  [FragmentCategory.Research]: ["research", "experiment", "hypothesis", "validation", "insight"],
  [FragmentCategory.Branding]: ["brand", "positioning", "voice", "narrative", "identity"],
  [FragmentCategory.Community]: ["community", "network", "collaboration", "creator", "local"],
  [FragmentCategory.System]: ["system", "agent", "intelligence", "orchestration", "engine"],
  [FragmentCategory.Misc]: [],
};

export function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function extractKeywords(text: string): string[] {
  const normalized = normalizeText(text);
  return Array.from(
    new Set(normalized.split(" ").filter((token) => token && token.length > 2 && !STOP_WORDS.has(token))),
  );
}

export function extractBigrams(text: string): string[] {
  const tokens = extractKeywords(text);
  const bigrams: string[] = [];
  for (let index = 0; index < tokens.length - 1; index += 1) {
    bigrams.push(`${tokens[index]} ${tokens[index + 1]}`);
  }
  return bigrams;
}

export function keywordOverlap(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) {
    return 0;
  }

  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = Array.from(setA).filter((token) => setB.has(token)).length;
  return intersection / Math.max(setA.size, setB.size);
}

export function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function summarizeCluster(
  clusterFragments: ClassifiedFragment[],
  dominantCategories: FragmentCategory[],
): string {
  const topKeywords = Array.from(
    new Set(clusterFragments.flatMap((fragment) => fragment.metadata?.keywords ?? [])),
  ).slice(0, 8);

  return `Cluster combines ${clusterFragments.length} fragments around ${dominantCategories.join(", ") || "mixed signals"} with key signals: ${topKeywords.join(", ") || "low keyword density"}.`;
}

export function dominantCategoriesForCluster(
  clusterFragments: ClassifiedFragment[],
): FragmentCategory[] {
  const categoryCount = new Map<FragmentCategory, number>();

  for (const fragment of clusterFragments) {
    categoryCount.set(fragment.category, (categoryCount.get(fragment.category) ?? 0) + 1);
  }

  return Array.from(categoryCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category]) => category);
}

export function enrichFragment(fragment: Fragment): Fragment {
  const normalizedContent = normalizeText(fragment.content);
  const keywords = extractKeywords(fragment.content);
  const phrases = extractBigrams(fragment.content);

  return {
    ...fragment,
    metadata: {
      ...fragment.metadata,
      normalizedContent,
      keywords,
      signals: phrases,
    },
  };
}

export function clusterLabel(cluster: FragmentCluster, fragments: ClassifiedFragment[]): string {
  const related = fragments.filter((fragment) => cluster.fragmentIds.includes(fragment.id));
  const keywordCounts = new Map<string, number>();

  for (const fragment of related) {
    for (const keyword of fragment.metadata?.keywords ?? []) {
      keywordCounts.set(keyword, (keywordCounts.get(keyword) ?? 0) + 1);
    }
  }

  const leadKeyword = Array.from(keywordCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "fragment";
  return `${leadKeyword} initiative`;
}
