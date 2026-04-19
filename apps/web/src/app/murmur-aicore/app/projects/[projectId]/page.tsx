import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppShell } from '@/components/murmur/app-shell';
import {
  getProjectAgentNotes,
  getProjectById,
  getProjectFragments,
} from '@/lib/murmur/studio-models';

export default function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  const project = getProjectById(params.projectId);

  if (!project) {
    notFound();
  }

  const fragments = getProjectFragments(project.id);
  const notes = getProjectAgentNotes(project.id);

  return (
    <AppShell title="Project detail" subtitle="Inspect project status, fragments, and agent guidance in one place.">
      <div className="flex flex-wrap gap-2">
        <Link
          href="/murmur-aicore/app/vaults"
          className="rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-[0.12em] text-slate-300"
        >
          Back to vaults
        </Link>
        <Link
          href="/murmur-aicore/app/export"
          className="rounded-full border border-cyan-300/40 px-3 py-1 text-xs uppercase tracking-[0.12em] text-cyan-100"
        >
          Export project
        </Link>
      </div>

      <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="text-xl font-semibold text-white">{project.title}</h2>
        <p className="mt-2 text-sm text-slate-300">{project.summary}</p>
        <p className="mt-3 text-xs text-cyan-200">
          {project.status} · Updated {project.updatedAt}
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <li key={tag} className="rounded-full border border-white/15 px-2 py-1 text-xs text-slate-300">
              {tag}
            </li>
          ))}
        </ul>
      </article>

      <div className="grid gap-3 md:grid-cols-2">
        <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-200">Fragments</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {fragments.map((fragment) => (
              <li key={fragment.id} className="rounded-lg border border-white/10 bg-black/20 p-3 text-slate-200">
                <p className="font-medium text-white">{fragment.title}</p>
                <p className="text-xs text-slate-400">{fragment.type}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-200">Agent notes</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {notes.map((note) => (
              <li key={note.id} className="rounded-lg border border-white/10 bg-black/20 p-3 text-slate-200">
                <p className="text-xs text-cyan-200">{note.agent}</p>
                <p>{note.note}</p>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </AppShell>
  );
}
