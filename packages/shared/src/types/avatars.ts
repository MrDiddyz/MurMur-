// Avatar model and rig targets for motion planning.
export interface AvatarProfile {
  id: string;
  artistId: string;
  displayName: string;
  rigVersion: string;
  defaultStyleProfileId: string;
}

export interface RigTarget {
  joint: string;
  rotation: [number, number, number];
  position?: [number, number, number];
  weight: number;
}

export interface MotionFrame {
  sessionId: string;
  timestamp: number;
  targets: RigTarget[];
}
