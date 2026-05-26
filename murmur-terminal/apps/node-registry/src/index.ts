import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import jwt from "@fastify/jwt";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();
const app = Fastify({ logger: true });

const permissionMatrix: Record<string, string[]> = {
  operator: ["node:create", "node:list", "session:spawn:operator"],
  architect: ["node:create", "node:list", "node:status:update", "session:spawn:admin"],
  a7: ["node:create", "node:list", "node:status:update", "session:spawn:admin"]
};

type AuthPayload = {
  sub: string;
  role: "operator" | "architect" | "a7";
};

type AuthenticatedRequest = FastifyRequest & {
  user: AuthPayload;
  authPermissions?: Set<string>;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const jwtSecret = process.env.NODE_ENV === "production"
  ? requireEnv("JWT_SECRET")
  : (process.env.JWT_SECRET || "dev-secret-change-me");

await app.register(jwt, {
  secret: jwtSecret
});

app.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify<AuthPayload>();
    const authReq = request as AuthenticatedRequest;

    const user = await prisma.user.findUnique({
      where: { id: authReq.user.sub },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true }
            }
          }
        }
      }
    });

    if (!user || user.role.name !== authReq.user.role) {
      reply.code(403).send({ error: "Role mismatch or unknown user" });
      return;
    }

    const dbPermissions = user.role.permissions.map((p) => p.permission.action);
    authReq.authPermissions = new Set(dbPermissions);
  } catch {
    reply.code(401).send({ error: "Unauthorized" });
  }
});

function authorize(requiredPermission: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const authReq = request as AuthenticatedRequest;
    const role = authReq.user?.role;
    const tokenPermissions = new Set(permissionMatrix[role] || []);
    const dbPermissions = authReq.authPermissions || new Set<string>();

    if (!tokenPermissions.has(requiredPermission) || !dbPermissions.has(requiredPermission)) {
      reply.code(403).send({ error: `Missing permission: ${requiredPermission}` });
    }
  };
}

app.get("/health", async () => ({ ok: true }));

app.addHook("onResponse", async (request, reply) => {
  const authReq = request as AuthenticatedRequest;
  const action = `${request.method}:${request.routeOptions.url}`;

  try {
    await prisma.auditLog.create({
      data: {
        userId: authReq.user?.sub || null,
        action,
        method: request.method,
        path: request.url,
        status: reply.statusCode,
        metadata: {
          ip: request.ip,
          userAgent: request.headers["user-agent"] || null
        }
      }
    });
  } catch (error) {
    request.log.error({ event: "audit_persist_failed", error });
  }

  request.log.info({
    event: "audit",
    action,
    method: request.method,
    path: request.url,
    statusCode: reply.statusCode,
    userId: authReq.user?.sub || null
  });
});

app.post(
  "/nodes",
  { preHandler: [(app as any).authenticate, authorize("node:create")] },
  async (request: FastifyRequest, reply: FastifyReply) => {
    const bodySchema = z.object({ name: z.string().min(1).max(64) });
    const { name } = bodySchema.parse(request.body);
    const userId = (request as AuthenticatedRequest).user.sub;

    const node = await prisma.node.create({ data: { name, ownerId: userId } });
    reply.code(201).send(node);
  }
);

app.get(
  "/nodes",
  { preHandler: [(app as any).authenticate, authorize("node:list")] },
  async (request: FastifyRequest) => {
    const userId = (request as AuthenticatedRequest).user.sub;
    return prisma.node.findMany({ where: { ownerId: userId }, orderBy: { createdAt: "desc" } });
  }
);

app.patch(
  "/nodes/:id/status",
  { preHandler: [(app as any).authenticate, authorize("node:status:update")] },
  async (request: FastifyRequest) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const body = z.object({ status: z.string().min(1).max(32) }).parse(request.body);
    return prisma.node.update({
      where: { id: params.id },
      data: { status: body.status }
    });
  }
);

const port = Number(process.env.PORT || 8081);
await app.listen({ port, host: "0.0.0.0" });
