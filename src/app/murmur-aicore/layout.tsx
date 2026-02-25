import type { ReactNode } from 'react';
import { MurmurCoreNav } from '@/components/murmur/core-nav';

export default function MurmurAiCoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6 py-8">
      <header className="rounded-2xl border border-cyan-300/30 bg-gradient-to-br from-[#030711] via-[#0f172a] to-[#062433] p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">MurMurAiCore</p>
        <h1 className="mt-2 text-3xl font-semibold text-white md:text-4xl">Adaptive Intelligence Learning Platform</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-200">
          Production-grade SaaS architecture focused on progression, membership intelligence, certification pathways, and long-term learning retention.
        </p>
      </header>
      <MurmurCoreNav />
      <div>{children}</div>
    </div>
  );
}
