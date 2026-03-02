import { decideGrowthAction } from "./decisionMaker.js";
import { executeGrowthAction, growthState } from "./actions.js";
import { observeHourOutcome, selectHour } from "./hourSelection.js";

const previousTransitionByAccount = new Map();

/**
 * Runs one growth loop cycle.
 */
export async function runGrowthCycle(client, metrics = {}) {
  const now = Date.now();
  const accountId = metrics.accountId ?? "default";
  const state = Array.isArray(metrics.stateVector) && metrics.stateVector.length > 0
    ? metrics.stateVector
    : [Number(metrics.engagement ?? 0), Number((now / (60 * 60 * 1000)) % 24)];

  const selectedHour = await selectHour({ accountId, state });
  const decision = decideGrowthAction({
    metrics: {
      ...metrics,
      cooldownMs: growthState.cooldownMs,
      selectedHour,
    },
    lastPostedAt: growthState.lastPostedAt,
    now,
  });

  const actionResult = await executeGrowthAction(client, decision, now);

  const reward = Number(metrics.reward ?? metrics.engagement ?? 0);
  const prev = previousTransitionByAccount.get(accountId);
  if (prev) {
    await observeHourOutcome({
      accountId,
      state: prev.state,
      action: prev.action,
      reward,
      nextState: state,
      done: Boolean(metrics.done),
    });
  }

  previousTransitionByAccount.set(accountId, { state, action: selectedHour });

  return {
    ...actionResult,
    selectedHour,
    scheduler: process.env.ML_ENABLED === "true" ? "dqn" : "bandit",
  };
}
