import test from 'node:test';
import assert from 'node:assert/strict';
import { rankSnippets } from '../dist/engine/rankSnippets.js';

const mk = (score, id = 'x') => ({
  title: 'Neon Addiction',
  start_label: `start_${id}`,
  end_label: `end_${id}`,
  snippet_type: 'hook_first',
  creator_profile: '@murmur_artist_001',
  on_screen: 'NEON LOVE',
  caption: 'neon made me weak',
  ad_libs: ['(breathe)'],
  viral_score: score,
  reasons: ['test'],
  script: { '0_3s': 'a', '3_7s': 'b', '7_11s': 'c', '11_15s': 'd' }
});

test('rankSnippets sorts desc and ensures 10 outputs', () => {
  const out = rankSnippets([mk(80, 'a'), mk(95, 'b')]);
  assert.equal(out.length, 10);
  assert.equal(out[0].viral_score, 95);
  assert.equal(out[1].viral_score, 80);
  assert.ok(out[2].snippet_type === 'sad_loop');
});
