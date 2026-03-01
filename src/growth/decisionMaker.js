const MIN_ENGAGEMENT_TO_POST = 3;
const DEFAULT_COOLDOWN_MS = 8 * 60 * 60 * 1000;

function toFiniteNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Decide whether a growth action should run for this cycle.
 * Conservative default: skip unless signal is clear.
 */
export function decideGrowthAction({ metrics = {}, lastPostedAt = 0, now = Date.now() } = {}) {
  const engagement = Math.max(0, toFiniteNumber(metrics.engagement, 0));
  const cooldownMs = Math.max(0, toFiniteNumber(metrics.cooldownMs, DEFAULT_COOLDOWN_MS));
  const postedAt = Math.max(0, toFiniteNumber(lastPostedAt, 0));
  const currentTime = Math.max(0, toFiniteNumber(now, Date.now()));

  const elapsedMs = currentTime - postedAt;
  const isCoolingDown = elapsedMs < cooldownMs;

  if (isCoolingDown) {
    return {
      type: "skip",
      reason: "cooldown_active",
      meta: {
        elapsedMs,
        remainingCooldownMs: cooldownMs - elapsedMs,
      },
    };
  }

  if (engagement < MIN_ENGAGEMENT_TO_POST) {
    return {
      type: "skip",
      reason: "insufficient_signal",
      meta: {
        engagement,
        minEngagementToPost: MIN_ENGAGEMENT_TO_POST,
      },
    };
  }

  return {
    type: "post",
    reason: "engagement_signal",
    meta: {
      engagement,
      minEngagementToPost: MIN_ENGAGEMENT_TO_POST,
    },
  };
}
