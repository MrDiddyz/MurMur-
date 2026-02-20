import { ModuleFilters } from '@/components/module-filters';

export default function ModulesPage() {
  return (
    <div className="space-y-8 pb-10">
      <h1 className="text-4xl font-semibold">Modules Catalog</h1>
      <p className="max-w-3xl text-ink">
        Filtrer moduler etter kategori og finn riktig inngangspunkt. Alle moduler leveres med tydelige utfall, tidsrammer og
        startpris.
      </p>
      <ModuleFilters />
    </div>
  );
}
