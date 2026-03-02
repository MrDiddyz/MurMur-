import { randomUUID } from "crypto";
import { getDb } from "./db";

export type PostRecord = {
  id: string;
  account_id: string;
  created_at: Date;
  scheduled_at: Date | null;
  priority_score: number;
};

export async function getPostById(postId: string): Promise<PostRecord | null> {
  const { rows } = await getDb().query<PostRecord>(
    "SELECT id, account_id, created_at, scheduled_at, priority_score FROM posts WHERE id = $1",
    [postId],
  );
  return rows[0] ?? null;
}

export async function countPostsInHour(accountId: string, hourStart: Date): Promise<number> {
  const hourEnd = new Date(hourStart);
  hourEnd.setHours(hourEnd.getHours() + 1);

  const { rows } = await getDb().query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM posts
     WHERE account_id = $1 AND scheduled_at >= $2 AND scheduled_at < $3`,
    [accountId, hourStart, hourEnd],
  );
  return Number(rows[0]?.count ?? "0");
}

export async function updatePostSchedule(input: {
  postId: string;
  scheduledAt: Date;
  priorityScore: number;
  autoSchedule: boolean;
  reason: string;
}): Promise<void> {
  await getDb().query(
    `UPDATE posts
     SET scheduled_at = $2, priority_score = $3, auto_schedule = $4
     WHERE id = $1`,
    [input.postId, input.scheduledAt, input.priorityScore, input.autoSchedule],
  );

  await getDb().query(
    `INSERT INTO schedule_history(id, post_id, previous_time, new_time, reason)
     VALUES($1, $2,
       (SELECT scheduled_at FROM posts WHERE id = $2),
       $3,
       $4)`,
    [randomUUID(), input.postId, input.scheduledAt, input.reason],
  );
}

export async function markPostQueued(postId: string): Promise<void> {
  await getDb().query("UPDATE posts SET status='queued' WHERE id=$1", [postId]);
}

export async function markPostPublished(postId: string): Promise<void> {
  await getDb().query("UPDATE posts SET status='published', published_at=NOW() WHERE id=$1", [postId]);
}

export async function upsertEngagementPlaceholder(postId: string): Promise<void> {
  await getDb().query(
    `INSERT INTO post_engagement(post_id, likes, comments, shares, score, updated_at)
     VALUES ($1, 0, 0, 0, 0, NOW())
     ON CONFLICT (post_id)
     DO UPDATE SET updated_at = EXCLUDED.updated_at`,
    [postId],
  );
}
