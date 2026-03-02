export type SchedulablePost = {
  id: string;
  accountId: string;
  createdAt: Date;
  priorityScore?: number;
};

export type ScheduleCandidate = {
  scheduledAt: Date;
  reason: string;
  priorityScore: number;
};

const BEST_WINDOW_START = 18;
const BEST_WINDOW_END = 21;
const AVOID_WINDOW_START = 2;
const AVOID_WINDOW_END = 6;

export function calculatePriorityScore(post: SchedulablePost, now = new Date()): number {
  const ageHours = Math.max(0, (now.getTime() - post.createdAt.getTime()) / (1000 * 60 * 60));
  const ageBoost = Math.min(10, ageHours / 6);
  return Number(((post.priorityScore ?? 0) + ageBoost).toFixed(2));
}

function nextPreferredHour(base: Date): Date {
  const next = new Date(base);
  const hour = next.getHours();

  if (hour >= BEST_WINDOW_START && hour < BEST_WINDOW_END) {
    return next;
  }

  next.setMinutes(0, 0, 0);
  if (hour < BEST_WINDOW_START) {
    next.setHours(BEST_WINDOW_START);
  } else {
    next.setDate(next.getDate() + 1);
    next.setHours(BEST_WINDOW_START);
  }

  return next;
}

function inAvoidWindow(date: Date): boolean {
  const hour = date.getHours();
  return hour >= AVOID_WINDOW_START && hour < AVOID_WINDOW_END;
}

export function spreadWithinHour(slot: Date, postsAlreadyScheduledInHour: number): Date {
  const spread = [0, 12, 24, 36, 48];
  const withSpread = new Date(slot);
  withSpread.setMinutes(spread[postsAlreadyScheduledInHour % spread.length], 0, 0);
  return withSpread;
}

export function enforceHourlyRateLimit(slot: Date, scheduledCountForHour: number, maxPerHour = 5): Date {
  if (scheduledCountForHour < maxPerHour) {
    return slot;
  }

  const shifted = new Date(slot);
  shifted.setHours(shifted.getHours() + 1, 0, 0, 0);
  if (inAvoidWindow(shifted)) {
    shifted.setHours(AVOID_WINDOW_END, 0, 0, 0);
  }
  return shifted;
}

export function optimizeScheduleTime(input: {
  now?: Date;
  requested?: Date;
  existingInHourCount: number;
  accountHourlyCount: number;
  post: SchedulablePost;
}): ScheduleCandidate {
  const now = input.now ?? new Date();
  const base = input.requested && input.requested > now ? input.requested : now;

  let candidate = nextPreferredHour(base);
  if (inAvoidWindow(candidate)) {
    candidate.setHours(AVOID_WINDOW_END, 0, 0, 0);
  }

  candidate = enforceHourlyRateLimit(candidate, input.accountHourlyCount);
  candidate = spreadWithinHour(candidate, input.existingInHourCount);

  return {
    scheduledAt: candidate,
    reason: input.requested ? "manual_or_adjusted" : "auto_optimized_v1",
    priorityScore: calculatePriorityScore(input.post, now),
  };
}
