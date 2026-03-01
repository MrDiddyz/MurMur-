import { startGrowthScheduler } from "./growth/scheduler.js";

export function wireClientReady(client, { startHourlyAggregator } = {}) {
  if (!client || typeof client.once !== "function") {
    throw new Error("wireClientReady requires a Discord client-like object with once()");
  }

  client.once("ready", () => {
    if (typeof startHourlyAggregator === "function") {
      startHourlyAggregator();
    }

    startGrowthScheduler(client);
  });
}
