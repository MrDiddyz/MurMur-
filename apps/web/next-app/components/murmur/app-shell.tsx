import type { ReactNode } from 'react';
import { DesktopNav, MobileNav } from '@/components/murmur/mobile-nav';
import { InstallButton } from '@/components/murmur/install-button';

export function AppShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="safe-top safe-bottom pb-20 md:pb-8">
      <header className="rounded-2xl border border-white/10 bg-black/35 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">MurMur Mobile Workspace</p>
            <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">{subtitle}</p>
          </div>
          <InstallButton />
        </div>
      </header>
      <div className="mt-4">
        <DesktopNav />
      </div>
      <section className="mt-5 space-y-4">{children}</section>
      <MobileNav />
    </div>
  );
}
