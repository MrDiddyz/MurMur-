import { getDb } from "./db";
import { upsertEngagementPlaceholder } from "./repository";

export async function applyAdaptiveFeedback(postId: string): Promise<void> {
  await upsertEngagementPlaceholder(postId);
  await getDb().query(
    `UPDATE posts
     SET priority_score = LEAST(priority_score + 0.25, 100)
     WHERE id = $1`,
    [postId],
  );
}
