import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const prompt = body?.prompt ?? 'Untitled artwork';

  return NextResponse.json({
    id: crypto.randomUUID(),
    prompt,
    imageUrl: `https://picsum.photos/seed/${encodeURIComponent(prompt)}/1024/1024`,
  });
}
