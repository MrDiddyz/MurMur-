import { describe, expect, it } from 'vitest';

import { analyzeFragments } from '../../src/intelligence/analyzeFragments';
import { SAMPLE_FRAGMENTS } from '../../src/intelligence/sampleFragments';

describe('analyzeFragments', () => {
  it('returns complete deterministic intelligence result', () => {
    const result = analyzeFragments(SAMPLE_FRAGMENTS);

    expect(result.inputCount).toBe(6);
    expect(result.classifiedFragments).toHaveLength(6);
    expect(result.clusters.length).toBeGreaterThan(0);
    expect(result.ideas.length).toBeGreaterThan(0);
    expect(result.projects.length).toBe(result.ideas.length);
    expect(result.summary.generatedAt).toBe('2024-01-01T00:00:00.000Z');
  });
});
