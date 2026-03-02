import test from 'node:test';
import assert from 'node:assert/strict';
import { ROLE_PERMISSIONS, getPermissionsForRoles, hasPermission } from '../apps/node-registry/src/authz.js';

test('role permissions include required MVP actions', () => {
  assert.deepEqual(ROLE_PERMISSIONS.operator, ['node:create:self', 'node:list:self', 'session:open:self']);
  assert.ok(ROLE_PERMISSIONS.architect.includes('node:status:update'));
  assert.ok(ROLE_PERMISSIONS.a7.includes('session:open:any'));
});

test('getPermissionsForRoles merges unique permissions', () => {
  const merged = getPermissionsForRoles(['operator', 'architect']);
  assert.ok(merged.includes('node:create:self'));
  assert.ok(merged.includes('node:list:self'));
  assert.ok(merged.includes('node:status:update'));
  assert.equal(merged.filter((p) => p === 'node:create:self').length, 1);
});

test('hasPermission returns true only for exact permission', () => {
  const permissions = ['node:create:self', 'session:open:self'];
  assert.equal(hasPermission(permissions, 'node:create:self'), true);
  assert.equal(hasPermission(permissions, 'node:status:update'), false);
});
