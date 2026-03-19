import type { FastifyPluginAsync } from "fastify";
import type { ReleaseInsert } from "@murmur/types";
import { createRelease, listReleases } from "../repositories/releases.repo.js";

const releaseBodySchema = {
  type: "object",
  required: ["artist_id", "title", "status"],
  properties: {
    artist_id: { type: "string", format: "uuid" },
    title: { type: "string", minLength: 1 },
    genre: { type: ["string", "null"] },
    release_date: { type: ["string", "null"], format: "date" },
    status: { type: "string", minLength: 1 },
    cover_image_url: { type: ["string", "null"] }
  },
  additionalProperties: false
} as const;

export const releaseRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: ReleaseInsert }>(
    "/releases",
    { schema: { body: releaseBodySchema } },
    async (request, reply) => {
      const release = await createRelease(request.body);
      return reply.code(201).send(release);
    }
  );

  app.get("/releases", async () => listReleases());
};
