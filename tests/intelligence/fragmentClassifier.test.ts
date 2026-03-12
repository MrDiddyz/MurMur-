import { describe, expect, it } from 'vitest';

import { classifyFragment } from '../../src/intelligence/fragmentClassifier';

describe('classifyFragment', () => {
  it('classifies engineering content deterministically', () => {
    const fragment = {
      id: 'f1',
      text: 'TypeScript api refactor to fix performance bug before deploy',
      createdAt: '2024-01-01T00:00:00.000Z',
      source: 'note' as const,
    };

    const result = classifyFragment(fragment);

    expect(result.category).toBe('engineering');
    expect(result.matchedKeywords).toEqual(['api', 'bug', 'deploy', 'performance', 'typescript']);
    expect(result.confidence).toBe(1);
  });

  it('falls back to uncertain with low confidence when no keywords match', () => {
    const result = classifyFragment({
      id: 'f2',
      text: 'Random unrelated sentence with no domain cues',
      createdAt: '2024-01-01T00:00:00.000Z',
      source: 'note',
    });

    expect(result.category).toBe('uncertain');
    expect(result.confidence).toBe(0.2);
    expect(result.matchedKeywords).toEqual([]);
  });
});
