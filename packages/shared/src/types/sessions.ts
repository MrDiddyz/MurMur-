// Session and mode contracts shared across apps/packages.
export type StudioMode = "ID" | "MIRROR" | "FREE" | "PERFORMANCE_SYNC";

export interface Session {
  id: string;
  artistId: string;
  mode: StudioMode;
  createdAt: string;
  updatedAt: string;
  activeAvatarId: string;
}

export interface SessionMemorySnapshot {
  styleStrength: number;
  rhythmStrength: number;
  physicsStrength: number;
  lastUpdatedAt: string;
}
