import { SectionShell } from '@/components/murmur/section-shell';

const buildSteps = [
  'Set up app shell and mobile navigation',
  'Add mock data models',
  'Build dashboard',
  'Build vault list page',
  'Build project detail page',
  'Build fragments page',
  'Build agent notes page',
  'Build export page',
  'Add PWA manifest and installability support',
  'Polish mobile spacing and safe-area handling',
] as const;

export default function BuildOrderPage() {
  return (
    <SectionShell title="Build order" eyebrow="Execution Plan">
      <ol className="space-y-2">
        {buildSteps.map((step, index) => (
          <li key={step} className="rounded-lg border border-white/10 bg-black/25 p-3 font-medium text-white">
            {index + 1}. {step}
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}
