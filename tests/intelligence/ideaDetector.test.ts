import { describe, expect, it } from 'vitest';

import { detectIdeas } from '../../src/intelligence/ideaDetector';

describe('detectIdeas', () => {
  it('creates strong ideas for dense high-cohesion clusters', () => {
    const ideas = detectIdeas([
      {
        id: 'cluster-product',
        category: 'product',
        fragmentIds: ['a', 'b', 'c'],
        representativeKeywords: ['feature', 'feedback'],
        cohesion: 0.8,
      },
    ]);

    expect(ideas).toHaveLength(1);
    expect(ideas[0].strength).toBe('strong');
    expect(ideas[0].title).toBe('Product opportunity');
  });

  it('skips uncertain clusters', () => {
    const ideas = detectIdeas([
      {
        id: 'cluster-uncertain',
        category: 'uncertain',
        fragmentIds: ['a'],
        representativeKeywords: [],
        cohesion: 0.2,
      },
    ]);

    expect(ideas).toEqual([]);
  });
});
