import Link from 'next/link';
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
    <article className="card mx-auto max-w-3xl space-y-8">
      <header className="space-y-4 border-b border-white/10 pb-6">
        <p className="text-xs uppercase tracking-[0.18em] text-accent">{selectedModule.category}</p>
        <h1 className="text-4xl font-semibold text-white md:text-5xl">{selectedModule.name}</h1>
        <p className="max-w-2xl text-lg leading-relaxed text-ink">{selectedModule.description}</p>
      </header>

      <section className="grid gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-ink">Tidslinje</p>
          <p className="mt-1 text-base font-medium text-white">{selectedModule.timeline}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-ink">Startpris</p>
          <p className="mt-1 text-base font-medium text-white">{selectedModule.priceFrom}</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Dette får du</h2>
        <ul className="space-y-2 text-ink">
          {selectedModule.outcomes.map((outcome) => (
            <li key={outcome} className="flex gap-2 leading-relaxed">
              <span aria-hidden>•</span>
              <span>{outcome}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-accent/30 bg-accent/5 p-5">
        <p className="text-sm uppercase tracking-[0.14em] text-ink">Neste steg</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Klar for å lukke neste deal?</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink">
          Send en kort e-post med mål, teamstørrelse og ønsket oppstart. Du får forslag til leveranse og neste steg.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="mailto:MurMurai@proton.me?subject=Foresp%C3%B8rsel%20om%20modul"
            className="rounded-full border border-accent/70 px-5 py-2 text-sm font-semibold text-white hover:bg-accent/20"
          >
            Send e-post: MurMurai@proton.me
          </a>
          <Link
            href="/contact"
            className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            Book avklaringssamtale
          </Link>
        </div>
      </section>
    </article>
  );
}
