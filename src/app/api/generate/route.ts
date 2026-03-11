import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = (await request.json()) as { prompt?: string };
  const prompt = body.prompt?.trim();

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
  }

  return NextResponse.json({
    prompt,
    imageUrl: `https://picsum.photos/seed/${encodeURIComponent(prompt)}/1024/1024`,
  });
}
