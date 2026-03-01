export type Genre = "pop" | "hip-hop" | "classical" | "electronic";

export interface SongSpec {
  title: string;
  bpm: number;
  key: string;
  genre: Genre;
}

export interface ScheduleSlot {
  section: string;
  bars: number;
}
