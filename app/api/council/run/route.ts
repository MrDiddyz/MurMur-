import { NextResponse } from 'next/server';
import { councilMembers } from '@/lib/council/members';

export async function POST() {
  return NextResponse.json({
    status: 'ready',
    members: councilMembers,
    nextStep: 'Connect model orchestration in lib/council.',
  });
}
