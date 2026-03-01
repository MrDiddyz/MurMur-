export function decideAction({ lastHour, last24h, lastActionAt, now }) {
  const minHoursBetweenPosts = 8;
  const hoursSinceLastAction = lastActionAt
    ? (now.getTime() - new Date(lastActionAt).getTime()) / 3_600_000
    : Infinity;

  const tooSoon = hoursSinceLastAction < minHoursBetweenPosts;

  const lowActivity = lastHour.messages < 40;
  const healthyActivity = lastHour.messages >= 120;

  const slowDay = last24h.messages < 800;
  const manyNewMembers = last24h.newMembers >= 3;

  if (tooSoon) return { type: "NO_ACTION", reason: "cooldown_active" };
  if (manyNewMembers) return { type: "WELCOME_PROMPT", reason: "new_members_high" };
  if (lowActivity && slowDay) return { type: "ENGAGEMENT_QUESTION", reason: "low_activity" };
  if (healthyActivity) return { type: "NO_ACTION", reason: "activity_healthy" };

  return { type: "SOFT_CHECKIN", reason: "default" };
}
