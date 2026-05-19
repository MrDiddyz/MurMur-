'use client';

import { useState } from 'react';

export function SignalForm() {
  const [signal, setSignal] = useState('');
  const [result, setResult] = useState<string | null>(null);

  async function analyzeSignal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const response = await fetch('/api/signal/analyze', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ signal }),
    });
    const payload = (await response.json()) as { summary?: string };
    setResult(payload.summary ?? 'Signal received.');
  }

  return (
    <form onSubmit={analyzeSignal} className="space-y-4">
      <textarea
        value={signal}
        onChange={(event) => setSignal(event.target.value)}
        placeholder="Paste a signal, observation, or reflection..."
        className="min-h-32 w-full rounded-xl border border-line bg-background p-4 text-sm outline-none ring-accent/50 transition focus:ring-2"
      />
      <button
        type="submit"
        className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-background transition hover:opacity-90"
      >
        Analyze signal
      </button>
      {result ? <p className="text-sm text-muted">{result}</p> : null}
    </form>
  );
}
