import type { ReactNode } from 'react';

export function AppShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-28 pt-6 md:px-6 md:pb-10">
      <header className="mb-5 space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-[#c9a66b]">MurMur Archive Vault</p>
        <h1 className="text-3xl font-semibold text-[#f4f4f4]">{title}</h1>
        <p className="text-sm leading-relaxed text-[#9f9f9f]">{subtitle}</p>
      </header>
      {children}
    </div>
  );
}
