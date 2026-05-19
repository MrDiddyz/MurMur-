import { mockIssues, mockScores, mockScanInput } from "@/lib/opportunity-scanner";

export default function OpportunityReportPage() {
  const topLeaks = mockIssues.filter((issue) => issue.severity === "High").slice(0, 5);

  return (
    <div className="space-y-5 rounded-xl border border-amber-700/50 bg-gradient-to-b from-black via-zinc-950 to-black p-6">
      <header className="border-b border-amber-700/40 pb-4">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-400">MurMur Premium Intelligence Report</p>
        <h1 className="mt-2 text-3xl font-bold text-amber-200">Opportunity Report</h1>
        <p className="mt-1 text-sm text-zinc-300">Business: {mockScanInput.businessName} · Location: {mockScanInput.location}</p>
      </header>

      <section>
        <h2 className="text-lg font-semibold text-amber-200">Executive summary</h2>
        <p className="mt-2 text-sm text-zinc-300">
          Opportunity Score is {mockScores.opportunity}/100. Current digital presence shows strong upside by fixing conversion and trust leaks before scaling paid acquisition.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-amber-200">Top 5 leaks</h2>
        <ul className="mt-2 space-y-2 text-sm text-zinc-200">
          {topLeaks.map((issue) => (
            <li key={issue.id} className="rounded border border-zinc-700 bg-zinc-900/80 p-3">
              <strong className="text-amber-300">{issue.issue}</strong>: {issue.revenueImpact}
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded border border-zinc-700 bg-zinc-900/80 p-4">
          <h3 className="text-base font-semibold text-amber-200">Quick wins</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-300">
            <li>Install clear above-the-fold CTA and sticky mobile booking button.</li>
            <li>Deploy schema markup for LocalBusiness, FAQ, and review snippets.</li>
            <li>Launch review request sequence after each completed appointment.</li>
          </ul>
        </article>
        <article className="rounded border border-zinc-700 bg-zinc-900/80 p-4">
          <h3 className="text-base font-semibold text-amber-200">30-day action plan</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-300">
            <li>Week 1: Conversion and trust signal fixes.</li>
            <li>Week 2: Technical SEO, speed, and mobile UX improvements.</li>
            <li>Week 3: Content + review growth workflows.</li>
            <li>Week 4: Reporting, optimization, and offer handoff.</li>
          </ul>
        </article>
      </section>

      <section className="rounded border border-amber-700/40 bg-black/60 p-4">
        <h3 className="text-base font-semibold text-amber-200">Suggested monthly offer</h3>
        <p className="mt-2 text-sm text-zinc-300">
          "Local Growth Operator" — NOK 19,000/month for conversion fixes, SEO fundamentals, review acceleration, and monthly intelligence reporting.
        </p>
      </section>
    </div>
  );
}
