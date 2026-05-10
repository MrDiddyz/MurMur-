import { DataTable } from "../components/DataTable";
import { loadDashboardData } from "../lib/data";

export default async function DashboardPage() {
  const data = await loadDashboardData();

  return (
    <main>
      <h1>MurMur Auto Bot v0.4</h1>
      <p>
        Engine state: <span className="badge">{data.source === "supabase" ? "Live Supabase" : "Fallback mode"}</span>
      </p>

      <div className="grid">
        <DataTable
          title="Top Videos by Score"
          columns={["Video ID", "Topic", "Variation", "Score"]}
          rows={data.topVideos.map((video) => [video.id.slice(0, 8), video.topic, video.variation_label, video.score])}
        />

        <DataTable
          title="Recent Generations"
          columns={["Created", "Hook", "Status", "Score"]}
          rows={data.recentGenerations.map((video) => [new Date(video.created_at).toLocaleDateString(), video.hook, video.status, video.score])}
        />

        <DataTable
          title="Hook Performance"
          columns={["Hook", "Avg Score", "Videos"]}
          rows={data.hookPerformance.map((row: any) => [row.hook, Number(row.avg_score).toFixed(2), row.total_videos])}
        />

        <DataTable
          title="Variation Performance"
          columns={["Variation", "Avg Score", "Videos"]}
          rows={data.variationPerformance.map((row: any) => [row.variation_label, Number(row.avg_score).toFixed(2), row.total_videos])}
        />

        <DataTable
          title="A/B Winners"
          columns={["Test Date", "Winner", "Reason"]}
          rows={data.abWinners.map((ab) => [ab.test_date, ab.winner_video_id?.slice(0, 8), ab.winning_reason])}
        />
      </div>
    </main>
  );
}
