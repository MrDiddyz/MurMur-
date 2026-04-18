// Minimal modular and type-safe event bus.
import type { StudioEvent, EventType } from "./types/events.js";

type EventMap = {
  pose: Extract<StudioEvent, { type: "pose" }>;
  audio: Extract<StudioEvent, { type: "audio" }>;
  midi: Extract<StudioEvent, { type: "midi" }>;
  agent_output: Extract<StudioEvent, { type: "agent_output" }>;
  fused_output: Extract<StudioEvent, { type: "fused_output" }>;
};

type Listener<T extends EventType> = (event: EventMap[T]) => void;

export class TypedEventBus {
  private listeners: Partial<Record<EventType, Array<(event: StudioEvent) => void>>> = {};

  on<T extends EventType>(type: T, listener: Listener<T>): () => void {
    const stack = (this.listeners[type] ??= [] as Array<(event: StudioEvent) => void>);
    stack.push(listener as (event: StudioEvent) => void);
    return () => {
      this.listeners[type] = stack.filter((item) => item !== listener);
    };
  }

  emit(event: StudioEvent): void {
    const stack = this.listeners[event.type];
    stack?.forEach((listener) => listener(event));
  }
}
