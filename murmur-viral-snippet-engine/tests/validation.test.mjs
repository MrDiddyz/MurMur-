import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTrack } from '../dist/utils/validation.js';

test('validateTrack rejects bad profile format', () => {
  const errs = validateTrack({
    id: 'id',
    title: 't',
    artist: 'a',
    bpm: 120,
    key: 'C minor',
    tiktok_profile: 'murmur_artist_001',
    anchor_words: ['neon'],
    lyrics: [
      { section: 'intro', text: 'x', cue: 'whisper' },
      { section: 'hook', text: 'y', cue: 'kick' }
    ]
  });

  assert.ok(errs.some(e => e.includes('tiktok_profile')));
});
