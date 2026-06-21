import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Nav } from '@/components/nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import type { AuditRow } from '@/lib/types';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: audits } = await supabase
    .from('signal_audits')
    .select('id,user_id,business_name,website,industry,notes,report,score,created_at')
    .order('created_at', { ascending: false });

  return (
    <main>
      <Nav email={user.email} />
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-champagne/75">Dashboard</p>
            <h1 className="mt-5 text-5xl font-semibold tracking-[-0.06em]">Signal audits</h1>
          </div>
          <Link href="/audits/new"><Button>New audit</Button></Link>
        </div>
        <div className="mt-10 grid gap-5">
          {(audits as AuditRow[] | null)?.length ? (audits as AuditRow[]).map((audit) => (
            <Link href={`/audits/${audit.id}`} key={audit.id}>
              <Card className="transition hover:border-champagne/30 hover:bg-white/[0.055]">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-champagne">{audit.industry}</p>
                    <h2 className="mt-3 text-2xl font-semibold">{audit.business_name}</h2>
                    <p className="mt-2 text-sm text-smoke">{audit.website} · {formatDate(audit.created_at)}</p>
                  </div>
                  <div className="grid size-20 place-items-center rounded-full border border-champagne/30 bg-champagne/10 text-2xl font-semibold text-champagne">{audit.score}</div>
                </div>
              </Card>
            </Link>
          )) : (
            <Card className="py-16 text-center">
              <h2 className="text-2xl font-semibold">No audits yet.</h2>
              <p className="mt-3 text-sm text-smoke">Generate the first MurMur Signal Audit for a local business.</p>
              <Link className="mt-6 inline-block" href="/audits/new"><Button>Generate first audit</Button></Link>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
