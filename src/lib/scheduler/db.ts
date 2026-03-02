export type SchedulerDb = {
  query: <T = Record<string, unknown>>(_sql: string, _params?: unknown[]) => Promise<{ rows: T[] }>;
};

export function getDb(): SchedulerDb {
  const db = (globalThis as { __MURMUR_SCHEDULER_DB__?: SchedulerDb }).__MURMUR_SCHEDULER_DB__;
  if (!db) {
    throw new Error("Scheduler DB adapter is not configured");
  }
  return db;
}
