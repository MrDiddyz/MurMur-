export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-murmur-copper/30 bg-murmur-graphite p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-murmur-gold">{title}</h2>
      {children}
    </section>
  );
}
