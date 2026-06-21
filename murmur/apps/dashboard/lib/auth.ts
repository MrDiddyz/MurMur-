import type { UserRole } from "@murmur/types";

interface AuthUser {
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}

const allowedRoles: UserRole[] = ["admin", "artist", "manager"];

export function getUserRole(user: AuthUser | null): UserRole | null {
  if (!user) {
    return null;
  }

  const roleCandidate = user.app_metadata?.role ?? user.user_metadata?.role;

  if (typeof roleCandidate !== "string") {
    return null;
  }

  return allowedRoles.includes(roleCandidate as UserRole) ? (roleCandidate as UserRole) : null;
}
