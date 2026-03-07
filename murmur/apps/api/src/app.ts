import Fastify, { type FastifyInstance } from "fastify";
import type { Runtime } from "@murmur/core";
import { evolutionRoutes } from "./routes/evolution.js";
import { memoryRoutes } from "./routes/memory.js";
import { runRoutes } from "./routes/runs.js";
import { workflowRoutes } from "./routes/workflows.js";

export function buildApi(runtime: Runtime): FastifyInstance {
  const app = Fastify({ logger: true });

  app.get("/health", async () => ({ ok: true }));
  app.register(workflowRoutes, { runtime });
  app.register(runRoutes, { runtime });
  app.register(memoryRoutes, { runtime });
  app.register(evolutionRoutes, { runtime });

  return app;
}
