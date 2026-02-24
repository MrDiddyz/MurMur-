'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { moduleCategories, modules } from '@/data/modules';

export function ModuleVault() {
  const [activeCategory, setActiveCategory] = useState<string>('Alle');
  const [unlocked, setUnlocked] = useState<Record<string, boolean>>({});

  const visibleModules = useMemo(
    () => (activeCategory === 'Alle' ? modules : modules.filter((item) => item.category === activeCategory)),
    [activeCategory]
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        {['Alle', ...moduleCategories].map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={`rounded-full border px-4 py-2 text-sm ${
              activeCategory === category ? 'border-accent bg-accent/20 text-white' : 'border-white/20 text-ink hover:text-white'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleModules.map((module) => {
          const isUnlocked = Boolean(unlocked[module.slug]);
          return (
            <article key={module.slug} className="card module-folder flex h-full flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-accent">{module.category}</p>
                <h3 className="mt-3 text-xl font-semibold">{module.name}</h3>
                <p className="mt-3 text-sm text-ink">{module.description}</p>
              </div>

              <div className="mt-6 space-y-3 text-sm text-ink">
                <p>Tidslinje: {module.timeline}</p>
                <p>Startpris: {module.priceFrom}</p>

                {!isUnlocked ? (
                  <button
                    type="button"
                    onClick={() => setUnlocked((prev) => ({ ...prev, [module.slug]: true }))}
                    className="rounded-full border border-accent/60 px-4 py-2 font-semibold text-white hover:bg-accent/20"
                  >
                    Lås opp modul
                  </button>
                ) : (
                  <Link href={`/modules/${module.slug}`} className="inline-block pt-2 text-white underline-offset-4 hover:underline">
                    Åpne modulmappe
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
