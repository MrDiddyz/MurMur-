import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantFromRequest, toErrorResponse } from '@/lib/control-plane/http';
import { controlPlaneStore } from '@/lib/control-plane/store';
import { TenantRole } from '@/lib/control-plane/types';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { tenantId, role } = resolveTenantFromRequest(request);
    if (tenantId !== params.id) {
      return NextResponse.json({ error: 'Tenant scope mismatch.' }, { status: 403 });
    }

    controlPlaneStore.authorize(tenantId, role, 'manage_users');
    const body = await request.json();

    const invitedUser = controlPlaneStore.inviteUser(tenantId, body.email, body.role as TenantRole, body.actor ?? 'api_user');

    return NextResponse.json({ invitedUser }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
