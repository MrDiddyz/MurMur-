import test from "node:test";
import assert from "node:assert/strict";

import { BanditService, InMemoryBanditStore } from "../bandit.js";

test("updateArm increments alpha/beta/trials/reward", () => {
  const service = new BanditService(new InMemoryBanditStore());
  const updated = service.updateArm("acct-1", 5, 0.8);

  assert.equal(updated.alpha, 1.8);
  assert.equal(updated.beta, 1.2);
  assert.equal(updated.total_trials, 1);
  assert.equal(updated.total_reward, 0.8);
});

test("exploration fallback chooses under-explored arms uniformly", () => {
  const service = new BanditService(new InMemoryBanditStore());
  const arms = service.getArms("acct-2");

  for (const arm of arms) {
    if (arm.hour_slot !== 3) {
      arm.total_trials = 5;
    }
  }

  const selected = service.selectHour("acct-2", () => 0.5);
  assert.equal(selected, 3);
});

test("thompson sampling chooses arm with highest sampled reward", () => {
  const service = new BanditService(new InMemoryBanditStore());
  const arms = service.getArms("acct-3");

  for (const arm of arms) {
    arm.total_trials = 5;
    arm.alpha = 1;
    arm.beta = 1;
  }

  arms[10].alpha = 500;
  arms[10].beta = 1;

  const wins = Array.from({ length: 200 }, () => service.selectHour("acct-3")).filter((hour) => hour === 10).length;
  assert.ok(wins >= 150, `expected hour 10 to dominate samples, got ${wins}`);
});
