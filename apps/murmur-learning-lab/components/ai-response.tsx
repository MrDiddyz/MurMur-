import type { AIResponse } from '@/lib/types';

interface Props {
  response: AIResponse;
}

const sections: { key: keyof AIResponse; label: string; icon: string; color: string }[] = [
  { key: 'mirror', label: 'Mirror', icon: '🪞', color: 'border-purple-400/30 bg-purple-400/5' },
  { key: 'insight', label: 'Insight', icon: '💡', color: 'border-yellow-400/30 bg-yellow-400/5' },
  { key: 'next_step', label: 'Next Step', icon: '→', color: 'border-accent/30 bg-accent/5' },
  { key: 'creative_suggestion', label: 'Creative Spark', icon: '✨', color: 'border-pink-400/30 bg-pink-400/5' },
];

export function AIResponseCard({ response }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-ink">
        AI Response
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {sections.map(({ key, label, icon, color }) => (
          <div
            key={key}
            className={`rounded-xl border p-4 ${color}`}
          >
            <p className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ink/70">
              <span>{icon}</span>
              {label}
            </p>
            <p className="text-sm leading-relaxed text-white/90">
              {response[key]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
