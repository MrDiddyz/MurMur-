import type { FastifyPluginAsync } from "fastify";
import type { ScheduledJobType } from "@murmur/types";
import { scheduleCampaignJob } from "../services/scheduler.service.js";

const jobTypeEnum: ScheduledJobType[] = [
  "generate_content",
  "publish_post",
  "fetch_analytics",
  "send_playlist_pitch"
];

const campaignIdParamsSchema = {
  type: "object",
  required: ["campaignId"],
  properties: {
    campaignId: { type: "string", format: "uuid" }
  }
} as const;

const createJobBodySchema = {
  type: "object",
  required: ["job_type", "run_at"],
  properties: {
    job_type: { type: "string", enum: jobTypeEnum },
    run_at: { type: "string", format: "date-time" },
    payload: { type: "object", additionalProperties: true }
  },
  additionalProperties: false
} as const;

export const scheduledJobRoutes: FastifyPluginAsync = async (app) => {
  app.post<{
    Params: { campaignId: string };
    Body: { job_type: ScheduledJobType; run_at: string; payload?: Record<string, unknown> };
  }>(
    "/campaigns/:campaignId/jobs",
    { schema: { params: campaignIdParamsSchema, body: createJobBodySchema } },
    async (request, reply) => {
      const scheduledJob = await scheduleCampaignJob({
        campaignId: request.params.campaignId,
        jobType: request.body.job_type,
        runAt: request.body.run_at,
        payload: request.body.payload
      });

      return reply.code(201).send(scheduledJob);
    }
  );
};
