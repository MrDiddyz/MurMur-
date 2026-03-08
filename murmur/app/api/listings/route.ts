import { NextResponse } from 'next/server';
import { getListings } from '@/lib/marketplace';

export async function GET() {
  const listings = await getListings();
  return NextResponse.json({ listings });
}
