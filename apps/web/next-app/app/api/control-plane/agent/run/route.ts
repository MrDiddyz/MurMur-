import { NextRequest, NextResponse } from 'next/server';
import { resolveTenantFromRequest, toErrorResponse } from '@/lib/control-plane/http';
import { controlPlaneStore } from '@/lib/control-plane/store';

export async function POST(request: NextRequest) {
  try {
    const { tenantId, role } = resolveTenantFromRequest(request);
    controlPlaneStore.authorize(tenantId, role, 'run_agents');

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: 'Malformed JSON body.' }, { status: 400 });
    }

    const actor = typeof body.actor === 'string' && body.actor.trim() ? body.actor : 'api_user';
    const requestedTokens = Number(body.tokens ?? 1000);

    if (!Number.isFinite(requestedTokens) || requestedTokens <= 0) {
      return NextResponse.json({ error: 'tokens must be a positive number.' }, { status: 400 });
    }

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
