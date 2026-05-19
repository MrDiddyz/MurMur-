import { mockIssues, mockScores } from "@/lib/opportunity-scanner";

function ScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-amber-700/40 bg-gradient-to-b from-zinc-900 to-zinc-950 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-amber-300">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-amber-200">{value}</p>
    </div>
  );
}

export default function OpportunityScannerDashboardPage() {
  const highSeverity = mockIssues.filter((issue) => issue.severity === "High").length;

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-amber-700/40 bg-gradient-to-r from-black via-zinc-900 to-black p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-400">MurMur Intelligence</p>
        <h1 className="mt-2 text-3xl font-bold text-amber-200">Opportunity Scanner Dashboard</h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-300">
          Visible Weakness → Paid Opportunity. Identify revenue leaks across SEO, trust, speed, content, and conversion surfaces using demo intelligence data.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <ScoreCard label="Visibility Score" value={mockScores.visibility} />
        <ScoreCard label="Trust Score" value={mockScores.trust} />
        <ScoreCard label="Conversion Score" value={mockScores.conversion} />
        <ScoreCard label="Opportunity Score" value={mockScores.opportunity} />
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-5">
        <h2 className="text-lg font-semibold text-amber-200">Live Opportunity Signals</h2>
        <p className="mt-1 text-sm text-zinc-300">
          {highSeverity} high-severity leaks detected. Prioritize fixes with easy implementation and high confidence first.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {mockIssues.slice(0, 6).map((issue) => (
            <article key={issue.id} className="rounded-lg border border-zinc-700 bg-zinc-950 p-3">
              <p className="text-sm font-medium text-zinc-100">{issue.issue}</p>
              <p className="mt-1 text-xs text-zinc-400">Severity: <span className="text-amber-300">{issue.severity}</span></p>
              <p className="mt-1 text-xs text-zinc-400">Confidence: <span className="text-amber-300">{issue.confidenceScore}%</span></p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
