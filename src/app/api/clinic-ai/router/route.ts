import { NextResponse } from 'next/server';

import schema from '../../../../../murmur-intelligence-core/schemas/clinic-ai-knowledge-router.schema.json';
import config from '../../../../../murmur-intelligence-core/knowledge-base/clinic-ai-knowledge-router.sandra-constance.nb-NO.json';

export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json(
    {
      schema,
      config,
    },
    {
      headers: {
        'cache-control': 'public, s-maxage=600, stale-while-revalidate=86400',
      },
    }
  );
}
