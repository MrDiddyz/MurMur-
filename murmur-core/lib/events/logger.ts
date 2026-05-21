export type MurmurEvent = { event_id: string; type: string; source: string; timestamp: string; user_id: string; payload: Record<string, unknown> };
const eventStore: MurmurEvent[] = [];
export function logEvent(event: MurmurEvent) { eventStore.unshift(event); }
export function getEvents() { return eventStore; }
