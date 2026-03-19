import type { ScheduledJobInsert, ScheduledJobType } from "@murmur/types";

export interface SchedulerRepository {
  createJob(job: ScheduledJobInsert): Promise<{ id: string }>;
}

export interface CreateScheduledJobInput {
  campaignId: string;
  jobType: ScheduledJobType;
  runAt: string;
  payload?: Record<string, unknown>;
}

export async function createScheduledJob(
  repository: SchedulerRepository,
  input: CreateScheduledJobInput
) {
  return repository.createJob({
    campaign_id: input.campaignId,
    job_type: input.jobType,
    run_at: input.runAt,
    status: "pending",
    payload_json: input.payload ?? {}
  });
}
