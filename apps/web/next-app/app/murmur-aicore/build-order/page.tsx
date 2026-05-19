import { SectionShell } from '@/components/murmur/section-shell';

type RankedProject = {
  name: string;
  description: string;
  total: number;
  reason: string;
};

const tier1Projects: RankedProject[] = [
  {
    name: 'MurMur Report Service',
    description: 'AI-generated premium audit/report engine sold as a commercial service.',
    total: 42,
    reason: 'Fastest route to direct money while generating case studies and client trust.',
  },
  {
    name: 'MurMur Core',
    description: 'Main council intelligence engine.',
    total: 45,
    reason: 'Highest long-term asset. Every MurMur branch becomes stronger if Core exists.',
  },
  {
    name: 'OmniFlow',
    description: 'Automation backbone connecting all routes.',
    total: 42,
    reason: 'Without OmniFlow, future apps become fragmented manual work.',
  },
  {
    name: 'MurMur Local Growth Dashboard',
    description: 'Customer CRM + audit launcher + local sales control panel.',
    total: 38,
    reason: 'Excellent for closing local clients and looking established quickly.',
  },
  {
    name: 'MurMur Visual Sales Vault',
    description: 'AI-generated before/after visuals, posters, audit screenshots, customer examples.',
    total: 34,
    reason: 'Perceived value multiplier that strengthens every sales meeting.',
  },
];

const tier2Projects: RankedProject[] = [
  {
    name: 'MurMur Client Dossier Generator',
    description: 'Automated premium customer dossier creation.',
    total: 35,
    reason: 'Strong agency support layer after Tier 1 is compounding.',
  },
  {
    name: 'MurMur Statistics Dashboard',
    description: 'Tracks leads, reports, closes, MRR, and campaign success.',
    total: 33,
    reason: 'Useful internal discipline and investor credibility.',
  },
  {
    name: 'MurMur Social Profile Audit Engine',
    description: 'Sellable low-friction social profile diagnostics.',
    total: 33,
    reason: 'Simple to sell and easy to demo as a service entry point.',
  },
  {
    name: 'MurMur Founder Signal Reports',
    description: 'Premium personal diagnostics and strategy reports.',
    total: 32,
    reason: 'Can sell early and doubles as MurMur showcase output.',
  },
];

const tier3Projects: RankedProject[] = [
  {
    name: 'MurMur Full SaaS User Platform',
    description: 'Large user dashboard platform.',
    total: 44,
    reason: 'Massive future asset, but dangerous to start too early.',
  },
  {
    name: 'MurMur Story / Profile Engine',
    description: 'Emotionally strong storytelling branch.',
    total: 28,
    reason: 'Interesting, but secondary to cash and compounding systems.',
  },
  {
    name: 'MurMur Video Engine',
    description: 'High wow-factor video generation branch.',
    total: 27,
    reason: 'Impressive but not core-revenue first.',
  },
  {
    name: 'MurMur Lipsync Engine',
    description: 'Creative lip-sync marketing engine.',
    total: 24,
    reason: 'Fun for marketing, low direct strategic urgency.',
  },
  {
    name: 'MurMur Jam / Music Universe Branch',
    description: 'Creative identity branch.',
    total: 20,
    reason: 'Brand-rich, but not a business priority right now.',
  },
];

const tier4Projects = ['HAV x MurMur', 'Maskens Barn layers', 'Youth reflection systems', 'Community portals'] as const;

const criticalFocus = [
  'Report templates',
  'MurMur Core build',
  'OmniFlow orchestrator',
  'Local customer dashboard',
  'Visual demo assets',
] as const;

function ProjectList({ projects }: { projects: RankedProject[] }) {
  return (
    <ol className="space-y-3">
      {projects.map((project, index) => (
        <li key={project.name} className="rounded-lg border border-white/10 bg-black/25 p-4 text-white">
          <div className="mb-1 flex items-center justify-between gap-4">
            <p className="font-semibold">
              {index + 1}. {project.name}
            </p>
            <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-200">
              {project.total}/50
            </span>
          </div>
          <p className="text-sm text-white/80">{project.description}</p>
          <p className="mt-2 text-xs text-white/65">{project.reason}</p>
        </li>
      ))}
    </ol>
  );
}

export default function BuildOrderPage() {
  return (
    <SectionShell title="Build order" eyebrow="Execution Plan">
      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Tier 1 — Critical build now</h2>
          <ProjectList projects={tier1Projects} />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Tier 2 — Build directly after</h2>
          <ProjectList projects={tier2Projects} />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Tier 3 — High value but not now</h2>
          <ProjectList projects={tier3Projects} />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Tier 4 — Social impact / legitimacy projects</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {tier4Projects.map((project) => (
              <li key={project} className="rounded-lg border border-white/10 bg-black/25 p-3 text-sm text-white/85">
                {project}
              </li>
            ))}
          </ul>
          <p className="text-sm text-white/70">
            Keep these warm, but do not let them become the primary technical sink while Tier 1 compounds.
          </p>
        </section>

        <section className="rounded-xl border border-amber-300/30 bg-amber-500/10 p-4">
          <h2 className="text-lg font-semibold text-amber-100">Current 30-day execution priority</h2>
          <ul className="mt-3 space-y-2">
            {criticalFocus.map((item) => (
              <li key={item} className="text-sm text-amber-50/90">
                • {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-amber-50/80">
            Final rule: if a new idea does not help Tier 1 engines sell, think, automate, or look stronger, do not
            build it now.
          </p>
        </section>
      </div>
    </SectionShell>
  );
}
