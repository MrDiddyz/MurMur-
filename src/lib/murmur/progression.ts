import type { LessonProgress } from '@/lib/murmur/domain';

export interface ProgressMetrics {
  completionPercentage: number;
  streakDays: number;
  milestoneCount: number;
  completedLessons: number;
  totalLessons: number;
}

export function calculateProgressMetrics(progress: LessonProgress[], totalLessons: number): ProgressMetrics {
  const completedLessons = progress.filter((entry) => entry.completed).length;
  const completionPercentage = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
  const milestoneCount = Math.floor(completedLessons / 5);
  const streakDays = estimateLearningStreak(progress);

  return {
    completionPercentage,
    streakDays,
    milestoneCount,
    completedLessons,
    totalLessons,
  };
}

function estimateLearningStreak(progress: LessonProgress[]): number {
  const completionDates = progress
    .filter((entry) => entry.completedAt)
    .map((entry) => new Date(entry.completedAt as string))
    .sort((a, b) => b.getTime() - a.getTime());

  if (completionDates.length === 0) {
    return 0;
  }

  let streak = 1;
  for (let i = 0; i < completionDates.length - 1; i += 1) {
    const current = completionDates[i];
    const previous = completionDates[i + 1];
    const diff = Math.round((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));

    if (diff <= 1) {
      streak += 1;
      continue;
    }

    break;
  }

  return streak;
}
