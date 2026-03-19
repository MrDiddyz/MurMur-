export type UserRole = "admin" | "artist" | "manager";

export interface Artist {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Release {
  id: string;
  artist_id: string;
  title: string;
  genre: string | null;
  release_date: string | null;
  status: string;
  cover_image_url: string | null;
  created_at: string;
}

export interface Campaign {
  id: string;
  release_id: string;
  name: string;
  objective: string | null;
  budget: number | null;
  status: string;
  created_at: string;
}

export interface ContentPack {
  id: string;
  campaign_id: string;
  platform: string;
  content_type: string;
  hook: string | null;
  caption: string | null;
  asset_url: string | null;
  created_at: string;
}

export interface PlaylistTarget {
  id: string;
  campaign_id: string;
  playlist_name: string;
  curator_name: string | null;
  contact_email: string | null;
  platform: string;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface AnalyticsSnapshot {
  id: string;
  campaign_id: string;
  platform: string;
  metric_date: string;
  streams: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  followers_gained: number;
  created_at: string;
}

export interface ScheduledJob {
  id: string;
  campaign_id: string;
  job_type: ScheduledJobType;
  run_at: string;
  status: string;
  payload_json: Record<string, unknown>;
  created_at: string;
}

export type ScheduledJobType =
  | "generate_content"
  | "publish_post"
  | "fetch_analytics"
  | "send_playlist_pitch";

export type Insertable<T extends { id: string; created_at: string }> = Omit<
  T,
  "id" | "created_at"
>;
export type Updatable<T extends { id: string; created_at: string }> = Partial<
  Insertable<T>
>;

export type ArtistInsert = Insertable<Artist>;
export type ArtistUpdate = Updatable<Artist>;
export type ReleaseInsert = Insertable<Release>;
export type ReleaseUpdate = Updatable<Release>;
export type CampaignInsert = Insertable<Campaign>;
export type CampaignUpdate = Updatable<Campaign>;
export type ContentPackInsert = Insertable<ContentPack>;
export type PlaylistTargetInsert = Insertable<PlaylistTarget>;
export type AnalyticsSnapshotInsert = Insertable<AnalyticsSnapshot>;
export type ScheduledJobInsert = Insertable<ScheduledJob>;
