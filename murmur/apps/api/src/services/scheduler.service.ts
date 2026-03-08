import { createScheduledJob, type CreateScheduledJobInput } from "@murmur/engine";
import { scheduledJobsRepository } from "../repositories/scheduled-jobs.repo.js";

export async function scheduleCampaignJob(input: CreateScheduledJobInput) {
  return createScheduledJob(scheduledJobsRepository, input);
}
