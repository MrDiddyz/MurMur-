import test from 'node:test';
import assert from 'node:assert/strict';
import { getPermissionsForRoles } from '../apps/node-registry/src/authz.js';

test('dev token permissions for operator do not include privileged update', () => {
  const permissions = getPermissionsForRoles(['operator']);
  assert.ok(permissions.includes('session:open:self'));
  assert.equal(permissions.includes('node:status:update'), false);
});

test('dev token permissions for architect include status update but not session:open:any', () => {
  const permissions = getPermissionsForRoles(['architect']);
  assert.ok(permissions.includes('node:status:update'));
  assert.equal(permissions.includes('session:open:any'), false);
});

test('dev token permissions for a7 include elevated session access', () => {
  const permissions = getPermissionsForRoles(['a7']);
  assert.ok(permissions.includes('session:open:any'));
});
