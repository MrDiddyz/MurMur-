"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { MessageTextarea } from "@/components/MessageTextarea";
import { ResultCard } from "@/components/ResultCard";
import { analyzeMessage } from "@/lib/analyze";
import { saveScanEntry } from "@/lib/storage";
import type { AnalysisResult, ScanEntry } from "@/types";

const sampleMessages = [
  "URGENT: Your bank account is suspended. Click here to verify now: http://example-secure-check.com",
  "Dear customer, unpaid toll detected. Reply YES to avoid penalties.",
  "Hi, this is Alex. Can you send the OTP code I just texted to you?",
];

const formatSummary = (result: AnalysisResult): string =>
  `MurMur Security Scan\nRisk: ${result.risk}\nScore: ${result.score}/100\nTriggers: ${
    result.triggers.length ? result.triggers.join(", ") : "None"
  }\nRecommendation: ${result.recommendation}`;

export default function HomePage() {
  const [message, setMessage] = useState<string>("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const trimmed = useMemo(() => message.trim(), [message]);

  const handleAnalyze = () => {
    const next = analyzeMessage(trimmed);
    setResult(next);

    if (trimmed) {
      const entry: ScanEntry = {
        id: crypto.randomUUID(),
        text: trimmed,
        createdAt: new Date().toISOString(),
        result: next,
      };
      saveScanEntry(entry);
    }
  };

  const handleCopy = async () => {
    if (!result || typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(formatSummary(result));
    } catch {
      // noop: clipboard access may be blocked by browser policy
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-zinc-300">Paste suspicious text below</p>
          <span className="text-xs text-zinc-500">Offline-first</span>
        </div>
        <MessageTextarea value={message} onChange={setMessage} />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button onClick={handleAnalyze} disabled={!trimmed}>
            Analyze
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setMessage("");
              setResult(null);
            }}
          >
            Clear
          </Button>
        </div>
      </Card>

      {result && <ResultCard result={result} onCopy={handleCopy} />}

      <Card>
        <h2 className="mb-2 text-sm font-semibold text-zinc-200">Try sample suspicious messages</h2>
        <ul className="space-y-2 text-xs text-zinc-400">
          {sampleMessages.map((sample) => (
            <li key={sample}>
              <button className="text-left leading-5 hover:text-zinc-200" onClick={() => setMessage(sample)}>
                {sample}
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
