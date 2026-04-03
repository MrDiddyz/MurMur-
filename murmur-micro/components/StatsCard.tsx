export type StatItem = {
  agent: string;
  wins: number;
  weight: number;
};

type Props = {
  stats: StatItem[];
};

export function StatsCard({ stats }: Props) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">Agent memory</p>
      <div className="mt-3 space-y-2">
        {stats.map((stat) => (
          <div key={stat.agent} className="flex items-center justify-between rounded-lg border border-slate-800 px-3 py-2 text-sm">
            <span>{stat.agent}</span>
            <span className="text-slate-400">wins {stat.wins} · w {stat.weight.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
