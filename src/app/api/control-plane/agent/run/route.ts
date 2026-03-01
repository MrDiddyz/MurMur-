import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantFromRequest, toErrorResponse } from '@/lib/control-plane/http';
import { controlPlaneStore } from '@/lib/control-plane/store';

export async function POST(request: NextRequest) {
  try {
    const { tenantId, role } = resolveTenantFromRequest(request);
    controlPlaneStore.authorize(tenantId, role, 'run_agents');

    const body = await request.json().catch(() => ({}));
    const actor = body.actor ?? 'api_user';
    const requestedTokens = Number(body.tokens ?? 1000);

    controlPlaneStore.enforceQuota(tenantId, 'agent_runs', 1);
    controlPlaneStore.enforceQuota(tenantId, 'tokens_generated', requestedTokens);

    controlPlaneStore.addAuditLog(tenantId, actor, 'agent_run_started', 'agent:queued');
    const queue = controlPlaneStore.enqueueTenantJob(tenantId, 'agent_queue');

    controlPlaneStore.recordUsage(tenantId, 'agent_runs', 1);
    controlPlaneStore.recordUsage(tenantId, 'api_requests', 1);
    controlPlaneStore.recordUsage(tenantId, 'tokens_generated', requestedTokens);

    controlPlaneStore.addAuditLog(tenantId, actor, 'agent_run_completed', 'agent:completed');

    return NextResponse.json({
      tenantId,
      queue,
      status: 'accepted',
      metering: {
        agent_runs: 1,
        api_requests: 1,
        tokens_generated: requestedTokens,
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
