export type JobStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface Job {
  id: string;
  name: string;
  agent: string;
  status: JobStatus;
  createdAt: string;
  summary?: string;
}

export interface RunPayload {
  prompt: string;
  agent: string;
}
