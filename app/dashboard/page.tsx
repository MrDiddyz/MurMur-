import { SiteShell } from '@/components/layout/site-shell';
import { Card } from '@/components/ui/card';
import { CouncilStatus } from '@/components/council/council-status';
import { SignalForm } from '@/components/signal/signal-form';

export default function DashboardPage() {
  return (
    <SiteShell>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <p className="text-sm uppercase tracking-[0.3em] text-accent">Signal</p>
          <h1 className="mt-3 text-3xl font-semibold">Capture what matters</h1>
          <div className="mt-6">
            <SignalForm />
          </div>
        </Card>
        <CouncilStatus />
      </div>
    </SiteShell>
  );
}
