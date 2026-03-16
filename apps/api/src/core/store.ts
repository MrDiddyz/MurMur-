// In-memory MVP store for sessions/events and profile data.
import type { Session, StudioEvent } from "@murmur/shared";

export const db = {
  sessions: new Map<string, Session>(),
  events: [] as StudioEvent[],
  styleProfiles: new Map<string, Record<string, unknown>>()
};
