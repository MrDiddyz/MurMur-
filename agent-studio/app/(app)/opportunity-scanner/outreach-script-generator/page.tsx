import { mockIssues, mockScanInput } from "@/lib/opportunity-scanner";

export default function OutreachScriptGeneratorPage() {
  const topIssue = mockIssues[0];

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <h1 className="text-2xl font-semibold text-amber-200">Outreach Script Generator</h1>
      <p className="mt-1 text-sm text-zinc-300">Cold DM / email script generated from demo scan signals.</p>

      <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-950 p-4 text-sm text-zinc-200">
        <p>Hi {mockScanInput.businessName} team,</p>
        <p className="mt-2">
          I ran a quick visibility scan of your digital presence and found one major growth leak: <strong className="text-amber-300">{topIssue.issue}</strong>.
          This often causes hidden revenue loss because {topIssue.revenueImpact.toLowerCase()}
        </p>
        <p className="mt-2">
          We typically fix this in under 30 days through a focused sprint: {topIssue.suggestedAction}
        </p>
        <p className="mt-2">
          If useful, I can send a one-page breakdown showing "Visible Weakness → Paid Opportunity" for {mockScanInput.industry.toLowerCase()} businesses in {mockScanInput.location}.
        </p>
        <p className="mt-3">Open to me sending it over?</p>
      </div>
    </section>
  );
}
