"use client";

import { useEffect, useMemo, useState } from "react";
import { QuickInputs } from "@/components/QuickInputs";
import { RunButton } from "@/components/RunButton";
import { RunCard, type RunItem } from "@/components/RunCard";
import { StatsCard, type StatItem } from "@/components/StatsCard";
import { WinnerCard } from "@/components/WinnerCard";

export default function DashboardPage() {
  const [input, setInput] = useState("Design an MVP growth test");
  const [loading, setLoading] = useState(false);
  const [runs, setRuns] = useState<RunItem[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [winner, setWinner] = useState<{ name: any; output: string } | null>(null);

  const fetchData = async () => {
    const [runsRes, statsRes] = await Promise.all([fetch("/api/runs"), fetch("/api/stats")]);
    const runsPayload = await runsRes.json();
    const statsPayload = await statsRes.json();
    setRuns(runsPayload.runs ?? []);
    setStats(statsPayload.stats ?? []);
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const run = async () => {
    setLoading(true);
    const res = await fetch("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input })
    });

    const payload = await res.json();
    setWinner({ name: payload.winner, output: payload.outputs?.[payload.winner] ?? "" });
    await fetchData();
    setLoading(false);
  };

  const totalWins = useMemo(() => stats.reduce((acc, item) => acc + item.wins, 0), [stats]);

  return (
    <main className="mx-auto w-full max-w-2xl space-y-4 px-4 py-6">
      <header>
        <h1 className="text-2xl font-bold">MurMur Mobile Engine</h1>
        <p className="text-sm text-slate-400">v0.3 · multi-agent council with memory learning</p>
      </header>

      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm"
        />
        <QuickInputs onSelect={setInput} />
        <RunButton loading={loading} onClick={run} />
      </section>

      <WinnerCard winner={winner?.name} output={winner?.output} />
      <RunCard runs={runs} />
      <StatsCard stats={stats} />

      <p className="text-center text-xs text-slate-500">Total wins tracked: {totalWins}</p>
    </main>
  );
}
