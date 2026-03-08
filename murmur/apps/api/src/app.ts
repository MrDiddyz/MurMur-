import Fastify, { type FastifyInstance } from "fastify";
import { workflowRoutes } from "./routes/workflows.js";
import { releaseRoutes } from "./routes/releases.js";
import { campaignRoutes } from "./routes/campaigns.js";
import { analyticsRoutes } from "./routes/analytics.js";
import type { Runtime } from "@murmur/core";
import { ApiError } from "./lib/errors.js";

export function buildApi(runtime: Runtime): FastifyInstance {
  const app = Fastify({ logger: true });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ApiError) {
      request.log.error({ error: error.details }, error.message);
      reply.code(error.statusCode).send({ message: error.message });
      return;
    }

    request.log.error(error);
    reply.code(500).send({ message: "Internal server error" });
  });

  app.get("/health", async () => ({ ok: true }));
  app.register(workflowRoutes, { runtime });
  app.register(releaseRoutes, { prefix: "/v1" });
  app.register(campaignRoutes, { prefix: "/v1" });
  app.register(analyticsRoutes, { prefix: "/v1" });

  return app;
}
