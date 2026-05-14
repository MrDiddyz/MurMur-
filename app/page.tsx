import Link from 'next/link';
import { SiteShell } from '@/components/layout/site-shell';
import { Card } from '@/components/ui/card';

export default function HomePage() {
  return (
    <SiteShell>
      <section className="grid flex-1 items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-accent">MurMur</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight md:text-6xl">
            A clean operating space for signals, councils, and memory.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            Start with focused primitives, wire in Supabase when ready, and deploy directly to Vercel.
          </p>
          <div className="mt-8 flex gap-3">
            <Link className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-background" href="/dashboard">
              Open dashboard
            </Link>
            <Link className="rounded-full border border-line px-5 py-3 text-sm font-semibold" href="/council">
              View council
            </Link>
          </div>
        </div>
        <Card>
          <p className="text-sm text-muted">Starter stack</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>Next.js App Router</li>
            <li>TypeScript</li>
            <li>Tailwind CSS</li>
            <li>Supabase client helpers</li>
            <li>Vercel configuration</li>
          </ul>
        </Card>
      </section>
    </SiteShell>
  );
}
