import {
  ClassifiedFragment,
  Fragment,
  FragmentCategory,
} from "./intelligenceTypes";
import { CATEGORY_KEYWORDS, enrichFragment } from "./intelligenceUtils";

interface CategoryScore {
  category: FragmentCategory;
  score: number;
  reasoning: string[];
}

function scoreCategory(fragment: Fragment, category: FragmentCategory): CategoryScore {
  const content = fragment.metadata?.normalizedContent ?? fragment.content.toLowerCase();
  const tags = fragment.tags.map((tag) => tag.toLowerCase());
  const reasoning: string[] = [];
  let score = 0;

  for (const keyword of CATEGORY_KEYWORDS[category]) {
    if (content.includes(keyword)) {
      score += 2;
      reasoning.push(`Keyword '${keyword}' found in content.`);
    }

    if (tags.includes(keyword)) {
      score += 1.5;
      reasoning.push(`Tag '${keyword}' matches category vocabulary.`);
    }
  }

  if (fragment.source.toLowerCase().includes("research") && category === FragmentCategory.Research) {
    score += 1;
    reasoning.push("Source indicates research context.");
  }

  if (fragment.source.toLowerCase().includes("spec") && category === FragmentCategory.Architecture) {
    score += 1;
    reasoning.push("Source indicates architecture/spec context.");
  }

  return { category, score, reasoning };
}

export function classifyFragment(fragment: Fragment): ClassifiedFragment {
  const enriched = enrichFragment(fragment);
  const scores = (Object.values(FragmentCategory) as FragmentCategory[])
    .filter((category) => category !== FragmentCategory.Misc)
    .map((category) => scoreCategory(enriched, category))
    .sort((a, b) => b.score - a.score);

  const winner = scores[0];
  const category = winner && winner.score > 0 ? winner.category : FragmentCategory.Misc;
  const confidence = winner && winner.score > 0 ? Math.min(0.98, 0.45 + winner.score / 12) : 0.35;
  const reasoning =
    winner && winner.reasoning.length > 0
      ? winner.reasoning
      : ["No strong category signal detected; classified as misc."];

  return {
    ...enriched,
    category,
    confidence,
    classificationReasoning: reasoning,
    metadata: {
      ...enriched.metadata,
      categoryReasoning: reasoning,
    },
  };
}

export function classifyFragments(fragments: Fragment[]): ClassifiedFragment[] {
  return fragments.map(classifyFragment);
}
