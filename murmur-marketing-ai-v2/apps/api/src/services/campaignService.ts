import { randomUUID } from "node:crypto";
import { campaignOrchestrator } from "@murmur/engine";
import type { Campaign, CampaignCreateInput, CampaignResponse } from "@murmur/types";

export function createCampaign(input: CampaignCreateInput): CampaignResponse {
  const timestamp = new Date().toISOString();

  const campaign: Campaign = {
    id: randomUUID(),
    name: input.name,
    status: "draft",
    budgetUSD: input.budgetUSD,
    primaryGenre: input.primaryGenre,
    channels: input.channels,
    releasePlan: input.releasePlan,
    createdAtISO: timestamp,
    updatedAtISO: timestamp
  };

  return campaignOrchestrator(campaign);
}
