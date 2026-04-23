export type PerfSnapshot = {
  fps: number;
  cpuLoad: number;
};

export function getPerfSnapshot(): PerfSnapshot {
  return {
    fps: 58 + Math.round(Math.random() * 4),
    cpuLoad: 22 + Math.round(Math.random() * 11),
  };
}
