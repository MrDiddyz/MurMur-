import type { SongSpec } from "./types";

export function toArrangementPrompt(spec: SongSpec): string {
  return `Create a ${spec.genre} arrangement for ${spec.title} at ${spec.bpm} BPM in ${spec.key}.`;
}
