'use client';

import { useStateBus } from '../core/stateBus';

export function PlayerControls() {
  const { tracks, activeTrackIdx, isPlaying, setIsPlaying } = useStateBus();
  const activeTrack = tracks[activeTrackIdx];

  return (
    <section className="panel controls glass-panel">
      <div>
        <h2 className="neon-text">Now Playing</h2>
        <p>{activeTrack?.name ?? 'No track selected'}</p>
      </div>
      <button className="transport btn-neon" onClick={() => setIsPlaying((prev) => !prev)}>
        <span aria-hidden="true">{isPlaying ? '⏸' : '▶'}</span>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </section>
  );
}
