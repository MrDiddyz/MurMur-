import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AuditReport } from '@/components/audit-report';
import { Nav } from '@/components/nav';
import { PdfExport } from '@/components/pdf-export';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import type { AuditRow } from '@/lib/types';

export default async function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: audit } = await supabase
    .from('signal_audits')
    .select('id,user_id,business_name,website,industry,notes,report,score,created_at')
    .eq('id', id)
    .single();

  if (!audit) notFound();
  const row = audit as AuditRow;

  return (
    <main>
      <Nav email={user.email} />
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="no-print flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Link href="/dashboard" className="text-sm text-smoke hover:text-champagne">← Dashboard</Link>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-champagne/75">MurMur Signal Audit</p>
            <h1 className="mt-4 text-5xl font-semibold tracking-[-0.06em]">{row.business_name}</h1>
            <p className="mt-3 text-sm text-smoke">{row.industry} · {row.website} · {formatDate(row.created_at)}</p>
          </div>
          <div className="flex gap-3"><PdfExport /><Link href="/audits/new"><Button>New audit</Button></Link></div>
        </div>
        <div className="mt-10"><AuditReport report={row.report} /></div>
      </section>
    </main>
  );
}
