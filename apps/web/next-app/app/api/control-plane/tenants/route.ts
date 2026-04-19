import { NextRequest, NextResponse } from 'next/server';
import { controlPlaneStore } from '@/lib/control-plane/store';
import { TenantPlan } from '@/lib/control-plane/types';
import { toErrorResponse } from '@/lib/control-plane/http';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenant = controlPlaneStore.createTenant(body.name, body.ownerEmail, (body.plan ?? 'starter') as TenantPlan);

    return NextResponse.json({ tenant }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
