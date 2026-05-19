import { NextResponse } from 'next/server';

import { getAuthenticatedUserId } from '@/lib/server/auth';
import { addJobEvent, deleteJob, deleteStorageObject, getJob } from '@/lib/server/lipsync';

export const runtime = 'nodejs';

type RouteContext = {
  params: {
    jobId: string;
  };
};

export async function GET(_request: Request, { params }: RouteContext) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const job = await getJob(params.jobId, userId);
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json({ job }, { status: 200 });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const job = await getJob(params.jobId, userId);
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  const cleanupPaths = [job.image_path, job.voice_path, job.video_path].filter(Boolean) as string[];
  await Promise.all(cleanupPaths.map((path) => deleteStorageObject(path)));

  await addJobEvent({
    jobId: job.id,
    userId,
    eventType: 'job_deleted',
    payload: { cleanupPaths },
  });

  await deleteJob(job.id, userId);

  return NextResponse.json({ ok: true }, { status: 200 });
}
