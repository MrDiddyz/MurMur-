import { NextResponse } from 'next/server';
import { analyzeSignal } from '@/lib/signal/analyze';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { signal?: unknown };
  const signal = typeof body.signal === 'string' ? body.signal : '';

  return NextResponse.json(analyzeSignal(signal));
}
