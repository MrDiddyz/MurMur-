'use client';

import { useEffect, useRef } from 'react';

export type PerformanceSnapshot = {
  fps: number;
  estimatedMemoryMB: number;
  analyzerLoad: number;
  complexityScale: number;
  fftSize: number;
  smoothing: number;
};

export function usePerformanceMonitor(onSnapshot: (snapshot: PerformanceSnapshot) => void) {
  const rafRef = useRef<number>();
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);

  useEffect(() => {
    const tick = () => {
      frameCountRef.current += 1;
      const now = performance.now();
      const elapsed = now - lastTimeRef.current;

      if (elapsed >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / elapsed);
        frameCountRef.current = 0;
        lastTimeRef.current = now;

        const memory = 'memory' in performance ? ((performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize ?? 0) / (1024 * 1024) : 0;
        const memoryPressure = memory > 0 && memory > 350;
        const lowFps = fps < 50;

        const complexityScale = lowFps ? 0.55 : 1;
        const analyzerLoad = Math.max(0.15, 1 - fps / 60);
        const fftSize = analyzerLoad > 0.38 ? 512 : 1024;
        const smoothing = analyzerLoad > 0.38 ? 0.86 : 0.75;

        onSnapshot({
          fps,
          estimatedMemoryMB: memory,
          analyzerLoad,
          complexityScale: memoryPressure ? 0.6 : complexityScale,
          fftSize,
          smoothing,
        });
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [onSnapshot]);
}
