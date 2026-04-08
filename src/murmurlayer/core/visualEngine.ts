'use client';

import { useEffect, useRef } from 'react';
import { SceneManager } from "./SceneManager";
import type { AudioMetrics, ImageItem } from './stateBus';

export type VisualQuality = {
  sliceCount: number;
  glowLayers: number;
  skipWarpEveryOtherFrame: boolean;
};

const DEFAULT_QUALITY: VisualQuality = {
  sliceCount: 42,
  glowLayers: 4,
  skipWarpEveryOtherFrame: false,
};

export function useVisualEngine({
  canvas,
  images,
  metrics,
  quality,
}: {
  canvas: HTMLCanvasElement | null;
  images: ImageItem[];
  metrics: AudioMetrics;
  quality: Partial<VisualQuality>;
}) {
  const sceneManagerRef = useRef<SceneManager>(new SceneManager());

  useEffect(() => {
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const devicePixelRatio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = Math.floor(width * devicePixelRatio);
    canvas.height = Math.floor(height * devicePixelRatio);
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const sceneManager = sceneManagerRef.current;
    const selected = images.length > 0 ? images[0] : null;
    const resolvedQuality = { ...DEFAULT_QUALITY, ...quality };

    const draw = () => {
      const frame = sceneManager.nextFrame();
      const frameImage = images.length > 0 ? images[frame % images.length] : selected;
      const { bassEnergy, midEnergy, trebleEnergy, rms } = metrics;
      const speed = 0.9 + rms * 1.8;
      const time = performance.now() * 0.001 * speed;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';

      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, `rgba(34, 8, 2, ${0.7 + bassEnergy * 0.2})`);
      gradient.addColorStop(0.5, `rgba(107, 74, 34, ${0.6 + midEnergy * 0.2})`);
      gradient.addColorStop(1, `rgba(8, 13, 24, ${0.8 + trebleEnergy * 0.15})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      if (frameImage?.bitmap) {
        const shouldWarp = !resolvedQuality.skipWarpEveryOtherFrame || frame % 2 === 0;
        const slices = Math.max(6, Math.round(resolvedQuality.sliceCount));
        const sliceHeight = height / slices;

        for (let i = 0; i < slices; i += 1) {
          const y = i * sliceHeight;
          const warpShift = shouldWarp ? Math.sin(time * 2.4 + i * 0.34 + midEnergy * 4) * (16 + bassEnergy * 44) : 0;

          ctx.drawImage(
            frameImage.bitmap,
            0,
            (frameImage.bitmap.height / slices) * i,
            frameImage.bitmap.width,
            frameImage.bitmap.height / slices,
            warpShift,
            y,
            width,
            sliceHeight + 1,
          );
        }
      }

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate((time * 0.24 + midEnergy * 0.7) % (Math.PI * 2));
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < resolvedQuality.glowLayers; i += 1) {
        const radius = 60 + i * 42 + bassEnergy * 140;
        const alpha = 0.12 + trebleEnergy * 0.2 - i * 0.01;
        ctx.beginPath();
        ctx.fillStyle = `rgba(125, 244, 255, ${Math.max(0.03, alpha)})`;
        ctx.arc(Math.sin(time + i) * 30, Math.cos(time * 0.8 + i) * 18, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      ctx.globalCompositeOperation = 'screen';
      ctx.strokeStyle = `rgba(250, 234, 180, ${0.3 + trebleEnergy * 0.6})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(4, 4, width - 8, height - 8);

      sceneManager.schedule(draw);
    };

    sceneManager.schedule(draw);

    return () => {
      sceneManager.cancel();
    };
  }, [canvas, images, metrics, quality]);
}
