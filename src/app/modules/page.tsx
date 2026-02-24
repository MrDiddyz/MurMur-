import { ModuleVault } from '@/components/module-vault';

export default function ModulesPage() {
  return (
    <div className="space-y-8 pb-10">
      <h1 className="text-4xl font-semibold">Module Vault</h1>
      <p className="max-w-3xl text-ink">
        Hver modul ligger i sin egen mappe og låses opp individuelt. Velg kategori, lås opp riktig modul og gå videre til
        detaljsiden.
      </p>
      <ModuleVault />
    </div>
  );
}
