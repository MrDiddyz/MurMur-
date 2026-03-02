import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { enforceHourlyRateLimit, optimizeScheduleTime } from "../src/lib/scheduler/scheduler.ts";
import { getPublishDelayMs } from "../src/lib/scheduler/delayedJob.ts";

describe("scheduler", () => {
  it("schedule calculation prefers 18:00-21:00 and spreads minutes", () => {
    const now = new Date("2026-03-02T10:00:00Z");
    const result = optimizeScheduleTime({
      now,
      existingInHourCount: 2,
      accountHourlyCount: 1,
      post: {
        id: "p1",
        accountId: "a1",
        createdAt: new Date("2026-03-01T10:00:00Z"),
      },
    });

    assert.equal(result.scheduledAt.getUTCHours(), 18);
    assert.equal(result.scheduledAt.getUTCMinutes(), 24);
  });

  it("delayed job delay never returns negative", () => {
    const now = new Date("2026-03-02T10:00:00Z");
    assert.equal(getPublishDelayMs(new Date("2026-03-02T10:30:00Z"), now), 30 * 60 * 1000);
    assert.equal(getPublishDelayMs(new Date("2026-03-02T09:30:00Z"), now), 0);
  });

  it("rate limit shifts to next hour when account has >=5 posts", () => {
    const slot = new Date("2026-03-02T18:00:00Z");
    const shifted = enforceHourlyRateLimit(slot, 5);
    assert.equal(shifted.getUTCHours(), 19);
    assert.equal(shifted.getUTCMinutes(), 0);
  });
});
