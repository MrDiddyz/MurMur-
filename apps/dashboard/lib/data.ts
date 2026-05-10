import {
  getABWinners,
  getHookPerformance,
  getRecentGenerations,
  getTopVideos,
  getVariationPerformance
} from "@murmur/db";

export async function loadDashboardData() {
  try {
    const [topVideos, recentGenerations, hookPerformance, variationPerformance, abWinners] = await Promise.all([
      getTopVideos(8),
      getRecentGenerations(10),
      getHookPerformance(),
      getVariationPerformance(),
      getABWinners(10)
    ]);

    return { topVideos, recentGenerations, hookPerformance, variationPerformance, abWinners, source: "supabase" as const };
  } catch {
    return {
      source: "fallback" as const,
      topVideos: [],
      recentGenerations: [],
      hookPerformance: [],
      variationPerformance: [],
      abWinners: []
    };
  }
}
