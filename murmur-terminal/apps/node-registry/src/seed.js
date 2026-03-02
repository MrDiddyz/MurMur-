import { PrismaClient } from '@prisma/client';
import { ROLE_PERMISSIONS } from './authz.js';

const prisma = new PrismaClient();

const DEV_USERS = [
  { email: 'operator@murmur.dev', passwordHash: 'dev-only', roles: ['operator'] },
  { email: 'architect@murmur.dev', passwordHash: 'dev-only', roles: ['architect'] },
  { email: 'a7@murmur.dev', passwordHash: 'dev-only', roles: ['a7'] }
];

async function seed() {
  const permissionActions = [...new Set(Object.values(ROLE_PERMISSIONS).flat())];

  for (const action of permissionActions) {
    await prisma.permission.upsert({
      where: { action },
      update: {},
      create: { action }
    });
  }

  for (const roleName of Object.keys(ROLE_PERMISSIONS)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName }
    });

    for (const action of ROLE_PERMISSIONS[roleName]) {
      const permission = await prisma.permission.findUnique({ where: { action } });
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id }
      });
    }
  }

  for (const userDef of DEV_USERS) {
    const user = await prisma.user.upsert({
      where: { email: userDef.email },
      update: {},
      create: {
        email: userDef.email,
        passwordHash: userDef.passwordHash
      }
    });

    for (const roleName of userDef.roles) {
      const role = await prisma.role.findUnique({ where: { name: roleName } });
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: role.id } },
        update: {},
        create: { userId: user.id, roleId: role.id }
      });
    }
  }

  console.log('seed complete');
}

seed()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
