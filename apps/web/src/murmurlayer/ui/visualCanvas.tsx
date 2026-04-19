'use client';

import { useEffect, useRef } from 'react';
import { useVisualEngine, type VisualQuality } from '../core/visualEngine';
import { useStateBus } from '../core/stateBus';

export function VisualCanvas({ quality }: { quality: Partial<VisualQuality> }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { images, metrics, setImageBitmap } = useStateBus();

  useEffect(() => {
    images.forEach((image) => {
      if (image.bitmap) {
        return;
      }
      const decode = async () => {
        const bitmap = await createImageBitmap(image.file, { resizeQuality: 'high' });
        setImageBitmap(image.id, bitmap);
      };
      void decode();
    });
  }, [images, setImageBitmap]);

  useVisualEngine({
    canvas: canvasRef.current,
    images,
    metrics,
    quality,
  });

  return (
    <section className="murmur-panel visual">
      <h3>Psycho Reactive Visualizer</h3>
      <p className="murmur-muted">Bass → pulse · Mid → swirl · Treble → glow · RMS → motion speed</p>
      <canvas ref={canvasRef} className="murmur-canvas" />
      <div className="murmur-metrics">
        <span>Bass {metrics.bassEnergy.toFixed(2)}</span>
        <span>Mid {metrics.midEnergy.toFixed(2)}</span>
        <span>Treble {metrics.trebleEnergy.toFixed(2)}</span>
        <span>RMS {metrics.rms.toFixed(2)}</span>
      </div>
    </section>
  );
}
