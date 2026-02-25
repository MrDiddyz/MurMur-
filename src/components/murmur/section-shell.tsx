import type { ReactNode } from 'react';

interface SectionShellProps {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}

export function SectionShell({ title, eyebrow, children }: SectionShellProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0b1120]/70 p-6 shadow-glow">
      {eyebrow ? <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80">{eyebrow}</p> : null}
      <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
      <div className="mt-4 text-sm text-slate-200">{children}</div>
    </section>
  );
}
