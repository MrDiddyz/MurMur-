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
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: 'Malformed JSON body.' }, { status: 400 });
    }

    const actor = typeof body.actor === 'string' && body.actor.trim() ? body.actor : 'api_user';
    const apiKey = controlPlaneStore.createApiKey(tenantId, actor);

    return NextResponse.json({ apiKey }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
