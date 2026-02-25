import { SectionShell } from '@/components/murmur/section-shell';

const buildSteps = [
  ['Project scaffold', 'Established route groups, reusable UI shells, domain models, and modular boundaries.'],
  ['Database schema', 'Designed Supabase Postgres tables with RLS-first relationships and progression entities.'],
  ['Authentication', 'Prepared auth entry and API contracts for server-side session verification.'],
  ['Membership system', 'Introduced tier definitions, entitlements, and subscription control surfaces.'],
  ['Learning structure', 'Mapped track-level-module-lesson hierarchy and content payload model.'],
  ['Progress tracking', 'Implemented metric calculators for completion, streaks, and milestone reporting.'],
  ['Dashboard', 'Created member control center with operational KPIs and action shortcuts.'],
  ['Community', 'Defined role model and hub capability set for discussions and progress sharing.'],
  ['Certification', 'Specified eligibility checks, review workflow, and certificate issuance path.'],
  ['Ambassador system', 'Outlined referral generation, invited member tracking, and rewards logic.'],
  ['Admin panel', 'Provided centralized operations surface for content, subscriptions, and analytics.'],
] as const;

export default function BuildOrderPage() {
  return (
    <SectionShell title="Build order + architecture summary" eyebrow="Execution Plan">
      <ol className="space-y-2">
        {buildSteps.map(([step, summary], index) => (
          <li key={step} className="rounded-lg border border-white/10 bg-black/25 p-3">
            <p className="font-semibold text-white">{index + 1}. {step}</p>
            <p className="text-xs text-slate-200">Architecture summary: {summary}</p>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}
