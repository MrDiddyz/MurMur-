import Link from 'next/link';
import { LearningModule } from '@/lib/types';

export function ModuleCard({ module }: { module: LearningModule }) {
  return (
    <article className="card flex h-full flex-col justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-accent">{module.category}</p>
        <h3 className="mt-3 text-xl font-semibold">{module.name}</h3>
        <p className="mt-3 text-sm text-ink">{module.description}</p>
      </div>
      <div className="mt-6 space-y-2 text-sm text-ink">
        <p>Tidslinje: {module.timeline}</p>
        <p>Startpris: {module.priceFrom}</p>
        <Link href={`/modules/${module.slug}`} className="inline-block pt-3 text-white underline-offset-4 hover:underline">
          Se modul
        </Link>
      </div>
    </article>
  );
}
