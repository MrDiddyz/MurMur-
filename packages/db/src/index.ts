import { createClient } from "@supabase/supabase-js";
import type { AbTest, Metric, Video } from "./types";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export const db = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

export async function getTopVideos(limit = 10): Promise<Video[]> {
  const { data, error } = await db
    .from("videos")
    .select("*")
    .order("score", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Video[];
}

export async function getRecentGenerations(limit = 20): Promise<Video[]> {
  const { data, error } = await db
    .from("videos")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Video[];
}

export async function getHookPerformance() {
  const { data, error } = await db.rpc("hook_performance");
  if (error) throw error;
  return data ?? [];
}

export async function getVariationPerformance() {
  const { data, error } = await db.rpc("variation_performance");
  if (error) throw error;
  return data ?? [];
}

export async function getABWinners(limit = 10): Promise<AbTest[]> {
  const { data, error } = await db
    .from("ab_tests")
    .select("*")
    .not("winner_video_id", "is", null)
    .order("test_date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as AbTest[];
}

export async function insertMetrics(rows: Metric[]) {
  const { error } = await db.from("metrics").insert(rows);
  if (error) throw error;
}
