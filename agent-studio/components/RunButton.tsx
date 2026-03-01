import { runScenario } from "@/components/actions";

export default function RunButton({ scenarioId }: { scenarioId: string }) {
  return (
    <form action={runScenario}>
      <input type="hidden" name="scenario_id" value={scenarioId} />
      <button className="rounded bg-emerald-500 px-3 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400">
        Kjør run
      </button>
    </form>
  );
}
