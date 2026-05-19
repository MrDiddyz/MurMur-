import { ReactNode } from "react";

export function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-murmur-gold/20 bg-murmur-graphite/70 p-5">
      <h3 className="mb-3 text-sm uppercase tracking-[0.18em] text-murmur-gold">{title}</h3>
      {children}
    </section>
  );
}
