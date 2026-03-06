import { addJob, updateJobStatus } from '@/lib/storage';
import { Job, RunPayload } from '@/lib/types';

export async function runJob(payload: RunPayload): Promise<Job> {
  const created: Job = {
    id: crypto.randomUUID(),
    name: payload.prompt.slice(0, 48) || 'Untitled run',
    agent: payload.agent,
    status: 'queued',
    createdAt: new Date().toISOString()
  };

  addJob(created);
  updateJobStatus(created.id, 'running');

  await new Promise((resolve) => setTimeout(resolve, 200));

  return (
    updateJobStatus(created.id, 'completed') ?? {
      ...created,
      status: 'completed'
    }
  );
}
