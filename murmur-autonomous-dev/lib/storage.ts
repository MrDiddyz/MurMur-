import jobs from '@/data/jobs.json';
import { Job, JobStatus } from '@/lib/types';

let inMemoryJobs: Job[] = jobs;

export function listJobs() {
  return inMemoryJobs;
}

export function addJob(job: Job) {
  inMemoryJobs = [job, ...inMemoryJobs];
  return job;
}

export function updateJobStatus(id: string, status: JobStatus) {
  inMemoryJobs = inMemoryJobs.map((job) => (job.id === id ? { ...job, status } : job));
  return inMemoryJobs.find((job) => job.id === id) ?? null;
}
