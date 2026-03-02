import { decideGrowthAction } from "./decisionMaker.js";
import { executeGrowthAction, growthState } from "./actions.js";

/**
 * Runs one growth loop cycle.
 */
export async function runGrowthCycle(client, metrics = {}) {
  const now = Date.now();
  const decision = decideGrowthAction({
    metrics: {
      ...metrics,
      cooldownMs: growthState.cooldownMs,
    },
    lastPostedAt: growthState.lastPostedAt,
    now,
  });

  if (decision?.type === "post") {
    decision.meta = {
      ...(decision.meta ?? {}),
      autoSchedule: Boolean(metrics.auto_schedule),
      accountId: metrics.account_id ?? "default-account",
    };
  }

  return executeGrowthAction(client, decision, now);
}
