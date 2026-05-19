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

  await updateJob(job.id, body.userId, { status: 'voice_generating' });
  await addJobEvent({
    jobId: job.id,
    userId: body.userId,
    eventType: 'voice_generation_started',
    payload: { provider: 'elevenlabs' },
  });

  const voicePath = `audio/users/${body.userId}/voices/${job.id}-${randomUUID()}.mp3`;

  const updated = await updateJob(job.id, body.userId, {
    status: 'voice_ready',
    voice_path: voicePath,
  });

  await addJobEvent({
    jobId: job.id,
    userId: body.userId,
    eventType: 'voice_generation_completed',
    payload: { voicePath },
  });

  return NextResponse.json({ ok: true, job: updated }, { status: 200 });
}
