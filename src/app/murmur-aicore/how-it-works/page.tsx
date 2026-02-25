import { SectionShell } from '@/components/murmur/section-shell';

const flow = [
  'Join a membership tier and unlock platform entitlements.',
  'Enroll in a learning track and complete lessons inside modules.',
  'Use practice lab loops to implement weekly challenges and reflections.',
  'Join community role pathways and submit certification assessments.',
];

export default function HowItWorksPage() {
  return (
    <SectionShell title="How it works" eyebrow="System Flow">
      <ol className="list-decimal space-y-2 pl-5">
        {flow.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </SectionShell>
  );
}
