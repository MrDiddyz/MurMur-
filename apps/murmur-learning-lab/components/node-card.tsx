import type { LearningNode } from '@/lib/types';

interface Props {
  node: LearningNode;
}

export function NodeCard({ node }: Props) {
  return (
    <article className="card space-y-3">
      <h3 className="font-semibold text-white leading-snug">{node.title}</h3>
      <p className="text-sm text-ink/80 leading-relaxed">{node.summary}</p>
      {node.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {node.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-mirror/20 bg-mirror/5 px-2.5 py-0.5 text-xs text-mirror/80"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <p className="text-xs text-white/30">
        {new Date(node.created_at).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
      </p>
    </article>
  );
}
