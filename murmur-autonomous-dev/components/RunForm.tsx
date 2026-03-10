'use client';

import { FormEvent, useState } from 'react';
import { agents } from '@/lib/agents';

export function RunForm() {
  const [prompt, setPrompt] = useState('');
  const [agent, setAgent] = useState(agents[0].id);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, agent })
      });
      setPrompt('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <label htmlFor="prompt" className="mb-1 block text-sm font-medium text-slate-700">
          Task prompt
        </label>
        <textarea
          id="prompt"
          className="min-h-28 w-full rounded-lg border border-slate-300 p-3 text-sm"
          placeholder="Describe the job for the autonomous agent"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="agent" className="mb-1 block text-sm font-medium text-slate-700">
          Agent
        </label>
        <select
          id="agent"
          className="w-full rounded-lg border border-slate-300 p-2 text-sm"
          value={agent}
          onChange={(event) => setAgent(event.target.value)}
        >
          {agents.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {submitting ? 'Starting...' : 'Start run'}
      </button>
    </form>
  );
}
