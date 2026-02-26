"use client";

import { useEffect, useMemo, useRef } from "react";

import { createPerformanceMonitor } from "../core/performanceMonitor";
import { createStateBus } from "../core/stateBus";
import { drawVisualFrame } from "../core/visualEngine";

type Props = {
  analyser: AnalyserNode | null;
  images: HTMLImageElement[];
  isPlaying: boolean;
};

export default function VisualCanvas({ analyser, images, isPlaying }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const fft = useMemo(() => ({ freq: new Uint8Array(2048), time: new Uint8Array(2048) }), []);
  const monitor = useMemo(() => createPerformanceMonitor(), []);
  const bus = useMemo(() => createStateBus<{ fps: number }>(), []);

  useEffect(() => {
    const unsub = bus.subscribe(() => {
      // Extension hook for diagnostics overlays.
    });

    let raf = 0;
    const draw = () => {
      const c = canvasRef.current;
      const ctx = c?.getContext("2d");
      if (!c || !ctx) {
        raf = requestAnimationFrame(draw);
        return;
      }

      const w = c.clientWidth;
      const h = c.clientHeight;
      if (c.width !== Math.floor(w * devicePixelRatio) || c.height !== Math.floor(h * devicePixelRatio)) {
        c.width = Math.floor(w * devicePixelRatio);
        c.height = Math.floor(h * devicePixelRatio);
        ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      }

      drawVisualFrame(ctx, { analyser, images, isPlaying, width: w, height: h }, fft);
      bus.emit({ fps: monitor.tick().fps });

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      unsub();
    };
  }, [analyser, images, isPlaying, fft, monitor, bus]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "520px", display: "block" }} />;
}
