import ScenarioForm from "@/components/ScenarioForm";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMyWorkspaceId } from "@/lib/workspace";

export default async function ScenariosPage() {
  const workspaceId = await getMyWorkspaceId();
  const supabase = createServerSupabaseClient();

  const { data: scenarios } = await supabase
    .from("scenarios")
    .select("id, title, description, complexity, risk, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  return (
    <div className="grid gap-6 md:grid-cols-[1fr,360px]">
      <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h1 className="mb-4 text-xl font-semibold">Scenarier</h1>
        <ul className="space-y-3">
          {scenarios?.map((s: any) => (
            <li key={s.id} className="rounded border border-zinc-800 p-3">
              <a href={`/scenarios/${s.id}`} className="text-lg font-medium">{s.title}</a>
              <p className="text-sm text-zinc-400">{s.description}</p>
              <p className="text-xs text-zinc-500">complexity {s.complexity} • risk {s.risk}</p>
            </li>
          ))}
        </ul>
      </section>
      <ScenarioForm />
    </div>
  );
}
