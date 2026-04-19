import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantFromRequest, toErrorResponse } from '@/lib/control-plane/http';
import { controlPlaneStore } from '@/lib/control-plane/store';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { tenantId, role } = resolveTenantFromRequest(request);
    if (tenantId !== params.id) {
      return NextResponse.json({ error: 'Tenant scope mismatch.' }, { status: 403 });
    }

    controlPlaneStore.authorize(tenantId, role, 'view_usage');

    const usage = controlPlaneStore.getUsageSummary(tenantId);
    const quota = controlPlaneStore.getTenantQuota(tenantId);

    return NextResponse.json({ tenantId, usage, quota });
  } catch (error) {
    return toErrorResponse(error);
  }
}
