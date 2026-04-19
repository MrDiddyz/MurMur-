// @murmur/music-core — shared music primitives

export interface Track {
  id: string;
  title: string;
  artist: string;
  bpm?: number;
  key?: string;
  durationMs?: number;
}

export interface Beat {
  bpm: number;
  timeSignature: [number, number];
  swing?: number;
}

export interface MusicContext {
  currentTrack?: Track;
  beat?: Beat;
  mood?: string;
  energy?: number; // 0–1
}

export function createBeat(bpm: number, timeSignature: [number, number] = [4, 4]): Beat {
  return { bpm, timeSignature };
}

export function normaliseBpm(bpm: number): number {
  // Keep BPM in reasonable range 60–200
  if (bpm < 60) return bpm * 2;
  if (bpm > 200) return bpm / 2;
  return bpm;
}
