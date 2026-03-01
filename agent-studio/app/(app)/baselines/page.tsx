import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMyWorkspaceId } from "@/lib/workspace";

export default async function BaselinesPage() {
  const workspaceId = await getMyWorkspaceId();
  const supabase = createServerSupabaseClient();

  const { data: baselines } = await supabase
    .from("baselines")
    .select("id, snapshot, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <h1 className="mb-4 text-xl font-semibold">Baselines</h1>
      <ul className="space-y-3 text-sm">
        {baselines?.map((baseline: any) => (
          <li key={baseline.id} className="rounded border border-zinc-800 p-3">
            <p className="font-medium">Baseline {baseline.id.slice(0, 8)}</p>
            <p className="text-zinc-400">{JSON.stringify(baseline.snapshot).slice(0, 180)}...</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
