import { BanditService, calculateReward } from "./bandit.js";
import { getNextScheduleAt, scheduleState } from "./scheduleState.js";

const DEFAULT_COOLDOWN_MS = 8 * 60 * 60 * 1000;

export const growthState = {
  lastPostedAt: 0,
  cooldownMs: DEFAULT_COOLDOWN_MS,
  bandit: new BanditService(),
};

/**
 * Execute an action selected by the decision-maker.
 * Current actions are intentionally conservative.
 */
export async function executeGrowthAction(client, decision, now = Date.now()) {
  if (!decision || decision.type !== "post") {
    return { posted: false, skipped: true, reason: decision?.reason ?? "no_action" };
  }

  // Defense-in-depth: ensure we never post more frequently than cooldown.
  const elapsedMs = now - growthState.lastPostedAt;
  if (elapsedMs < growthState.cooldownMs) {
    return { posted: false, skipped: true, reason: "cooldown_active" };
  }

  void client;
  growthState.lastPostedAt = now;

  const accountId = decision.meta?.accountId ?? "default-account";
  const autoSchedule = Boolean(decision.meta?.autoSchedule);

  if (!autoSchedule) {
    return { posted: true, skipped: false, reason: decision.reason };
  }

  const selectedHour = growthState.bandit.selectHour(accountId);
  const scheduledAt = getNextScheduleAt(selectedHour, new Date(now));

  const postRecord = {
    id: `${accountId}:${now}`,
    account_id: accountId,
    scheduled_at: scheduledAt.toISOString(),
    hour_slot: selectedHour,
    reward: null,
  };

  scheduleState.posts.push(postRecord);
  scheduleState.scheduleHistory.push({
    account_id: accountId,
    post_id: postRecord.id,
    selected_hour: selectedHour,
    scheduled_at: postRecord.scheduled_at,
    created_at: new Date(now).toISOString(),
  });

  return {
    posted: true,
    skipped: false,
    reason: decision.reason,
    accountId,
    autoSchedule,
    selectedHour,
    scheduledAt: postRecord.scheduled_at,
  };
}

export function handleEngagementFeedback({ accountId, postId, hourSlot, normalizedViews, normalizedLikes, normalizedWatchTime }) {
  const reward = calculateReward({ normalizedViews, normalizedLikes, normalizedWatchTime });

  const post = scheduleState.posts.find((item) => item.id === postId);
  if (post) {
    post.reward = reward;
  }

  growthState.bandit.updateArm(accountId, hourSlot, reward);
  return reward;
}
