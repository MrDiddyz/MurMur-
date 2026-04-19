import { COMMUNITY_ROLE_LABELS } from '@/lib/murmur/domain';
import { SectionShell } from '@/components/murmur/section-shell';

export default function CommunityHubPage() {
  return (
    <SectionShell title="Community hub" eyebrow="Role-based Participation">
      <p>Features include member posts, discussion threads, weekly focus topics, progress sharing, and live event announcements.</p>
      <ul className="mt-3 list-disc pl-5">
        {Object.values(COMMUNITY_ROLE_LABELS).map((role) => (
          <li key={role}>{role}</li>
        ))}
      </ul>
    </SectionShell>
  );
}
