import { SectionShell } from '@/components/murmur/section-shell';

const lessons = [
  'Level 1 / Module 1.1 / Lesson 1: Foundations',
  'Level 1 / Module 1.2 / Lesson 2: Pattern Recognition',
  'Level 2 / Module 2.1 / Lesson 1: Decision Models',
];

export default function LearningSystemPage() {
  return (
    <SectionShell title="Learning system" eyebrow="Structured Hierarchy">
      <p>Track → Level → Module → Lesson with multi-format content (video, text, exercise, reflection, quiz).</p>
      <ul className="mt-3 list-disc space-y-1 pl-5">
        {lessons.map((lesson) => (
          <li key={lesson}>{lesson}</li>
        ))}
      </ul>
    </SectionShell>
  );
}
