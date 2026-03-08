import { NextResponse } from 'next/server';
import { getPinataJwt } from '@/lib/server/secrets';

export async function POST(request: Request) {
  const body = (await request.json()) as { imageUrl?: string; prompt?: string };

  if (!body.imageUrl || !body.prompt) {
    return NextResponse.json({ error: 'imageUrl and prompt are required.' }, { status: 400 });
  }

  try {
    getPinataJwt();
  } catch {
    return NextResponse.json({ error: 'IPFS service is not configured on server.' }, { status: 500 });
  }

  return NextResponse.json({
    ipfsCid: `bafy${Buffer.from(body.prompt).toString('hex').slice(0, 24)}`,
    metadataUrl: `ipfs://metadata/${encodeURIComponent(body.prompt)}`,
  });
}
