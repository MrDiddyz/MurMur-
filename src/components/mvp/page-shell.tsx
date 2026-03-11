import type { ReactNode } from 'react';

type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function PageShell({ eyebrow, title, description, children }: PageShellProps) {
  return (
    <section className="mx-auto max-w-5xl space-y-8 py-12">
      <header className="card pulse-violet space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-200">{eyebrow}</p>
        <h1 className="text-3xl font-semibold md:text-4xl">{title}</h1>
        <p className="max-w-3xl text-sm text-ink md:text-base">{description}</p>
      </header>
      {children}
    </section>
  );
}
