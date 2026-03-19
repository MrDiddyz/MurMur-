import type { Campaign, CampaignInsert } from "@murmur/types";
import { getSupabaseAdminClient } from "../lib/supabase.js";
import { toApiError } from "../lib/errors.js";

export async function createCampaign(input: CampaignInsert): Promise<Campaign> {
  const { data, error } = await getSupabaseAdminClient()
    .from("campaigns")
    .insert(input)
    .select("*")
    .single();

  if (error) {
    throw toApiError(error, "Unable to create campaign");
  }

  return data as Campaign;
}

export async function listCampaigns(): Promise<Campaign[]> {
  const { data, error } = await getSupabaseAdminClient()
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw toApiError(error, "Unable to list campaigns");
  }

  return (data ?? []) as Campaign[];
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw toApiError(error, "Unable to fetch campaign");
  }

  return (data as Campaign | null) ?? null;
}
