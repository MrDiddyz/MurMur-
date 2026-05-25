'use client';

import { useState } from 'react';
import type { AIResponse } from '@/lib/types';
import { AIResponseCard } from './ai-response';

interface Props {
  onSave?: (id: string) => void;
}

export function ReflectionForm({ onSave }: Props) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAiResponse(null);
    setSaved(false);
    setLoading(true);

    try {
      const res = await fetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      const data = (await res.json()) as {
        ai?: AIResponse;
        reflection?: { id: string };
        error?: string;
      };

      if (!res.ok || data.error) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      setAiResponse(data.ai!);
      setSaved(true);
      if (data.reflection?.id && onSave) {
        onSave(data.reflection.id);
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setContent('');
    setAiResponse(null);
    setError(null);
    setSaved(false);
  }

  return (
    <div className="space-y-6">
      {!aiResponse ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reflection" className="label">
              Your Reflection
            </label>
            <textarea
              id="reflection"
              className="textarea min-h-[180px]"
              placeholder="What's on your mind? Write freely — this is your space to think, feel, and explore…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={5000}
              required
            />
            <p className="mt-1 text-right text-xs text-white/30">
              {content.length} / 5000
            </p>
          </div>

          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading || content.trim().length < 10}
          >
            {loading ? 'Reflecting…' : 'Send Reflection'}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          {saved && (
            <p className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-accent">
              ✓ Reflection saved and learning node created.
            </p>
          )}
          <AIResponseCard response={aiResponse} />
          <button onClick={handleReset} className="btn-ghost w-full">
            Write Another Reflection
          </button>
        </div>
      )}
    </div>
  );
}
