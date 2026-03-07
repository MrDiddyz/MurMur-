import Fastify, { type FastifyInstance } from "fastify";
import { workflowRoutes } from "./routes/workflows.js";
import type { Runtime } from "@murmur/core";

export function buildApi(runtime: Runtime): FastifyInstance {
  const app = Fastify({ logger: true });

  app.get("/health", async () => ({ ok: true }));
  app.register(workflowRoutes, { runtime });

  return app;
}
