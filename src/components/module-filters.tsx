'use client';

import { useMemo, useState } from 'react';
import { moduleCategories, modules } from '@/data/modules';
import { ModuleCard } from '@/components/module-card';

export function ModuleFilters() {
  const [active, setActive] = useState<string>('Alle');

  const visible = useMemo(
    () => (active === 'Alle' ? modules : modules.filter((module) => module.category === active)),
    [active],
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        {['Alle', ...moduleCategories].map((category) => (
          <button
            type="button"
            key={category}
            onClick={() => setActive(category)}
            className={`rounded-full border px-4 py-2 text-sm ${
              active === category ? 'border-accent bg-accent/20 text-white' : 'border-white/20 text-ink hover:text-white'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((module) => (
          <ModuleCard key={module.slug} module={module} />
        ))}
      </div>
    </div>
  );
}
