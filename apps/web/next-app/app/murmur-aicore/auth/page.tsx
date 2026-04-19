import { SectionShell } from '@/components/murmur/section-shell';

export default function AuthEntryPage() {
  return (
    <SectionShell title="Login / Signup" eyebrow="Supabase Auth Ready">
      Auth flows are designed for Supabase Email + OAuth login, with server-side session checks enforcing secure access to member-only areas.
    </SectionShell>
  );
}
