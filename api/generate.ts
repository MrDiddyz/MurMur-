import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, kind } = req.body ?? {};

  if (!prompt || (kind !== 'image' && kind !== 'music')) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  return res.status(200).json({
    id: crypto.randomUUID(),
    prompt,
    kind,
    status: 'queued',
    message: 'Generation request accepted. Connect provider in /api/generate.ts.'
  });
}
