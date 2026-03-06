import { NextRequest, NextResponse } from 'next/server';
import { stripeServer } from '@/lib/stripe';
import { updateOrderByCheckoutSessionId } from '@/lib/supabase-admin';

type RefundResponse = {
  id: string;
  status: string;
};

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('x-admin-key');
    if (!authHeader || authHeader !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as { chargeId?: string; checkoutSessionId?: string; amount?: number };
    if (!body.chargeId) {
      return NextResponse.json({ error: 'chargeId is required.' }, { status: 400 });
    }

    const refund = await stripeServer.postForm<RefundResponse>('/refunds', {
      charge: body.chargeId,
      amount: body.amount,
      reverse_transfer: true,
      refund_application_fee: true,
    });

    if (body.checkoutSessionId) {
      await updateOrderByCheckoutSessionId(body.checkoutSessionId, {
        status: 'refunded',
      });
    }

    return NextResponse.json({ refundId: refund.id, status: refund.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create refund.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
