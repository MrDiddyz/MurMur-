import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '@/lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { workId, isPublished } = req.body ?? {};

  if (!workId || typeof isPublished !== 'boolean') {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const { error } = await supabaseAdmin
    .from('works')
    .update({ is_published: isPublished })
    .eq('id', workId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
}
