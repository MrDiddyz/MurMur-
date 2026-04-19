import { AppShell } from '@/components/murmur/app-shell';

const exportOptions = [
  { name: 'Project summary PDF', scope: 'Project detail + notes + fragment digest' },
  { name: 'Fragments JSON', scope: 'All fragments grouped by project and type' },
  { name: 'Agent notes CSV', scope: 'Chronological note history for audit and review' },
];

export default function ExportPage() {
  return (
    <AppShell title="Export" subtitle="Prepare deliverables for teams, stakeholders, and archives.">
      <ul className="space-y-3">
        {exportOptions.map((option) => (
          <li key={option.name} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="text-base font-semibold text-white">{option.name}</h2>
            <p className="mt-1 text-sm text-slate-300">{option.scope}</p>
            <button type="button" className="mt-3 rounded-full border border-cyan-300/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-100">
              Generate
            </button>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
