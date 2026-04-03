export type RunItem = {
  id: string;
  input: string;
  winner: string;
  created_at: string;
};

type Props = {
  runs: RunItem[];
};

export function RunCard({ runs }: Props) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">Recent runs</p>
      <div className="mt-3 space-y-3">
        {runs.slice(0, 5).map((run) => (
          <article key={run.id} className="rounded-xl border border-slate-800 p-3">
            <p className="text-sm text-slate-300">{run.input}</p>
            <p className="mt-1 text-xs text-slate-500">Winner: {run.winner}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
