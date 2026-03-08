import { NextResponse } from 'next/server';

import { getSupabaseConfig } from '@/lib/supabase/env';

export async function GET() {
  const startedAt = Date.now();

  try {
    const { url, anonKey } = getSupabaseConfig();

    let lastStatus = 0;
    let lastDetails = '';

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const response = await fetch(`${url}/auth/v1/settings`, {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
        cache: 'no-store',
        next: { revalidate: 0 },
      });

      if (response.ok) {
        return NextResponse.json({ ok: true, latencyMs: Date.now() - startedAt });
      }

      lastStatus = response.status;
      lastDetails = await response.text();
    }

    return NextResponse.json(
      {
        ok: false,
        status: lastStatus,
        details: lastDetails,
        latencyMs: Date.now() - startedAt,
      },
      { status: 502 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Supabase error';
    return NextResponse.json({ ok: false, message, latencyMs: Date.now() - startedAt }, { status: 500 });
  }
}
