const stats = [
  { label: 'MRR', value: 'NOK 182,400', detail: '+8.4% vs last month' },
  { label: 'ARR', value: 'NOK 2,188,800', detail: 'Projected from current MRR' },
  { label: 'Churn', value: '2.1%', detail: '-0.3pp vs last month' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 pb-10">
      <header className="space-y-2">
        <h1 className="text-4xl font-semibold">Revenue dashboard (mock)</h1>
        <p className="text-white/70">Placeholder metrics for internal tracking and layout validation.</p>
      </header>

      <section className="grid gap-5 md:grid-cols-3">
        {stats.map((stat) => (
          <article key={stat.label} className="card">
            <p className="text-sm uppercase tracking-wider text-white/60">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-cyan-300">{stat.value}</p>
            <p className="mt-2 text-sm text-white/70">{stat.detail}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
