export type MurmurEventType = "archive_created" | "signal_generated" | "council_completed" | "report_generated" | "dashboard_viewed";

export type MurmurEvent = {
  event_id: string;
  type: MurmurEventType;
  source: string;
  timestamp: string;
  user_id: string;
  payload: Record<string, unknown>;
};

const inMemoryEvents: MurmurEvent[] = [];

export function logEvent(event: MurmurEvent): MurmurEvent {
  inMemoryEvents.unshift(event);
  return event;
}

export function getEvents(): MurmurEvent[] {
  return inMemoryEvents;
}
