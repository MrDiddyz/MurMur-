import type { ReactNode } from 'react';
import { MurmurCoreNav } from '@/components/murmur/core-nav';

export default function MurmurAiCoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto max-w-6xl space-y-6 py-8">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <span className="shooting-star shooting-star-a" />
        <span className="shooting-star shooting-star-b" />
      </div>

      <header className="relative z-10 rounded-2xl border border-cyan-300/30 bg-gradient-to-br from-[#030711] via-[#0f172a] to-[#062433] p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">MurMurAiCore</p>
        <h1 className="mt-2 text-3xl font-semibold text-white md:text-4xl">Adaptive Intelligence Learning Platform</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-200">
          Production-grade SaaS architecture focused on progression, membership intelligence, certification pathways, and long-term learning retention.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-900/20 px-4 py-1.5 text-xs text-cyan-100">
          <span className="uppercase tracking-[0.12em] text-cyan-300">Kontakt</span>
          <a href="mailto:MurmurAi@proton.me" className="glow-button font-medium text-cyan-100 hover:text-white">
            MurmurAi@proton.me
          </a>
        </div>
      </header>
      <div className="relative z-10">
        <MurmurCoreNav />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
