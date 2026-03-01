import { updateSettings } from "@/components/actions";

export default function SettingsForm({
  settings,
}: {
  settings: { temperature: number; reward_weight: number; risk_weight: number };
}) {
  return (
    <form action={updateSettings} className="max-w-xl space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <h2 className="text-lg font-semibold">Agent Settings</h2>
      <label className="block">
        <span className="mb-1 block text-sm text-zinc-400">temperature (0-1)</span>
        <input name="temperature" type="number" min={0} max={1} step="0.01" defaultValue={settings.temperature} className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-zinc-400">reward_weight</span>
        <input name="reward_weight" type="number" step="0.01" defaultValue={settings.reward_weight} className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-zinc-400">risk_weight</span>
        <input name="risk_weight" type="number" step="0.01" defaultValue={settings.risk_weight} className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2" />
      </label>
      <button className="rounded bg-sky-500 px-4 py-2 font-medium text-zinc-950 hover:bg-sky-400">Save settings</button>
    </form>
  );
}
