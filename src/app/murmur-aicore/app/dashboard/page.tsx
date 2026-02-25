import { SectionShell } from '@/components/murmur/section-shell';
import { demoLessonProgress, demoMember } from '@/lib/murmur/mock-data';
import { calculateProgressMetrics } from '@/lib/murmur/progression';

export default function MemberDashboardPage() {
  const metrics = calculateProgressMetrics(demoLessonProgress, 24);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <SectionShell title="Member control center" eyebrow="Dashboard">
        <p><strong>Current level:</strong> {demoMember.currentLevel}</p>
        <p className="mt-2"><strong>Progress:</strong> {metrics.completionPercentage}%</p>
        <p className="mt-2"><strong>Next lesson:</strong> {demoMember.nextLesson}</p>
      </SectionShell>
      <SectionShell title="Milestones" eyebrow="Progression">
        <p>{metrics.milestoneCount} milestones achieved</p>
        <p className="mt-2">{metrics.streakDays}-day learning streak</p>
        <p className="mt-2">{metrics.completedLessons} lessons completed</p>
      </SectionShell>
      <SectionShell title="Quick actions" eyebrow="Productivity">
        <ul className="list-disc pl-5">
          <li>Resume lesson</li>
          <li>Submit assignment</li>
          <li>Open practice lab</li>
          <li>Share update to community</li>
        </ul>
      </SectionShell>
      <SectionShell title="Recent activity" eyebrow="Timeline">
        <ul className="list-disc pl-5">
          {demoMember.recentActivity.map((activity) => (
            <li key={activity}>{activity}</li>
          ))}
        </ul>
      </SectionShell>
      <SectionShell title="Community activity" eyebrow="Hub Signal">
        Weekly focus topic: <strong>Adaptive decision loops in complex systems</strong>
      </SectionShell>
    </div>
  );
}
