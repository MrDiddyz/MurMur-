import type { Campaign } from "@murmur/types";
import { apiFetch } from "../../../../lib/api";

interface AnalyticsTimelineResponse {
  campaignId: string;
  platform: string;
  points: Array<{
    date: string;
    streams: number;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    followersGained: number;
  }>;
}

export default async function CampaignDetailPage({
  params
}: {
  params: { campaignId: string };
}) {
  const [campaign, analytics] = await Promise.all([
    apiFetch<Campaign>(`/campaigns/${params.campaignId}`),
    apiFetch<AnalyticsTimelineResponse>(`/campaigns/${params.campaignId}/analytics`)
  ]);

  return (
    <div>
      <h1>{campaign.name}</h1>
      <p>Objective: {campaign.objective ?? "N/A"}</p>
      <h2>Analytics timeline</h2>
      {analytics.points.map((point) => (
        <div className="card" key={point.date}>
          <strong>{point.date}</strong>
          <p>Streams: {point.streams}</p>
          <p>Views: {point.views}</p>
        </div>
      ))}
    </div>
  );
}
