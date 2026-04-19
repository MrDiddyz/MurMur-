import { NextResponse } from 'next/server';
import { pingSupabase } from '@/lib/server/supabase-admin';

export async function GET() {
  const startedAt = Date.now();

  try {
    const database = await pingSupabase();
    return NextResponse.json({
      ok: true,
      services: { database },
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Health check failed',
        latencyMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
