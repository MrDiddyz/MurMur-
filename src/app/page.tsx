import Link from 'next/link';
import { AppShell } from '@/components/vault/shell';
import { FragmentCard, ProjectCard, StatCard } from '@/components/vault/cards';
import { fragments, projects } from '@/lib/vault/mock-data';
import { getDashboardStats, getSuggestedActions } from '@/lib/vault/selectors';

export default function DashboardPage() {
  const recentFragments = fragments.slice(0, 3);
  const featuredProjects = projects.slice(0, 2);
  const stats = getDashboardStats();
  const actions = getSuggestedActions();

const plans = [
  {
    name: 'Starter',
    price: '€49 / mnd',
    description: 'For små team som trenger trygg AI-automatisering og rapportering.',
  },
  {
    name: 'Growth',
    price: '€149 / mnd',
    description: 'For selskaper som trenger integrasjoner, prioritet og avansert innsikt.',
  },
  {
    name: 'Vipps Startpakke',
    price: 'NOK 1490 (engang)',
    description: 'Lav terskel onboarding med oppsett, kvalitetssikring og første sprint.',
  },
];

  return (
    <AppShell
      title="Archive Dashboard"
      subtitle="A premium command surface for turning fragments into buildable projects."
    >
      <section className="grid grid-cols-2 gap-3">
        <StatCard label="Active Projects" value={stats.activeProjects} />
        <StatCard label="Fragments" value={stats.totalFragments} />
        <StatCard label="Avg. Maturity" value={`${stats.avgMaturity}%`} />
        <StatCard label="Next Actions" value={stats.nextActions} />
      </section>

      <section className="mt-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm uppercase tracking-[0.16em] text-[#bf9d67]">Suggested Next Actions</h2>
        </div>
        <div className="space-y-2 rounded-2xl border border-[#8e7045]/30 bg-[#101010] p-4">
          {actions.map((action) => (
            <p key={action} className="text-sm text-[#b5b5b5]">
              • {action}
            </p>
          ))}
        </div>
      </section>

      <section className="mt-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm uppercase tracking-[0.16em] text-[#bf9d67]">Active Projects</h2>
          <Link href="/vault" className="text-xs text-[#e9c88f]">
            Open Vault
          </Link>
        </div>
        <div className="space-y-3">
          {featuredProjects.map((project) => (
            <Link key={project.id} href={`/vault/${project.id}`}>
              <ProjectCard project={project} />
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-sm uppercase tracking-[0.16em] text-[#bf9d67]">Recent Fragments</h2>
        <div className="space-y-3">
          {recentFragments.map((fragment) => (
            <FragmentCard key={fragment.id} fragment={fragment} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
