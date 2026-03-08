import type { ScheduledJobInsert } from "@murmur/types";
import { getSupabaseAdminClient } from "../lib/supabase.js";
import { toApiError } from "../lib/errors.js";

export const scheduledJobsRepository = {
  async createJob(job: ScheduledJobInsert): Promise<{ id: string }> {
    const { data, error } = await getSupabaseAdminClient()
      .from("scheduled_jobs")
      .insert(job)
      .select("id")
      .single();

    if (error) {
      throw toApiError(error, "Unable to create scheduled job");
    }

    return data as { id: string };
  }
};
