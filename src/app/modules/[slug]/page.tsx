import { notFound } from 'next/navigation';
import Link from 'next/link';
import { modules } from '@/data/modules';

export function generateStaticParams() {
  return modules.map((moduleItem) => ({ slug: moduleItem.slug }));
}

export default function ModuleDetailPage({ params }: { params: { slug: string } }) {
  const selectedModule = modules.find((item) => item.slug === params.slug);
  if (!selectedModule) notFound();

  return (
    <div className="space-y-8 pb-10">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-accent">{selectedModule.category}</p>
        <h1 className="mt-3 text-4xl font-semibold">{selectedModule.name}</h1>
      </div>
      <section className="card">
        <p className="text-ink">{selectedModule.description}</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-ink">
          {selectedModule.outcomes.map((outcome) => (
            <li key={outcome}>{outcome}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-ink">Typisk tidslinje: {selectedModule.timeline}</p>
        <p className="text-sm text-ink">Pris: {selectedModule.priceFrom}</p>
      </section>
      <Link href="/contact" className="inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-night">
        Book en samtale om denne modulen
      </Link>
    </div>
  );
}
