export type PerformanceSnapshot = {
  fps: number;
  frameTimeMs: number;
};

export function createPerformanceMonitor() {
  let last = performance.now();
  let fps = 0;

  return {
    tick(): PerformanceSnapshot {
      const now = performance.now();
      const frameTimeMs = now - last;
      last = now;
      fps = frameTimeMs > 0 ? 1000 / frameTimeMs : 0;
      return { fps, frameTimeMs };
    },
  };
}
