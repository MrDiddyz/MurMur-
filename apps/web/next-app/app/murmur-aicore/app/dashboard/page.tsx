import Link from 'next/link';
import { AppShell } from '@/components/murmur/app-shell';
import {
  mockAgentNotes,
  mockFragments,
  mockProjects,
  mockVaults,
} from '@/lib/murmur/studio-models';

export default function DashboardPage() {
  const activeProjects = mockProjects.filter((project) => project.status !== 'Approved').length;

  return (
    <AppShell title="Dashboard" subtitle="A mobile-first command center for all active vault work.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Vaults" value={String(mockVaults.length)} />
        <MetricCard label="Projects" value={String(mockProjects.length)} />
        <MetricCard label="Active" value={String(activeProjects)} />
        <MetricCard label="Fragments" value={String(mockFragments.length)} />
      </div>

      <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-200">Continue where you left off</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {mockProjects.slice(0, 2).map((project) => (
            <li key={project.id}>
              <Link
                href={`/murmur-aicore/app/projects/${project.id}`}
                className="block rounded-lg border border-white/10 bg-black/20 p-3 text-slate-200 hover:border-cyan-300/60"
              >
                <p className="font-medium text-white">{project.title}</p>
                <p className="text-xs text-slate-400">{project.status} · {project.updatedAt}</p>
              </Link>
            </li>
          ))}
        </ul>
      </article>

      <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-200">Recent agent notes</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-200">
          {mockAgentNotes.slice(0, 2).map((note) => (
            <li key={note.id} className="rounded-lg border border-white/10 bg-black/20 p-3">
              <p className="text-xs text-cyan-200">{note.agent}</p>
              <p className="mt-1">{note.note}</p>
            </li>
          ))}
        </ul>
      </article>

      <div className="flex flex-wrap gap-2">
        <QuickAction href="/murmur-aicore/app/vaults" label="Open vault list" />
        <QuickAction href="/murmur-aicore/app/fragments" label="Browse fragments" />
        <QuickAction href="/murmur-aicore/app/export" label="Prepare export" />
      </div>
    </AppShell>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.12em] text-slate-300">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </article>
  );
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex rounded-full border border-cyan-300/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100"
    >
      {label}
    </Link>
  );
}
