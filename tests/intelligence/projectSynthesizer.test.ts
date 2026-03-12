import { describe, expect, it } from 'vitest';

import { synthesizeProjects } from '../../src/intelligence/projectSynthesizer';

describe('synthesizeProjects', () => {
  it('creates project plans with next actions and confidence', () => {
    const projects = synthesizeProjects([
      {
        id: 'idea-engineering',
        title: 'Engineering opportunity',
        summary: 'x',
        strength: 'medium',
        category: 'engineering',
        fragmentIds: ['f1', 'f2'],
        rationale: [],
      },
    ]);

    expect(projects).toHaveLength(1);
    expect(projects[0].id).toBe('project-engineering');
    expect(projects[0].nextActions).toEqual([
      'Create technical design doc',
      'Break down implementation tasks',
    ]);
    expect(projects[0].confidence).toBe(0.595);
  });
});
