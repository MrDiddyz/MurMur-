import { NextRequest, NextResponse } from 'next/server';
import { controlPlaneStore } from '@/lib/control-plane/store';
import { TenantPlan, TenantStatus } from '@/lib/control-plane/types';
import { toErrorResponse } from '@/lib/control-plane/http';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 401 });
    }

    const body = await request.json();
    const tenant = controlPlaneStore.handleStripeWebhook({
      tenantId: body.tenantId,
      plan: body.plan as TenantPlan,
      status: body.status as TenantStatus,
      currentPeriodEnd: body.currentPeriodEnd,
    });

    return NextResponse.json({ tenant });
  } catch (error) {
    return toErrorResponse(error);
  }
}
