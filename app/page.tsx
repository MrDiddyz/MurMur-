import Link from 'next/link';
import { Nav } from '@/components/nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main>
      <Nav email={user?.email} />
      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.35em] text-champagne/75">Signal Audit Generator</p>
          <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-mercury sm:text-7xl">
            Find the leaks in a local brand&apos;s digital signal.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-smoke">
            MurMur turns business context into a cinematic, consultant-grade audit with observations,
            narrative insight, prioritized repairs, scoring, a seven-day action plan, and PDF export.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href={user ? '/audits/new' : '/login'}><Button className="w-full sm:w-auto">Generate an audit</Button></Link>
            <Link href="/dashboard"><Button variant="secondary" className="w-full sm:w-auto">View dashboard</Button></Link>
          </div>
        </div>
        <Card className="relative overflow-hidden p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-champagne/70 to-transparent" />
          <div className="rounded-[1.5rem] border border-champagne/15 bg-black/40 p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.28em] text-champagne">Preview</span>
              <span className="rounded-full bg-champagne px-3 py-1 text-xs font-bold text-black">87</span>
            </div>
            <h2 className="mt-8 text-2xl font-semibold tracking-tight">Signal clarity is strong, but trust proof is under-leveraged.</h2>
            <div className="mt-8 space-y-4">
              {['Google profile inconsistency', 'Homepage CTA lacks urgency', 'Reviews are not converted into proof assets'].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-smoke">{item}</div>
              ))}
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
