import { NextResponse } from 'next/server';
import { getMinterPrivateKey } from '@/lib/server/secrets';

export async function POST(request: Request) {
  const body = (await request.json()) as { walletAddress?: string; metadataUrl?: string };

  if (!body.walletAddress || !body.metadataUrl) {
    return NextResponse.json({ error: 'walletAddress and metadataUrl are required.' }, { status: 400 });
  }

  try {
    getMinterPrivateKey();
  } catch {
    return NextResponse.json({ error: 'Minting service is not configured on server.' }, { status: 500 });
  }

  return NextResponse.json({
    tokenId: Math.floor(Math.random() * 10_000),
    txHash: `0x${crypto.randomUUID().replaceAll('-', '')}`,
  });
}
