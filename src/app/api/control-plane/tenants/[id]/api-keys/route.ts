import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantFromRequest, toErrorResponse } from '@/lib/control-plane/http';
import { controlPlaneStore } from '@/lib/control-plane/store';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { tenantId, role } = resolveTenantFromRequest(request);
    if (tenantId !== params.id) {
      return NextResponse.json({ error: 'Tenant scope mismatch.' }, { status: 403 });
    }

    controlPlaneStore.authorize(tenantId, role, 'manage_api_keys');
    const body = await request.json().catch(() => ({}));
    const apiKey = controlPlaneStore.createApiKey(tenantId, body.actor ?? 'api_user');

    return NextResponse.json({ apiKey }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
