import type { AnalyticsSnapshot, AnalyticsSnapshotInsert } from "@murmur/types";
import { getSupabaseAdminClient } from "../lib/supabase.js";
import { toApiError } from "../lib/errors.js";

export async function insertAnalyticsSnapshot(
  input: AnalyticsSnapshotInsert
): Promise<AnalyticsSnapshot> {
  const { data, error } = await getSupabaseAdminClient()
    .from("analytics_snapshots")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw toApiError(error, "Unable to insert analytics snapshot");
  }

  return data as AnalyticsSnapshot;
}

export async function listAnalyticsTimeline(
  campaignId: string,
  platform?: string
): Promise<AnalyticsSnapshot[]> {
  let query = getSupabaseAdminClient()
    .from("analytics_snapshots")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("metric_date", { ascending: true });

  if (platform) {
    query = query.eq("platform", platform);
  }

  const { data, error } = await query;
  if (error) {
    throw toApiError(error, "Unable to list analytics timeline");
  }

  return (data ?? []) as AnalyticsSnapshot[];
}
