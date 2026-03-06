"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const response = await fetch(`${apiUrl}/workflows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    const data = await response.json();
    setLoading(false);
    if (data?.id) {
      router.push(`/workflows/${data.id}`);
    }
  }

  return (
    <main>
      <h1>Start workflow</h1>
      <form onSubmit={onSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
          style={{ width: "100%", maxWidth: 640 }}
          placeholder="Describe what the agent system should build..."
        />
        <br />
        <button disabled={loading || !prompt.trim()} type="submit">
          {loading ? "Starting..." : "Start"}
        </button>
      </form>
    </main>
  );
}
