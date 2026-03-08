import { NextResponse } from 'next/server';
import { uploadMetadataToIpfs } from '@/lib/ipfs';

export async function POST(req: Request) {
  const metadata = await req.json();
  const cid = await uploadMetadataToIpfs(metadata);
  return NextResponse.json({ cid, uri: `ipfs://${cid}` });
}
