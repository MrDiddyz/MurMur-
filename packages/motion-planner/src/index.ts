// Translates fused directives into avatar rig targets.
import type { MotionFrame, RigTarget } from "@murmur/shared";
import type { FusedOutput } from "@murmur/cognitive-core";

export function planMotionFrame(sessionId: string, fused: FusedOutput): MotionFrame {
  const targets: RigTarget[] = Object.entries(fused.directives).map(([name, value], i) => ({
    joint: `joint_${i}_${name}`,
    rotation: [value * 0.1, value * 0.2, value * 0.3],
    weight: Math.min(1, Math.abs(value))
  }));

  return {
    sessionId,
    timestamp: Date.now(),
    targets
  };
}
