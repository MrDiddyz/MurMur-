import type { Reflection } from '@/lib/types';

interface Props {
  reflection: Reflection;
}

export function ReflectionCard({ reflection }: Props) {
  return (
    <article className="card space-y-4">
      <p className="text-sm leading-relaxed text-white/90 line-clamp-4">
        {reflection.content}
      </p>

      {reflection.mirror && (
        <div className="rounded-xl border border-purple-400/20 bg-purple-400/5 p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-purple-300/70">
            🪞 Mirror
          </p>
          <p className="text-xs text-white/80 leading-relaxed">{reflection.mirror}</p>
        </div>
      )}

      {reflection.next_step && (
        <div className="rounded-xl border border-accent/20 bg-accent/5 p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent/70">
            → Next Step
          </p>
          <p className="text-xs text-white/80 leading-relaxed">{reflection.next_step}</p>
        </div>
      )}

      <p className="text-xs text-white/30">
        {new Date(reflection.created_at).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </article>
  );
}
