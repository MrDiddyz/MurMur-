export type Video = {
  id: string;
  topic: string;
  hook: string;
  script: string;
  variation_label: string;
  manifest_url: string | null;
  mp4_url: string | null;
  status: "draft" | "rendered" | "posted" | "failed";
  score: number;
  created_at: string;
};

export type Metric = {
  id: string;
  video_id: string;
  platform: "instagram" | "youtube" | "tiktok";
  views: number;
  likes: number;
  shares: number;
  saves: number;
  watch_time_sec: number;
  measured_at: string;
};

export type AbTest = {
  id: string;
  test_date: string;
  video_a_id: string;
  video_b_id: string;
  winner_video_id: string | null;
  winning_reason: string | null;
};
