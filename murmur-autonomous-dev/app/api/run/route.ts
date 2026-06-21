import { NextRequest, NextResponse } from 'next/server';
import { runJob } from '@/lib/orchestrator';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const prompt = typeof body.prompt === 'string' ? body.prompt : '';
  const agent = typeof body.agent === 'string' ? body.agent : 'planner';

  if (!prompt.trim()) {
    return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
  }

  const job = await runJob({ prompt, agent });
  return NextResponse.json({ job }, { status: 201 });
}
