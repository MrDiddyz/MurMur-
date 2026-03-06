import test from 'node:test';
import assert from 'node:assert/strict';

import { getFrameworkProfile, normalizeFrameworkName } from './framework-profile.mjs';

test('normalizeFrameworkName normalizes framework variants', () => {
  assert.equal(normalizeFrameworkName(' nextjs '), 'nextjs');
  assert.equal(normalizeFrameworkName('Next.js'), 'nextjs');
  assert.equal(normalizeFrameworkName('NEXTJS'), 'nextjs');
});

test('getFrameworkProfile returns the Next.js command profile', () => {
  assert.deepEqual(getFrameworkProfile({ framework: 'nextjs' }), {
    framework: 'nextjs',
    display_name: 'Next.js',
    dev_command: 'npm run dev',
    build_command: 'npm run build',
    start_command: 'npm run start',
    lint_command: 'npm run lint',
    typecheck_command: 'npm run typecheck',
  });
});

test('getFrameworkProfile rejects missing and unsupported frameworks', () => {
  assert.throws(() => getFrameworkProfile({}), /framework value is required/i);
  assert.throws(
    () => getFrameworkProfile({ framework: 'django' }),
    /unsupported framework: django/i,
  );
});
