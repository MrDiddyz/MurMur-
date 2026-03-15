import {
  analyticsBrain,
  contentGenerator,
  playlistHunter,
  releasePlanner,
  viralPredictor
} from "@murmur/agents";
import type { Campaign, CampaignResponse } from "@murmur/types";

export function campaignOrchestrator(campaign: Campaign): CampaignResponse {
  const release = releasePlanner(campaign.releasePlan);
  const content = contentGenerator(campaign);
  const playlists = playlistHunter(campaign.primaryGenre);
  const virality = viralPredictor(campaign);
  const analytics = analyticsBrain(campaign);

  const warnings = [
    ...release.notes,
    ...content.notes,
    ...playlists.notes,
    ...virality.notes,
    ...analytics.notes,
    "Spotify/TikTok/Supabase integrations are placeholders pending production adapters."
  ];

  return {
    campaign: {
      ...campaign,
      contentPack: content.result,
      updatedAtISO: new Date().toISOString()
    },
    warnings
  };
}
