import { AppShell } from '@/components/murmur/app-shell';
import { mockAgentNotes } from '@/lib/murmur/studio-models';

export default function AgentNotesPage() {
  return (
    <AppShell title="Agent notes" subtitle="Read synthesized guidance from specialist agents.">
      <ul className="space-y-3">
        {mockAgentNotes.map((note) => (
          <li key={note.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-cyan-100">{note.agent}</p>
              <p className="text-xs text-slate-400">{note.createdAt}</p>
            </div>
            <p className="mt-2 text-sm text-slate-200">{note.note}</p>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
