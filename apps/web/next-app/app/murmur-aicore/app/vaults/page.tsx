import Link from 'next/link';
import { AppShell } from '@/components/murmur/app-shell';
import { getVaultProjects, mockVaults } from '@/lib/murmur/studio-models';

export default function VaultListPage() {
  return (
    <AppShell title="Vault list" subtitle="Browse vaults and jump directly into active projects.">
      {mockVaults.map((vault) => {
        const projects = getVaultProjects(vault.id);

        return (
          <article key={vault.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-semibold text-white">{vault.name}</h2>
              <p className="text-xs text-slate-400">Updated {vault.updatedAt}</p>
            </div>
            <p className="mt-2 text-sm text-slate-300">{vault.description}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.12em] text-cyan-200">
              {projects.length} project{projects.length === 1 ? '' : 's'}
            </p>

            {projects.length ? (
              <ul className="mt-3 space-y-2">
                {projects.map((project) => (
                  <li key={project.id}>
                    <Link
                      href={`/murmur-aicore/app/projects/${project.id}`}
                      className="block rounded-lg border border-white/10 bg-black/20 p-3 hover:border-cyan-300/60"
                    >
                      <p className="font-medium text-white">{project.title}</p>
                      <p className="text-xs text-slate-300">
                        {project.status} · {project.updatedAt}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-3 rounded-lg border border-dashed border-white/15 bg-black/20 p-3 text-sm text-slate-400">
                This vault has no projects yet.
              </div>
            )}
          </article>
        );
      })}
    </AppShell>
  );
}
