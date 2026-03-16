import { AppShell } from '@/components/vault/shell';
import { agentNotes } from '@/lib/vault/mock-data';

const priorityOrder = { High: 0, Medium: 1, Low: 2 } as const;

export default function AgentsPage() {
  const orderedNotes = [...agentNotes].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return (
    <AppShell title="Agent Notes" subtitle="Simulated advisory signals from your five MurMur creative agents.">
      <section className="space-y-3">
        {orderedNotes.map((note) => (
          <article key={note.id} className="rounded-2xl border border-[#8f7045]/35 bg-[#121212] p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-[#c09c63]">{note.agentType}</p>
              <span className="rounded-full bg-[#1f1f1f] px-2 py-1 text-[11px] text-[#d2d2d2]">{note.priority}</span>
            </div>
            <h3 className="mt-2 text-sm text-[#f0f0f0]">{note.title}</h3>
            <p className="mt-2 text-sm text-[#a5a5a5]">{note.content}</p>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
