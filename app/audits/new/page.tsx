import { redirect } from 'next/navigation';
import { AuditForm } from '@/components/audit-form';
import { Nav } from '@/components/nav';
import { createClient } from '@/lib/supabase/server';

export default async function NewAuditPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <main>
      <Nav email={user.email} />
      <section className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-champagne/75">New audit</p>
        <h1 className="mt-5 text-5xl font-semibold tracking-[-0.06em]">Generate a MurMur Signal Audit.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-smoke">Enter only the facts you know. The generator produces a practical MVP report for sales calls, client onboarding, and strategic follow-up.</p>
        <div className="mt-10"><AuditForm /></div>
      </section>
    </main>
  );
}
