import { CATEGORY_KEYWORDS, normalizeText, scoreToConfidence, uniqueSorted } from './intelligenceUtils';
import type { ClassifiedFragment, FragmentCategory, FragmentInput } from './intelligenceTypes';

const CATEGORY_ORDER: FragmentCategory[] = [
  'research',
  'product',
  'creative',
  'engineering',
  'operations',
  'learning',
  'uncertain',
];

export function classifyFragment(fragment: FragmentInput): ClassifiedFragment {
  const normalizedText = normalizeText(fragment.text);
  const textTokens = normalizedText.split(' ').filter(Boolean);
  const tagTokens = (fragment.tags ?? []).flatMap((tag) => normalizeText(tag).split(' ').filter(Boolean));
  const tokenSet = new Set([...textTokens, ...tagTokens]);

  const scored = Object.entries(CATEGORY_KEYWORDS).map(([category, keywords]) => {
    const matchedKeywords = keywords.filter((keyword) => tokenSet.has(keyword));
    return {
      category: category as FragmentCategory,
      matchedKeywords,
      score: matchedKeywords.length,
    };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
  });

  const top = scored[0];
  const category = top.score > 0 ? top.category : 'uncertain';
  const confidence = scoreToConfidence(top.score);

  return {
    ...fragment,
    category,
    confidence,
    matchedKeywords: uniqueSorted(top.matchedKeywords),
  };
}

export function classifyFragments(fragments: FragmentInput[]): ClassifiedFragment[] {
  return fragments.map(classifyFragment);
}
