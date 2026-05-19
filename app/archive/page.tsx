import { SiteShell } from '@/components/layout/site-shell';
import { Card } from '@/components/ui/card';

export default function ArchivePage() {
  return (
    <SiteShell>
      <Card className="max-w-2xl">
        <p className="text-sm uppercase tracking-[0.3em] text-accent">Archive</p>
        <h1 className="mt-3 text-3xl font-semibold">Reflections will appear here</h1>
        <p className="mt-4 text-muted">
          Connect Supabase and use the reflection API to persist council outcomes and notes.
        </p>
      </Card>
    </SiteShell>
  );
}
