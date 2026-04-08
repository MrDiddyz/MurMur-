export const ROLE_PERMISSIONS = {
  operator: ['node:create:self', 'node:list:self', 'session:open:self'],
  architect: ['node:create:self', 'node:list:self', 'node:status:update', 'session:open:self'],
  a7: ['node:create:self', 'node:list:self', 'node:status:update', 'session:open:any', 'dev:token:mint']
};

export function getPermissionsForRoles(roles = []) {
  const merged = new Set();
  for (const role of roles) {
    for (const action of ROLE_PERMISSIONS[role] || []) {
      merged.add(action);
    }
  }
  return [...merged];
}

export function hasAnyRole(userRoles = [], allowed = []) {
  return userRoles.some((role) => allowed.includes(role));
}

export function hasPermission(userPermissions = [], required) {
  return userPermissions.includes(required);
}
