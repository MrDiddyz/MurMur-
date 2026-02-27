import { notFound } from 'next/navigation';
import { modules } from '@/data/modules';

type ModulePageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return modules.map((module) => ({ slug: module.slug }));
}

export default function ModuleDetailPage({ params }: ModulePageProps) {
  const selectedModule = modules.find((item) => item.slug === params.slug);

  if (!selectedModule) {
    notFound();
  }

  return (
    <article className="card mx-auto max-w-3xl space-y-6">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.18em] text-accent">{selectedModule.category}</p>
        <h1 className="text-4xl font-semibold text-white">{selectedModule.name}</h1>
        <p className="text-lg text-ink">{selectedModule.description}</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Forventede utfall</h2>
        <ul className="space-y-2 text-ink">
          {selectedModule.outcomes.map((outcome) => (
            <li key={outcome} className="flex gap-2">
              <span aria-hidden>•</span>
              <span>{outcome}</span>
            </li>
          ))}
        </ul>
      </section>

      <dl className="grid gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 md:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-[0.14em] text-ink">Tidslinje</dt>
          <dd className="mt-1 text-base font-medium text-white">{selectedModule.timeline}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.14em] text-ink">Startpris</dt>
          <dd className="mt-1 text-base font-medium text-white">{selectedModule.priceFrom}</dd>
        </div>
      </dl>

      <section className="rounded-xl border border-accent/30 bg-accent/5 p-4">
        <p className="text-sm text-ink">Kontakt på e-post:</p>
        <a
          href="mailto:MurMurai@proton.me"
          className="mt-1 inline-block text-base font-medium text-white underline-offset-4 hover:underline"
        >
          MurMurai@proton.me
        </a>
      </section>
    </article>
  );
}
