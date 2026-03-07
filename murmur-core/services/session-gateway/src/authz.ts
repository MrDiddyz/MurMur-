import type { User } from "@prisma/client";
import { getPrisma } from "./db.js";

export type AuthContext = {
  user: User;
  permissions: Set<string>;
};

export async function resolveAuthContext(emailHeader: string | undefined): Promise<AuthContext | null> {
  if (!emailHeader) {
    return null;
  }

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { email: emailHeader },
    include: {
      role: {
        include: {
          permissions: true
        }
      }
    }
  });

  if (!user) {
    return null;
  }

  return {
    user,
    permissions: new Set(user.role.permissions.map((permission) => permission.action))
  };
}

export const can = (context: AuthContext, permission: string): boolean => {
  return context.permissions.has(permission);
};
