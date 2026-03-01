import BaselineButton from "@/components/BaselineButton";
import RunButton from "@/components/RunButton";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function ScenarioDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();

  const { data: scenario } = await supabase
    .from("scenarios")
    .select("id, title, description, complexity, risk")
    .eq("id", params.id)
    .single();

  if (!scenario) notFound();

  const { data: runs } = await supabase
    .from("scenario_runs")
    .select("id, score, proposals, created_at")
    .eq("scenario_id", params.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h1 className="text-2xl font-semibold">{scenario.title}</h1>
        <p className="mt-2 text-zinc-400">{scenario.description}</p>
        <p className="mt-2 text-sm text-zinc-500">complexity {scenario.complexity} • risk {scenario.risk}</p>
        <div className="mt-4 flex gap-3">
          <RunButton scenarioId={scenario.id} />
          <BaselineButton scenarioId={scenario.id} />
        </div>
      </section>

      <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="mb-3 text-xl font-semibold">Siste 10 runs</h2>
        <div className="space-y-3">
          {runs?.map((run: any) => (
            <article key={run.id} className="rounded border border-zinc-800 p-3">
              <p className="mb-2 text-sm text-zinc-400">Run {run.id.slice(0, 8)} • score {run.score}</p>
              <div className="grid gap-2 md:grid-cols-3">
                {Array.isArray(run.proposals) &&
                  run.proposals.map((proposal: any, idx: number) => (
                    <div key={idx} className="rounded border border-zinc-700 bg-zinc-950 p-2 text-sm">
                      <p className="font-medium">{proposal.title}</p>
                      <p className="text-zinc-400">{proposal.rationale}</p>
                      <p className="text-zinc-300">impact {proposal.impact}</p>
                    </div>
                  ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
