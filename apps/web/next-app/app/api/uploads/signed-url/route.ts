import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';

import { getAuthenticatedUserId } from '@/lib/server/auth';
import { createSignedUploadUrl } from '@/lib/server/lipsync';

export const runtime = 'nodejs';

function sanitizeFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as {
    fileName?: string;
    contentType?: string;
  };

  if (!body.fileName || !body.contentType) {
    return NextResponse.json({ error: 'fileName and contentType are required' }, { status: 400 });
  }

  if (!body.contentType.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image uploads are allowed' }, { status: 400 });
  }

  const objectPath = `users/${userId}/images/${randomUUID()}-${sanitizeFileName(body.fileName)}`;

  const signed = await createSignedUploadUrl({
    bucket: 'images',
    objectPath,
    expiresIn: 60 * 5,
  });

  return NextResponse.json(
    {
      signedUrl: signed.signedUrl,
      token: signed.token,
      path: signed.path,
      expiresIn: 300,
    },
    { status: 200 },
  );
}
