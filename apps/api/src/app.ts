import express, { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { getQueues } from '../../../shared/queue';
import { query } from '../../../shared/db';
import { auditLog } from '../../../services/audit/logger';

const connectSchema = z.object({
  accountId: z.string().uuid(),
  code: z.string().min(1)
});

const disconnectSchema = z.object({
  accountId: z.string().uuid()
});

const createPostSchema = z.object({
  accountId: z.string().uuid(),
  caption: z.string().min(1).max(2200),
  videoUrl: z.string().url()
});

const idParamSchema = z.object({ id: z.string().uuid() });

export const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', uptimeSeconds: process.uptime() });
});

app.post('/integrations/tiktok/connect', async (req, res, next) => {
  try {
    const payload = connectSchema.parse(req.body);
    await auditLog(payload.accountId, 'tiktok_connect_requested', { codeReceived: true });
    return res.status(202).json({ message: 'TikTok connect request accepted' });
  } catch (error) {
    return next(error);
  }
});

app.post('/integrations/tiktok/disconnect', async (req, res, next) => {
  try {
    const payload = disconnectSchema.parse(req.body);
    await query('DELETE FROM tiktok_oauth_tokens WHERE account_id = $1', [payload.accountId]);
    await auditLog(payload.accountId, 'tiktok_disconnected', {});
    return res.status(200).json({ message: 'TikTok disconnected' });
  } catch (error) {
    return next(error);
  }
});

app.post('/posts/create', async (req, res, next) => {
  try {
    const payload = createPostSchema.parse(req.body);

    const posts = await query<{ id: string }>(
      `INSERT INTO posts (account_id, caption, video_url, status)
       VALUES ($1, $2, $3, 'created')
       RETURNING id`,
      [payload.accountId, payload.caption, payload.videoUrl]
    );

    const postId = posts[0]?.id;
    if (!postId) {
      throw new Error('Post creation failed');
    }

    try {
      await getQueues().publishPost.add(
        'publish_post',
        { postId, accountId: payload.accountId },
        { attempts: 3, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: true }
      );

      await query(`UPDATE posts SET status = 'queued', updated_at = NOW() WHERE id = $1`, [postId]);
      await auditLog(payload.accountId, 'post_queued', { postId });

      return res.status(202).json({ id: postId, status: 'queued' });
    } catch (queueError) {
      await query(`UPDATE posts SET status = 'failed', updated_at = NOW() WHERE id = $1`, [postId]);
      await auditLog(payload.accountId, 'post_queue_failed', { postId });
      throw queueError;
    }
  } catch (error) {
    return next(error);
  }
});

app.get('/posts/:id', async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const posts = await query(
      'SELECT id, account_id, caption, video_url, status, created_at, updated_at FROM posts WHERE id = $1',
      [id]
    );

    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    return res.status(200).json(posts[0]);
  } catch (error) {
    return next(error);
  }
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof z.ZodError) {
    return res.status(400).json({ error: 'Validation error', details: err.flatten() });
  }

  console.error('Unhandled API error:', err.message);
  return res.status(500).json({ error: 'Internal server error' });
});
