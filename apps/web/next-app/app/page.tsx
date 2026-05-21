import Link from 'next/link';
import { listRecentNodes, listRecentReflections } from '@/lib/server/learning-lab';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [reflections, nodes] = await Promise.all([listRecentReflections(5), listRecentNodes(5)]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 py-12">
      <header className="card space-y-4">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Murmur Learning Lab</p>
        <h1 className="text-4xl font-semibold text-white">Human-centered AI learning and reflection lab</h1>
        <p className="max-w-3xl text-ink">
          Write reflections, receive AI guidance, and track your growth through connected learning nodes.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-200" href="/reflection">
            New reflection
          </Link>
          <Link className="rounded-lg border border-white/25 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10" href="/constellation">
            View constellation
          </Link>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="card space-y-3">
          <h2 className="text-xl font-semibold text-white">Recent reflections</h2>
          {reflections.length === 0 ? (
            <p className="text-sm text-ink">No reflections yet.</p>
          ) : (
            <ul className="space-y-3">
              {reflections.map((reflection) => (
                <li key={reflection.id} className="rounded-lg border border-white/15 p-3">
                  <p className="line-clamp-3 text-sm text-ink">{reflection.content}</p>
                  <p className="mt-2 text-xs text-ink/90">{new Date(reflection.created_at).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="card space-y-3">
          <h2 className="text-xl font-semibold text-white">Recent nodes</h2>
          {nodes.length === 0 ? (
            <p className="text-sm text-ink">No nodes yet.</p>
          ) : (
            <ul className="space-y-3">
              {nodes.map((node) => (
                <li key={node.id} className="rounded-lg border border-white/15 p-3">
                  <p className="font-medium text-cyan-100">{node.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-ink">{node.summary}</p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </div>
  );
}
