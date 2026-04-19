import { NextResponse } from 'next/server';
import { demoLessonProgress } from '@/lib/murmur/mock-data';
import { calculateProgressMetrics } from '@/lib/murmur/progression';

export async function GET(_: Request, { params }: { params: { userId: string } }) {
  const userProgress = demoLessonProgress.filter((entry) => entry.userId === params.userId);
  const metrics = calculateProgressMetrics(userProgress, 24);

  const isEligible = metrics.completionPercentage >= 70 && metrics.milestoneCount >= 3;

  return NextResponse.json({
    userId: params.userId,
    eligible: isEligible,
    reason: isEligible ? 'Requirements met.' : 'Complete more lessons and milestones before applying.',
    metrics,
  });
}
