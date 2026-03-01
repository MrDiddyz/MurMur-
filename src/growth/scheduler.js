import cron from "node-cron";
import { runGrowthCycle } from "./runCycle.js";

export function startGrowthScheduler(client) {
  cron.schedule("5 * * * *", async () => {
    try {
      console.log("🚀 Running growth cycle...");
      await runGrowthCycle(client);
    } catch (err) {
      console.error("Growth cycle error:", err);
    }
  });
}
