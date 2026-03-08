import { listAnalyticsTimeline } from "../repositories/analytics.repo.js";

export interface AnalyticsPoint {
  date: string;
  streams: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  followersGained: number;
}

export async function getChartReadyAnalytics(campaignId: string, platform?: string) {
  const snapshots = await listAnalyticsTimeline(campaignId, platform);

  return {
    campaignId,
    platform: platform ?? "all",
    points: snapshots.map((snapshot) => ({
      date: snapshot.metric_date,
      streams: snapshot.streams,
      views: snapshot.views,
      likes: snapshot.likes,
      comments: snapshot.comments,
      shares: snapshot.shares,
      saves: snapshot.saves,
      followersGained: snapshot.followers_gained
    }))
  };
}
