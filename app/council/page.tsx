import { CouncilStatus } from '@/components/council/council-status';
import { SiteShell } from '@/components/layout/site-shell';

export default function CouncilPage() {
  return (
    <SiteShell>
      <div className="max-w-2xl">
        <CouncilStatus />
      </div>
    </SiteShell>
  );
}
