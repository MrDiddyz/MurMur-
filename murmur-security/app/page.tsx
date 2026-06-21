'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { analyzeMessage, AnalysisResult, RiskLevel } from '@/lib/analyzer';

interface HistoryItem {
  id: string;
  message: string;
  createdAt: string;
  result: AnalysisResult;
}

const STORAGE_KEY = 'murmur-security-history-v1';

const riskStyles: Record<RiskLevel, string> = {
  low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  medium: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  high: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
};

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function HomePage() {
  const [message, setMessage] = useState('');
  const [current, setCurrent] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as HistoryItem[];
      if (Array.isArray(parsed)) {
        setHistory(parsed);
      }
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // ignore storage errors (private mode/full quota)
    }
  }, [history]);

  const stats = useMemo(() => {
    return history.reduce(
      (acc, item) => {
        acc[item.result.riskLevel] += 1;
        return acc;
      },
      { low: 0, medium: 0, high: 0 } as Record<RiskLevel, number>
    );
  }, [history]);

  const onSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const normalized = message.trim();
      const result = analyzeMessage(normalized);
      setCurrent(result);

      if (!normalized) return;

      const item: HistoryItem = {
        id: createId(),
        message: normalized,
        createdAt: new Date().toISOString(),
        result
      };

      setHistory((prev) => [item, ...prev].slice(0, 25));
    },
    [message]
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 px-4 py-6">
      <header className="card">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">MurMur Security</p>
        <h1 className="mt-2 text-2xl font-semibold">Scam Message Analyzer</h1>
        <p className="mt-2 text-sm text-slate-300">
          Paste suspicious SMS, chat, or email text. MurMur scores scam risk and stores results on your device.
        </p>
      </header>

      <section className="card">
        <form className="space-y-3" onSubmit={onSubmit}>
          <label htmlFor="message" className="text-sm font-medium text-slate-200">
            Message content
          </label>
          <textarea
            id="message"
            className="input min-h-36"
            placeholder="Example: Your account is suspended. Click http://... to verify now."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{message.length} chars</span>
            <button
              type="button"
              className="underline"
              onClick={() => {
                setMessage('');
                setCurrent(null);
              }}
            >
              Reset input
            </button>
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-cyan-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Analyze message
          </button>
        </form>
      </section>

      {current && (
        <section className="card space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Analysis result</h2>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${riskStyles[current.riskLevel]}`}>
              {current.riskLevel} risk · {current.score}/100
            </span>
          </div>
          <p className="text-sm text-slate-200">{current.summary}</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
            {current.flags.length > 0 ? (
              current.flags.map((flag) => <li key={flag}>{flag}</li>)
            ) : (
              <li>No specific scam indicators detected.</li>
            )}
          </ul>
          <h3 className="text-sm font-semibold text-cyan-300">Recommended next actions</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
            {current.advice.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Local history</h2>
          {history.length > 0 && (
            <button
              type="button"
              className="text-xs text-slate-300 underline"
              onClick={() => setHistory([])}
            >
              Clear
            </button>
          )}
        </div>
        <div className="mb-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2 py-1">Low: {stats.low}</div>
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-2 py-1">Med: {stats.medium}</div>
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-2 py-1">High: {stats.high}</div>
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-slate-400">No analyses yet. Your history will stay in this browser only.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((item) => (
              <li key={item.id} className="rounded-xl border border-slate-800 bg-slate-900 p-3">
                <div className="mb-2 flex items-center justify-between gap-2 text-xs text-slate-400">
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                  <span className={`rounded-full border px-2 py-0.5 uppercase ${riskStyles[item.result.riskLevel]}`}>
                    {item.result.riskLevel} · {item.result.score}
                  </span>
                </div>
                <p className="mb-2 text-sm text-slate-200">{item.message}</p>
                <p className="text-xs text-slate-400">{item.result.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
