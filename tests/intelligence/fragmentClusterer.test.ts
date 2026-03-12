import { describe, expect, it } from 'vitest';

import { clusterClassifiedFragments } from '../../src/intelligence/fragmentClusterer';
import type { ClassifiedFragment } from '../../src/intelligence/intelligenceTypes';

describe('clusterClassifiedFragments', () => {
  it('groups fragments by category and computes representative keywords', () => {
    const classified: ClassifiedFragment[] = [
      {
        id: '1',
        text: 'api bug',
        createdAt: '2024-01-01T00:00:00.000Z',
        source: 'note',
        category: 'engineering',
        confidence: 0.8,
        matchedKeywords: ['api', 'bug'],
      },
      {
        id: '2',
        text: 'api deploy',
        createdAt: '2024-01-01T00:00:00.000Z',
        source: 'note',
        category: 'engineering',
        confidence: 0.9,
        matchedKeywords: ['api', 'deploy'],
      },
    ];

    const clusters = clusterClassifiedFragments(classified);

    expect(clusters).toHaveLength(1);
    expect(clusters[0]).toMatchObject({
      id: 'cluster-engineering',
      category: 'engineering',
      fragmentIds: ['1', '2'],
      representativeKeywords: ['api', 'bug', 'deploy'],
      cohesion: 0.85,
    });
  });
});
