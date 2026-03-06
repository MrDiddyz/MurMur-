'use client';

import { useEffect, useState } from 'react';

const STAGES = [
  {
    tone: 'hard',
    shade: 'dark',
    intent: 'good',
    className: 'border-[#d8c7ad] bg-[#fff8ef] text-[#1f1f1f]',
  },
  {
    tone: 'harder',
    shade: 'darker',
    intent: 'dangerous',
    className: 'border-[#5a4d3d] bg-[#221a14] text-[#efe4d4]',
  },
  {
    tone: 'absurd',
    shade: 'deepest',
    intent: 'dangerous',
    className: 'border-[#0a0a0a] bg-[#050505] text-[#f8f8f8]',
  },
] as const;

const WARNING_WORDS = ['illegal', 'forbidden', 'not meant to', 'should not', 'too far', 'wrong'] as const;

export function DropPreview() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setStageIndex((current) => {
        if (current >= STAGES.length - 1) {
          window.clearInterval(interval);
          return current;
        }

        return current + 1;
      });
    }, 1500);

    return () => window.clearInterval(interval);
  }, []);

  const stage = STAGES[stageIndex];

  return (
    <section className={['rounded-xl border p-6 transition-colors duration-700', stage.className].join(' ')}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-current/70">Audio cue</p>
      <p className="mt-3 text-2xl font-semibold">Wait for the drop</p>
      <p className="mt-2 text-lg">Listen to what happens next</p>
      <p className="mt-3 text-sm text-current/70">This turns deepest in 3 seconds</p>

      <div className="mt-4 space-y-1 text-sm text-current/80">
        <p>
          hard → harder → absurd: <span className="font-semibold">{stage.tone}</span>
        </p>
        <p>
          dark → darker → deepest: <span className="font-semibold">{stage.shade}</span>
        </p>
        <p>
          good → dangerous: <span className="font-semibold">{stage.intent}</span>
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {[...WARNING_WORDS, ...WARNING_WORDS].map((word, index) => (
          <span key={`${word}-${index}`} className="rounded-full border border-current/30 px-2.5 py-1 text-current/80">
            {word}
          </span>
        ))}
      </div>
    </section>
  );
}
