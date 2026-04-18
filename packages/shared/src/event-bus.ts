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
  private listeners: { [K in EventType]?: Listener<K>[] } = {};

  on<T extends EventType>(type: T, listener: Listener<T>): () => void {
    const stack = (this.listeners[type] ?? []) as Listener<T>[];
    stack.push(listener);
    this.listeners[type] = stack as (typeof this.listeners)[T];
    return () => {
      const current = (this.listeners[type] ?? []) as Listener<T>[];
      this.listeners[type] = current.filter((item) => item !== listener) as (typeof this.listeners)[T];
    };
  }

  emit(event: StudioEvent): void {
    const stack = this.listeners[event.type] as Listener<typeof event.type>[] | undefined;
    stack?.forEach((listener) => listener(event as EventMap[typeof event.type]));
  }
}
