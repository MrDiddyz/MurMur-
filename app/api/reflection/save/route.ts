import { NextResponse } from 'next/server';
import { saveReflection } from '@/lib/memory/reflections';
import { hasSupabaseServerEnv } from '@/lib/utils/env';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { body?: unknown; source?: unknown };
  const reflection = typeof body.body === 'string' ? body.body.trim() : '';

  if (!reflection) {
    return NextResponse.json({ error: 'Reflection body is required.' }, { status: 400 });
  }

  if (!hasSupabaseServerEnv()) {
    return NextResponse.json({
      status: 'accepted',
      persisted: false,
      message: 'Supabase server environment variables are not configured.',
    });
  }

  const data = await saveReflection({
    body: reflection,
    source: typeof body.source === 'string' ? body.source : undefined,
  });

  return NextResponse.json({ status: 'saved', persisted: true, data });
}
