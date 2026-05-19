import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';

import { addJobEvent, getJob, updateJob } from '@/lib/server/lipsync';

export const runtime = 'nodejs';

function requireInternalAuth(request: Request): boolean {
  const auth = request.headers.get('authorization');
  const expected = process.env.CRON_SECRET;
  return Boolean(expected && auth === `Bearer ${expected}`);
}

export async function POST(request: Request) {
  if (!requireInternalAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized internal call' }, { status: 401 });
  }

  const body = (await request.json()) as { jobId?: string; userId?: string };

  if (!body.jobId || !body.userId) {
    return NextResponse.json({ error: 'jobId and userId are required' }, { status: 400 });
  }

  const job = await getJob(body.jobId, body.userId);
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  if (!job.voice_path) {
    return NextResponse.json({ error: 'Job voice_path is missing' }, { status: 409 });
  }

  await updateJob(job.id, body.userId, { status: 'lipsync_generating' });
  await addJobEvent({
    jobId: job.id,
    userId: body.userId,
    eventType: 'lipsync_generation_started',
    payload: {
      provider: job.provider_lipsync,
      voicePath: job.voice_path,
      imagePath: job.image_path,
    },
  });

  const videoPath = `videos/users/${body.userId}/renders/${job.id}-${randomUUID()}.mp4`;

  const updated = await updateJob(job.id, body.userId, {
    status: 'completed',
    video_path: videoPath,
  });

  await addJobEvent({
    jobId: job.id,
    userId: body.userId,
    eventType: 'lipsync_generation_completed',
    payload: { videoPath },
  });

  return NextResponse.json({ ok: true, job: updated }, { status: 200 });
}
