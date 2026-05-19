import { NextResponse } from 'next/server';

import { getAuthenticatedUserId } from '@/lib/server/auth';
import { addJobEvent, createJob, listJobs } from '@/lib/server/lipsync';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit') ?? '20') || 20, 100);

  const jobs = await listJobs(userId, limit);
  return NextResponse.json({ jobs }, { status: 200 });
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as {
    script?: string;
    imagePath?: string;
    lipsyncProvider?: 'did' | 'heygen';
  };

  const script = body.script?.trim();
  const imagePath = body.imagePath?.trim();
  const lipsyncProvider = body.lipsyncProvider ?? 'did';

  if (!script || !imagePath) {
    return NextResponse.json({ error: 'script and imagePath are required' }, { status: 400 });
  }

  if (script.length > 5000) {
    return NextResponse.json({ error: 'script exceeds 5000 characters' }, { status: 400 });
  }

  if (!imagePath.startsWith(`images/users/${userId}/`)) {
    return NextResponse.json({ error: 'imagePath must belong to authenticated user' }, { status: 403 });
  }

  if (lipsyncProvider !== 'did' && lipsyncProvider !== 'heygen') {
    return NextResponse.json({ error: 'Invalid lipsync provider' }, { status: 400 });
  }

  const job = await createJob({
    userId,
    script,
    imagePath,
    lipsyncProvider,
  });

  await addJobEvent({
    jobId: job.id,
    userId,
    eventType: 'job_created',
    payload: { status: job.status },
  });

  return NextResponse.json({ jobId: job.id, status: job.status }, { status: 201 });
}
