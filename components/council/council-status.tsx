import { councilMembers } from '@/lib/council/members';
import { Card } from '@/components/ui/card';

export function CouncilStatus() {
  return (
    <Card>
      <p className="text-sm uppercase tracking-[0.3em] text-accent">Council</p>
      <h2 className="mt-3 text-2xl font-semibold">Ready to run</h2>
      <ul className="mt-5 space-y-3 text-sm text-muted">
        {councilMembers.map((member) => (
          <li key={member.id} className="flex items-center justify-between gap-4">
            <span>{member.name}</span>
            <span>{member.role}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
