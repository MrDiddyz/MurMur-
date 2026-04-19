const DEFAULT_COOLDOWN_MS = 8 * 60 * 60 * 1000;

export const growthState = {
  lastPostedAt: 0,
  cooldownMs: DEFAULT_COOLDOWN_MS,
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

  // Placeholder for future posting logic. Keep behavior safe and non-invasive.
  void client;
  growthState.lastPostedAt = now;

  return { posted: true, skipped: false, reason: decision.reason };
}
