export type CampaignStatus = "draft" | "active" | "paused" | "completed";

export interface CampaignChannel {
  name: "spotify" | "tiktok" | "instagram" | "youtube" | "email";
  objective: string;
  cadencePerWeek: number;
  notes?: string;
}

export interface ReleasePlan {
  title: string;
  artistName: string;
  releaseDateISO: string;
  goals: string[];
  timeline: Array<{
    weekOffset: number;
    milestone: string;
    owner: "artist" | "manager" | "platform";
  }>;
}

export interface ContentPack {
  campaignId: string;
  narrative: string;
  hooks: string[];
  captions: string[];
  assetsNeeded: string[];
  disclaimers: string[];
}

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  budgetUSD: number;
  primaryGenre: string;
  channels: CampaignChannel[];
  releasePlan: ReleasePlan;
  contentPack?: ContentPack;
  createdAtISO: string;
  updatedAtISO: string;
}

export interface CampaignCreateInput {
  name: string;
  budgetUSD: number;
  primaryGenre: string;
  releasePlan: ReleasePlan;
  channels: CampaignChannel[];
}

export interface CampaignResponse {
  campaign: Campaign;
  warnings: string[];
}
