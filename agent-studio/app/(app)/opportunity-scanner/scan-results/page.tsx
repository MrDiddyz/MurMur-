import { mockIssues } from "@/lib/opportunity-scanner";

export default function ScanResultsPage() {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <h1 className="text-2xl font-semibold text-amber-200">Scan Results</h1>
      <p className="mt-1 text-sm text-zinc-300">Detailed issue matrix generated from demo scan data.</p>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-zinc-400">
            <tr>
              <th className="px-3 py-2">Issue</th>
              <th className="px-3 py-2">Severity</th>
              <th className="px-3 py-2">Revenue impact</th>
              <th className="px-3 py-2">Fix difficulty</th>
              <th className="px-3 py-2">Confidence</th>
              <th className="px-3 py-2">Suggested action</th>
              <th className="px-3 py-2">Sales angle</th>
            </tr>
          </thead>
          <tbody>
            {mockIssues.map((issue) => (
              <tr key={issue.id} className="border-t border-zinc-800 align-top">
                <td className="px-3 py-3 text-zinc-100">{issue.issue}</td>
                <td className="px-3 py-3 text-amber-300">{issue.severity}</td>
                <td className="px-3 py-3 text-zinc-300">{issue.revenueImpact}</td>
                <td className="px-3 py-3 text-zinc-300">{issue.fixDifficulty}</td>
                <td className="px-3 py-3 text-zinc-300">{issue.confidenceScore}%</td>
                <td className="px-3 py-3 text-zinc-300">{issue.suggestedAction}</td>
                <td className="px-3 py-3 text-zinc-300">{issue.salesAngle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
