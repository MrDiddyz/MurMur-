"use client";

import { useState } from "react";
import { PromptForm } from "@/components/PromptForm";
import { ResultPanel } from "@/components/ResultPanel";
import { AgentTrace } from "@/components/AgentTrace";
import { FeedbackBar } from "@/components/FeedbackBar";
import type { RunApiResponse } from "@/types/murmur";

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<RunApiResponse | null>(null);

  const runMurmur = async () => {
    setError("");
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      const payload = (await response.json()) as RunApiResponse | { error: string };
      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "Run failed");
      }

      setResult(payload as RunApiResponse);
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h1 style={{ marginBottom: "0.25rem" }}>MurMur Micro</h1>
      <p style={{ marginTop: 0, color: "#444" }}>
        A minimal multi-agent demo: Idea drafts, Critic challenges, Synth improves, Judge picks the winner.
      </p>

      <PromptForm prompt={prompt} setPrompt={setPrompt} loading={loading} onSubmit={runMurmur} />

      {error ? <p style={{ color: "#b00020", fontWeight: 600 }}>{error}</p> : null}

      {result ? (
        <>
          <ResultPanel result={result} />
          <AgentTrace trace={result.trace} />
          <FeedbackBar episodeId={result.episodeId} />
        </>
      ) : null}
    </main>
  );
}
