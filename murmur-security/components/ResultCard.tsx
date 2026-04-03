import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import type { AnalysisResult } from "@/types";

interface ResultCardProps {
  result: AnalysisResult;
  onCopy: () => void;
}

export function ResultCard({ result, onCopy }: ResultCardProps) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">Latest Analysis</h2>
        <Badge risk={result.risk} />
      </div>
      <p className="mb-3 text-2xl font-bold text-gold">{result.score}/100</p>
      <div className="space-y-3 text-sm">
        <div>
          <p className="mb-1 font-medium text-zinc-300">Matched red flags</p>
          {result.triggers.length === 0 ? (
            <p className="text-muted">No direct matches from current rules.</p>
          ) : (
            <ul className="list-disc space-y-1 pl-5 text-zinc-200">
              {result.triggers.map((trigger) => (
                <li key={trigger}>{trigger}</li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="mb-1 font-medium text-zinc-300">Reasoning</p>
          <p className="text-zinc-200">{result.reasoning}</p>
        </div>
        <div>
          <p className="mb-1 font-medium text-zinc-300">Recommended action</p>
          <p className="text-zinc-200">{result.recommendation}</p>
        </div>
      </div>
      <button
        onClick={onCopy}
        className="mt-4 rounded-xl border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:border-goldSoft"
      >
        Copy summary
      </button>
    </Card>
  );
}
