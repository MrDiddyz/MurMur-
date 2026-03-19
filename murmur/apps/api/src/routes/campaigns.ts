import type { FastifyPluginAsync } from "fastify";
import type { CampaignInsert } from "@murmur/types";
import { createCampaign, getCampaignById, listCampaigns } from "../repositories/campaigns.repo.js";

const campaignBodySchema = {
  type: "object",
  required: ["release_id", "name", "status"],
  properties: {
    release_id: { type: "string", format: "uuid" },
    name: { type: "string", minLength: 1 },
    objective: { type: ["string", "null"] },
    budget: { type: ["number", "null"] },
    status: { type: "string", minLength: 1 }
  },
  additionalProperties: false
} as const;

const campaignIdParamsSchema = {
  type: "object",
  required: ["campaignId"],
  properties: {
    campaignId: { type: "string", format: "uuid" }
  }
} as const;

export const campaignRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: CampaignInsert }>(
    "/campaigns",
    { schema: { body: campaignBodySchema } },
    async (request, reply) => {
      const campaign = await createCampaign(request.body);
      return reply.code(201).send(campaign);
    }
  );

  app.get("/campaigns", async () => listCampaigns());

  app.get<{ Params: { campaignId: string } }>(
    "/campaigns/:campaignId",
    { schema: { params: campaignIdParamsSchema } },
    async (request, reply) => {
      const campaign = await getCampaignById(request.params.campaignId);

      if (!campaign) {
        return reply.code(404).send({ message: "Campaign not found" });
      }

      return campaign;
    }
  );
};
