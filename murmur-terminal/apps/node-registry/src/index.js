import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client';
import { getPermissionsForRoles, hasPermission } from './authz.js';

const prisma = new PrismaClient();
const app = Fastify({ logger: true });
const isDev = (process.env.NODE_ENV || 'development') !== 'production';

await app.register(jwt, { secret: process.env.JWT_SECRET || 'dev-secret' });

app.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
});

app.get('/health', async () => ({ ok: true }));

app.get('/dev/token', async (request, reply) => {
  if (!isDev) {
    return reply.code(404).send({ error: 'Not found' });
  }

  const email = request.query?.email;
  if (!email) {
    return reply.code(400).send({ error: 'email query param is required' });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      userRoles: {
        include: { role: true }
      }
    }
  });

  if (!user) {
    return reply.code(404).send({ error: 'Unknown dev user' });
  }

  const roles = user.userRoles.map((ur) => ur.role.name);
  const permissions = getPermissionsForRoles(roles);
  const token = await reply.jwtSign({
    sub: user.id,
    email: user.email,
    roles,
    permissions
  });

  request.log.info({ event: 'audit.dev.token', userId: user.id, roles });
  return { token, roles, permissions, userId: user.id };
});

app.post('/nodes', { preHandler: [app.authenticate] }, async (request, reply) => {
  if (!hasPermission(request.user?.permissions || [], 'node:create:self')) {
    return reply.code(403).send({ error: 'Forbidden' });
  }

  const { name } = request.body || {};
  if (!name) {
    return reply.code(400).send({ error: 'name is required' });
  }

  const node = await prisma.node.create({
    data: {
      name,
      ownerId: request.user.sub,
      status: 'pending'
    }
  });

  request.log.info({ event: 'audit.node.create', userId: request.user.sub, nodeId: node.id });
  return reply.code(201).send(node);
});

app.get('/nodes', { preHandler: [app.authenticate] }, async (request, reply) => {
  if (!hasPermission(request.user?.permissions || [], 'node:list:self')) {
    return reply.code(403).send({ error: 'Forbidden' });
  }

  const nodes = await prisma.node.findMany({
    where: { ownerId: request.user.sub },
    orderBy: { createdAt: 'desc' }
  });

  request.log.info({ event: 'audit.node.list', userId: request.user.sub, count: nodes.length });
  return reply.send(nodes);
});

app.patch('/nodes/:id/status', { preHandler: [app.authenticate] }, async (request, reply) => {
  if (!hasPermission(request.user?.permissions || [], 'node:status:update')) {
    return reply.code(403).send({ error: 'Forbidden' });
  }

  const { id } = request.params;
  const { status } = request.body || {};

  if (!status) {
    return reply.code(400).send({ error: 'status is required' });
  }

  const node = await prisma.node.update({ where: { id }, data: { status } });
  request.log.info({ event: 'audit.node.status', userId: request.user.sub, nodeId: id, status });
  return node;
});

const port = Number(process.env.PORT || 8081);
app.listen({ host: '0.0.0.0', port }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
