import Link from 'next/link';
import { listRecentNodes } from '@/lib/server/learning-lab';

export const dynamic = 'force-dynamic';

export default async function ConstellationPage() {
  const nodes = await listRecentNodes(24);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-12">
      <header className="card space-y-3">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Constellation</p>
        <h1 className="text-3xl font-semibold text-white">Learning nodes</h1>
        <p className="text-ink">Each reflection creates a node so you can track patterns, priorities, and next actions.</p>
      </header>

      {nodes.length === 0 ? (
        <section className="card space-y-3">
          <p className="text-ink">No learning nodes yet.</p>
          <Link href="/reflection" className="text-sm text-cyan-200 hover:text-cyan-100">
            Create your first reflection
          </Link>
        </section>
      ) : (
        <section className="grid gap-4">
          {nodes.map((node) => (
            <article key={node.id} className="card space-y-3">
              <h2 className="text-xl font-semibold text-white">{node.title}</h2>
              <p className="text-sm text-ink">{node.summary}</p>
              <p className="text-sm text-cyan-100">Next action: {node.next_action}</p>
              <p className="text-xs text-ink/90">{new Date(node.created_at).toLocaleString()}</p>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
