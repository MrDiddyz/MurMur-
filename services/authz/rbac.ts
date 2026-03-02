export const hasRole = (userRoles: string[], requiredRole: string): boolean =>
  userRoles.includes(requiredRole);
