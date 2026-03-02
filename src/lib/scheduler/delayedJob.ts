export function getPublishDelayMs(scheduledAt: Date, now = new Date()): number {
  return Math.max(0, scheduledAt.getTime() - now.getTime());
}
