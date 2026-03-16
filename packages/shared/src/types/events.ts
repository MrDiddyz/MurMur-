// Typed event schema for ingestion, agents, and fused output.
export type EventType =
  | "pose"
  | "audio"
  | "midi"
  | "agent_output"
  | "fused_output";

interface BaseEvent<T extends EventType, P> {
  id: string;
  sessionId: string;
  timestamp: number;
  type: T;
  payload: P;
}

export type PoseEvent = BaseEvent<"pose", { joints: Record<string, [number, number, number]> }>;
export type AudioEvent = BaseEvent<"audio", { bpm: number; energy: number; centroid: number }>;
export type MidiEvent = BaseEvent<"midi", { notes: number[]; velocity: number; channel: number }>;
export type AgentOutputEvent = BaseEvent<"agent_output", { agentId: string; confidence: number; directives: Record<string, number> }>;
export type FusedOutputEvent = BaseEvent<"fused_output", { directives: Record<string, number>; modeWeight: number }>;

export type StudioEvent = PoseEvent | AudioEvent | MidiEvent | AgentOutputEvent | FusedOutputEvent;
