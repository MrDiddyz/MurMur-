import { NextResponse } from 'next/server';

import { getServerSessionUser } from '@/lib/supabase/server-session';

export async function GET() {
  const user = await getServerSessionUser();
  return NextResponse.json({ user }, { headers: { 'Cache-Control': 'no-store' } });
}
