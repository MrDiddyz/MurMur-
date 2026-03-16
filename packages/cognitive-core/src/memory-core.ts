// Session memory core shared by all agents.
import type { SessionMemorySnapshot } from "@murmur/shared";

export class SessionMemoryCore {
  private store = new Map<string, SessionMemorySnapshot>();

  get(sessionId: string): SessionMemorySnapshot {
    if (!this.store.has(sessionId)) {
      this.store.set(sessionId, {
        styleStrength: 1,
        rhythmStrength: 1,
        physicsStrength: 1,
        lastUpdatedAt: new Date().toISOString()
      });
    }
    return this.store.get(sessionId)!;
  }

  update(sessionId: string, patch: Partial<SessionMemorySnapshot>): SessionMemorySnapshot {
    const current = this.get(sessionId);
    const next = { ...current, ...patch, lastUpdatedAt: new Date().toISOString() };
    this.store.set(sessionId, next);
    return next;
  }
}
