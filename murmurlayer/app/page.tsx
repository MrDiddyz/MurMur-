'use client';

import { useEffect, useState } from 'react';
import { getPerfSnapshot } from '../core/performanceMonitor';
import { useStateBus } from '../core/stateBus';
import { EqPanel } from '../ui/eqPanel';
import { PlayerControls } from '../ui/playerControls';
import { Playlist } from '../ui/playlist';
import { UploadPanel } from '../ui/uploadPanel';
import { VisualCanvas } from '../ui/visualCanvas';

export default function HomePage() {
  const { performanceRef } = useStateBus();
  const [, setPerfTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const perf = getPerfSnapshot();
      performanceRef.current = {
        fps: perf.fps,
        quality: Math.max(0.5, Math.min(1, perf.fps / 60)),
      };
      setPerfTick((value) => value + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [performanceRef]);

  return (
    <main className="workspace">
      <header className="workspace-header glass-panel panel">
        <h1 className="neon-text">MurmurLayer</h1>
        <p>
          FPS {performanceRef.current.fps} • Quality {(performanceRef.current.quality * 100).toFixed(0)}%
        </p>
      </header>

      <div className="workspace-grid">
        <Playlist />
        <VisualCanvas />
        <EqPanel />
        <UploadPanel />
      </div>

      <PlayerControls />
    </main>
  );
}
