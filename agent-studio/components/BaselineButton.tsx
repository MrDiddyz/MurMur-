import { saveBaseline } from "@/components/actions";

export default function BaselineButton({ scenarioId }: { scenarioId: string }) {
  return (
    <form action={saveBaseline}>
      <input type="hidden" name="scenario_id" value={scenarioId} />
      <button className="rounded bg-violet-500 px-3 py-2 text-sm font-medium text-zinc-950 hover:bg-violet-400">
        Save baseline
      </button>
    </form>
  );
}
