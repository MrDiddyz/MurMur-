import { NextResponse } from 'next/server';
import { resolveEntitlements } from '@/lib/murmur/access';
import { demoMember } from '@/lib/murmur/mock-data';

export async function GET(_: Request, { params }: { params: { userId: string } }) {
  const isKnownUser = params.userId === demoMember.id;
  const tier = isKnownUser ? demoMember.tier : 'core';

  return NextResponse.json({
    userId: params.userId,
    tier,
    entitlements: resolveEntitlements(tier),
  });
}
