import type { FragmentCategory } from './intelligenceTypes';

export const CATEGORY_KEYWORDS: Record<Exclude<FragmentCategory, 'uncertain'>, string[]> = {
  research: ['study', 'paper', 'dataset', 'experiment', 'hypothesis', 'analysis', 'insight'],
  product: ['user', 'feature', 'roadmap', 'prototype', 'feedback', 'onboarding', 'launch'],
  creative: ['story', 'design', 'visual', 'brand', 'script', 'narrative', 'concept'],
  engineering: ['api', 'refactor', 'bug', 'architecture', 'performance', 'typescript', 'deploy'],
  operations: ['process', 'workflow', 'meeting', 'budget', 'ops', 'compliance', 'timeline'],
  learning: ['learn', 'course', 'practice', 'mentor', 'notes', 'reading', 'skill'],
};

export function normalizeText(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function uniqueSorted(items: string[]): string[] {
  return Array.from(new Set(items)).sort((a, b) => a.localeCompare(b));
}

export function toFixedNumber(value: number, decimals = 3): number {
  return Number(value.toFixed(decimals));
}

export function scoreToConfidence(score: number): number {
  if (score <= 0) {
    return 0.2;
  }

  const normalized = Math.min(1, score / 4);
  return toFixedNumber(0.2 + normalized * 0.8);
}
