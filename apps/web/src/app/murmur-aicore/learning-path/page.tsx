import { SectionShell } from '@/components/murmur/section-shell';

export default function LearningPathOverviewPage() {
  return (
    <SectionShell title="Learning Path Overview" eyebrow="Track → Level → Module → Lesson">
      The learning graph enforces progression logic: lesson completion unlocks modules, module completion advances levels, and full level completion opens certification eligibility checks.
    </SectionShell>
  );
}
