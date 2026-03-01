import { runGrowthCycle } from "./runCycle.js";

const GROWTH_INTERVAL_MS = 60 * 60 * 1000; // evaluate hourly

let growthTimer = null;
let isCycleRunning = false;

export function startGrowthScheduler(client) {
  if (growthTimer) {
    return growthTimer;
  }

  const tick = async () => {
    if (isCycleRunning) {
      return;
    }

    isCycleRunning = true;
    try {
      await runGrowthCycle(client);
    } catch (error) {
      console.error("[growth] cycle failed", error);
    } finally {
      isCycleRunning = false;
    }
  };

  // Run once at startup, then hourly.
  void tick();
  growthTimer = setInterval(() => {
    void tick();
  }, GROWTH_INTERVAL_MS);

  // Do not keep Node process alive just for this timer.
  growthTimer.unref?.();

  return growthTimer;
}

export function stopGrowthScheduler() {
  if (!growthTimer) {
    return;
  }

  clearInterval(growthTimer);
  growthTimer = null;
}
