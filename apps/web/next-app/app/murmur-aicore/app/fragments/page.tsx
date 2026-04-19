import { AppShell } from '@/components/murmur/app-shell';
import { mockFragments } from '@/lib/murmur/studio-models';

export default function FragmentsPage() {
  return (
    <AppShell title="Fragments" subtitle="Collect atomic insights, tasks, and references for reuse.">
      <ul className="space-y-3">
        {mockFragments.map((fragment) => (
          <li key={fragment.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-cyan-200">{fragment.type}</p>
            <h2 className="mt-1 text-lg font-semibold text-white">{fragment.title}</h2>
            <p className="mt-2 text-sm text-slate-300">{fragment.body}</p>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
