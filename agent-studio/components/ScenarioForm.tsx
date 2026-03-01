import { createScenario } from "@/components/actions";

export default function ScenarioForm() {
  return (
    <form action={createScenario} className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <h2 className="text-lg font-semibold">Nytt scenario</h2>
      <input name="title" required placeholder="Tittel" className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2" />
      <textarea name="description" placeholder="Beskrivelse" className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2" />
      <div className="grid grid-cols-2 gap-3">
        <input name="complexity" type="number" step="0.1" defaultValue={5} className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2" />
        <input name="risk" type="number" step="0.1" defaultValue={3} className="rounded border border-zinc-700 bg-zinc-950 px-3 py-2" />
      </div>
      <button className="rounded bg-sky-500 px-4 py-2 font-medium text-zinc-950 hover:bg-sky-400">Opprett scenario</button>
    </form>
  );
}
