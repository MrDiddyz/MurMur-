import type { FastifyPluginAsync } from "fastify";
import type { AnalyticsSnapshotInsert } from "@murmur/types";
import { insertAnalyticsSnapshot } from "../repositories/analytics.repo.js";
import { getChartReadyAnalytics } from "../services/analytics.service.js";

const analyticsSnapshotBodySchema = {
  type: "object",
  required: ["campaign_id", "platform", "metric_date"],
  properties: {
    campaign_id: { type: "string", format: "uuid" },
    platform: { type: "string", minLength: 1 },
    metric_date: { type: "string", format: "date" },
    streams: { type: "number", minimum: 0 },
    views: { type: "number", minimum: 0 },
    likes: { type: "number", minimum: 0 },
    comments: { type: "number", minimum: 0 },
    shares: { type: "number", minimum: 0 },
    saves: { type: "number", minimum: 0 },
    followers_gained: { type: "number" }
  },
  additionalProperties: false
} as const;

const analyticsParamsSchema = {
  type: "object",
  required: ["campaignId"],
  properties: {
    campaignId: { type: "string", format: "uuid" }
  }
} as const;

const analyticsQuerySchema = {
  type: "object",
  properties: {
    platform: { type: "string" }
  }
} as const;

export const analyticsRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: AnalyticsSnapshotInsert }>(
    "/analytics/snapshots",
    { schema: { body: analyticsSnapshotBodySchema } },
    async (request, reply) => {
      const snapshot = await insertAnalyticsSnapshot(request.body);
      return reply.code(201).send(snapshot);
    }
  );

  app.get<{ Params: { campaignId: string }; Querystring: { platform?: string } }>(
    "/campaigns/:campaignId/analytics",
    { schema: { params: analyticsParamsSchema, querystring: analyticsQuerySchema } },
    async (request) => getChartReadyAnalytics(request.params.campaignId, request.query.platform)
  );
};
