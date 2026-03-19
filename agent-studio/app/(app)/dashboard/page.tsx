import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMyWorkspaceId } from "@/lib/workspace";

export default async function DashboardPage() {
  const workspaceId = await getMyWorkspaceId();
  const supabase = createServerSupabaseClient();

  const { data: scenarios } = await supabase
    .from("scenarios")
    .select("id, title, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: runs } = await supabase
    .from("scenario_runs")
    .select("id, scenario_id, score, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h1 className="mb-3 text-xl font-semibold">Siste scenarier</h1>
        <ul className="space-y-2 text-sm">
          {scenarios?.map((s: any) => (
            <li key={s.id}>
              <a href={`/scenarios/${s.id}`} className="font-medium">{s.title}</a>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="mb-3 text-xl font-semibold">Siste runs</h2>
        <ul className="space-y-2 text-sm">
          {runs?.map((r: any) => (
            <li key={r.id}>
              <a href={`/scenarios/${r.scenario_id}`}>Run {r.id.slice(0, 8)} → score {r.score}</a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
