'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAudioEngine } from '../core/audioEngine';
import { usePerformanceMonitor } from '../core/performanceMonitor';
import { StateBusProvider, useStateBus } from '../core/stateBus';
import { EqPanel } from '../ui/eqPanel';
import { PlayerControls } from '../ui/playerControls';
import { Playlist } from '../ui/playlist';
import { UploadPanel } from '../ui/uploadPanel';
import { VisualCanvas } from '../ui/visualCanvas';

function MurmurLayerShell() {
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const { tracks, playback, eqBands, setMetrics, setPerformance, performance, trimOldestImage } = useStateBus();

  const activeTrack = useMemo(() => tracks.find((track) => track.id === playback.activeTrackId) ?? null, [tracks, playback.activeTrackId]);

  const audioEngine = useAudioEngine({
    audioElement,
    activeTrack,
    isPlaying: playback.isPlaying,
    eqBands,
    onMetrics: setMetrics,
  });


  useEffect(() => {
    if (performance.estimatedMemoryMB > 350) {
      trimOldestImage();
    }
  }, [performance.estimatedMemoryMB, trimOldestImage]);

  usePerformanceMonitor((snapshot) => {
    setPerformance({
      fps: snapshot.fps,
      estimatedMemoryMB: snapshot.estimatedMemoryMB,
      analyzerLoad: snapshot.analyzerLoad,
      complexityScale: snapshot.complexityScale,
    });
    audioEngine.setAnalyzerQuality(snapshot.fftSize, snapshot.smoothing);
  });

  return (
    <main className="murmur-shell">
      <header className="murmur-panel hero">
        <p className="tag">MurMurLayer</p>
        <h1>Psycho Reactive Audio Visual Player</h1>
        <p>Winamp-inspired modular engine with shared state bus, 10-band EQ, playlist sequencing, and leopard skin chrome.</p>
        <Link href="/" className="murmur-back">
          ← Back home
        </Link>
      </header>

      <div className="murmur-grid">
        <UploadPanel />
        <PlayerControls onAudioReady={setAudioElement} />
        <Playlist />
        <EqPanel />
      </div>

      <VisualCanvas
        quality={{
          sliceCount: Math.round(42 * performance.complexityScale),
          glowLayers: Math.max(2, Math.round(4 * performance.complexityScale)),
          skipWarpEveryOtherFrame: performance.fps < 50,
        }}
      />

      <section className="murmur-panel">
        <h3>Performance Monitor</h3>
        <div className="murmur-metrics">
          <span>FPS {performance.fps}</span>
          <span>Memory {performance.estimatedMemoryMB.toFixed(1)} MB</span>
          <span>Analyzer Load {performance.analyzerLoad.toFixed(2)}</span>
          <span>Complexity x{performance.complexityScale.toFixed(2)}</span>
        </div>
      </section>
    </main>
  );
}

export default function MurmurLayerPage() {
  return (
    <StateBusProvider>
      <MurmurLayerShell />
    </StateBusProvider>
  );
}
