import type { Release, ReleaseInsert } from "@murmur/types";
import { getSupabaseAdminClient } from "../lib/supabase.js";
import { toApiError } from "../lib/errors.js";

export async function createRelease(input: ReleaseInsert): Promise<Release> {
  const { data, error } = await getSupabaseAdminClient()
    .from("releases")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw toApiError(error, "Unable to create release");
  }

  return data as Release;
}

export async function listReleases(): Promise<Release[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("releases")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw toApiError(error, "Unable to list releases");
  }

  return (data ?? []) as Release[];
}
