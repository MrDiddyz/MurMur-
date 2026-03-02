export const scheduleState = {
  posts: [],
  scheduleHistory: [],
};

export function getNextScheduleAt(hourSlot, now = new Date()) {
  const scheduledAt = new Date(now);
  scheduledAt.setMinutes(0, 0, 0);
  scheduledAt.setHours(hourSlot);

  if (scheduledAt <= now) {
    scheduledAt.setDate(scheduledAt.getDate() + 1);
  }

  return scheduledAt;
}
