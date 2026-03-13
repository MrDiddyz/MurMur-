import { NextResponse } from 'next/server';

import { supabase } from '../../../../lib/supabase';

export async function POST(request: Request) {
  const event = await request.json();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    await supabase.from('purchases').insert({
      user_id: session.client_reference_id,
      product_id: session.metadata.product_id,
    });
  }

  return NextResponse.json({ received: true });
}
