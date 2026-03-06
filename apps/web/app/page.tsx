"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("Build a simple task planner app");
  const [maxIterations, setMaxIterations] = useState(3);
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:10000";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`${apiUrl}/workflows`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt, maxIterations })
    });
    const data = await res.json();
    setLoading(false);
    if (data.workflowId) router.push(`/workflows/${data.workflowId}`);
  }

  return (
    <main>
      <h1>MurMur AI Agent Platform</h1>
      <form onSubmit={submit} style={{ display: "grid", gap: "0.75rem", maxWidth: 600 }}>
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={5} />
        <input type="number" value={maxIterations} onChange={e => setMaxIterations(Number(e.target.value))} min={1} max={10} />
        <button disabled={loading}>{loading ? "Starting..." : "Start workflow"}</button>
      </form>
    </main>
  );
}
