import { NextResponse } from 'next/server';

type GenerateRequestBody = {
  prompt?: unknown;
};

const IMAGE_COUNT = 4;
const IMAGE_WIDTH = 512;
const IMAGE_HEIGHT = 512;

export async function POST(request: Request) {
  let body: GenerateRequestBody;

  try {
    body = (await request.json()) as GenerateRequestBody;
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body.' },
      { status: 400 }
    );
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';

  if (!prompt) {
    return NextResponse.json(
      { error: 'Prompt is required and must be a non-empty string.' },
      { status: 400 }
    );
  }

  const images = Array.from({ length: IMAGE_COUNT }, (_, index) => {
    const seed = encodeURIComponent(`${prompt}-${index + 1}`);
    return `https://picsum.photos/seed/${seed}/${IMAGE_WIDTH}/${IMAGE_HEIGHT}`;
  });

  return NextResponse.json({ images }, { status: 200 });
}
