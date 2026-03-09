import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { workId } = req.body ?? {};

  if (!workId) {
    return res.status(400).json({ error: 'workId is required' });
  }

  return res.status(200).json({
    checkoutUrl: `https://example-payments-provider.dev/checkout/${workId}`,
    message: 'Replace with your payment provider integration.'
  });
}
