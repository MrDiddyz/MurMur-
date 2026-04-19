import type { AgentName } from "@/lib/agents";

type Props = {
  winner?: AgentName;
  output?: string;
};

export function WinnerCard({ winner, output }: Props) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">Winner</p>
      <h2 className="mt-1 text-lg font-semibold">{winner ?? "No run yet"}</h2>
      <p className="mt-2 text-sm text-slate-300">{output ?? "Run the council to pick a winner."}</p>
    </section>
  );
}
