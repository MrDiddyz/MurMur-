import type { Campaign, ContentPack, ReleasePlan } from "@murmur/types";

export interface AgentOutput<T> {
  result: T;
  notes: string[];
}

export function releasePlanner(seed: ReleasePlan): AgentOutput<ReleasePlan> {
  return {
    result: seed,
    notes: [
      "Release planner stub is active.",
      "Supabase persistence and external trend enrichment are placeholders."
    ]
  };
}

export function contentGenerator(campaign: Campaign): AgentOutput<ContentPack> {
  const contentPack: ContentPack = {
    campaignId: campaign.id,
    narrative: `Campaign narrative for ${campaign.name}`,
    hooks: ["Hook 1", "Hook 2", "Hook 3"],
    captions: [
      "Tease your release story with short-form clips.",
      "Invite community pre-saves and comments.",
      "Share behind-the-scenes progress updates."
    ],
    assetsNeeded: ["Vertical video", "Cover art variants", "Lyrics teaser"],
    disclaimers: [
      "Spotify and TikTok publishing are currently placeholders.",
      "Human review is required before any social post is published."
    ]
  };

  return {
    result: contentPack,
    notes: ["Content generator stub is active."]
  };
}

export function playlistHunter(genre: string): AgentOutput<string[]> {
  return {
    result: [
      `${genre} editorial opportunities (placeholder)`,
      `${genre} independent curator list (placeholder)`
    ],
    notes: ["Spotify playlist crawling is a placeholder integration."]
  };
}

export function viralPredictor(campaign: Campaign): AgentOutput<{ score: number; reasoning: string[] }> {
  const score = Math.min(100, Math.round(campaign.budgetUSD / 100));

  return {
    result: {
      score,
      reasoning: [
        "Scoring model is heuristic and local-only for now.",
        "No TikTok API signals are connected yet (placeholder)."
      ]
    },
    notes: ["Viral predictor stub is active."]
  };
}

export function analyticsBrain(campaign: Campaign): AgentOutput<{ kpis: string[]; caveats: string[] }> {
  return {
    result: {
      kpis: [
        "Follower growth rate",
        "Stream-to-save conversion",
        "Content engagement velocity",
        "Email signup conversion"
      ],
      caveats: [
        "Supabase analytics sink not connected yet (placeholder).",
        "Attribution remains directional until source integrations are added."
      ]
    },
    notes: ["Analytics brain stub is active."]
  };
}
