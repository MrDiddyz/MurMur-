export type EventPayload = Record<string, unknown>;

export interface AgentEvent {
  id: string;
  sessionId: string;
  agentId: string;
  type: string;
  payload: EventPayload;
  createdAt: string;
}

export interface EventBus {
  publish(event: Omit<AgentEvent, "id" | "createdAt">): AgentEvent;
  list(sessionId: string): AgentEvent[];
  clear(sessionId: string): void;
}

export class InMemoryEventBus implements EventBus {
  private readonly sessions = new Map<string, AgentEvent[]>();

  publish(event: Omit<AgentEvent, "id" | "createdAt">): AgentEvent {
    const next: AgentEvent = {
      ...event,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };

    const events = this.sessions.get(event.sessionId) ?? [];
    events.push(next);
    this.sessions.set(event.sessionId, events);
    return next;
  }

  list(sessionId: string): AgentEvent[] {
    return [...(this.sessions.get(sessionId) ?? [])];
  }

  clear(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}

export const eventBus = new InMemoryEventBus();
